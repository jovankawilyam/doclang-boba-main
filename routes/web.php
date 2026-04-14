<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DocumentController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

Route::get('/dashboard2', function () {
    return Inertia::render('Dashboard2');
});

Route::get('/', function (\Illuminate\Http\Request $request) {
    // Support two independent public searches on the welcome page:
    // - nomor_pengajuan => Dokumen (kuitansi)
    // - nomor_kutipan  => Kutipan RL
    $search = $request->input('nomor_pengajuan');
    $document = $search ? \App\Models\Document::where('nomor_pengajuan', $search)->where('category', 'kuitansi')->first() : null;

    $search_rl = $request->input('nomor_kutipan');
    $document_rl = $search_rl ? \App\Models\Document::where('nomor_pengajuan', $search_rl)->where('category', 'kutipan_rl')->first() : null;

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'document' => $document,
        'search' => $search,
        'document_rl' => $document_rl,
        'search_rl' => $search_rl,
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $admins = User::whereIn('role', ['super_admin', 'admin'])
            ->orderByRaw("CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'is_active']);

        $stats = [
            'super_admin' => User::where('role', 'super_admin')->count(),
            'admin'       => User::where('role', 'admin')->count(),
            'total'       => User::whereIn('role', ['super_admin', 'admin'])->count(),
        ];

        // Stats Dokumen
        $docStats = [
            'total' => \App\Models\Document::count(),
            'siap_diambil' => \App\Models\Document::where('status_proses', 'siap_diambil')->count(),
            'proses' => \App\Models\Document::where('status_proses', 'proses')->count(),
            'selesai' => \App\Models\Document::where('status_proses', 'selesai')->count(),
        ];

        // Stats Dokumen Kutipan RL (separate category)
        $docStatsKutipan = [
            'total' => \App\Models\Document::where('category', 'kutipan_rl')->count(),
            'siap_diambil' => \App\Models\Document::where('category', 'kutipan_rl')->where('status_proses', 'siap_diambil')->count(),
            'proses' => \App\Models\Document::where('category', 'kutipan_rl')->where('status_proses', 'proses')->count(),
            'selesai' => \App\Models\Document::where('category', 'kutipan_rl')->where('status_proses', 'selesai')->count(),
        ];

        // Stats Dokumen Validasi PPh (separate category)
        $docStatsValidasi = [
            'total' => \App\Models\Document::where('category', 'validasi_pph')->count(),
            'siap_diambil' => \App\Models\Document::where('category', 'validasi_pph')->where('status_proses', 'siap_diambil')->count(),
            'proses' => \App\Models\Document::where('category', 'validasi_pph')->where('status_proses', 'proses')->count(),
            'selesai' => \App\Models\Document::where('category', 'validasi_pph')->where('status_proses', 'selesai')->count(),
        ];

        return Inertia::render('dashboard', compact('admins', 'stats', 'docStats', 'docStatsKutipan', 'docStatsValidasi'));
    })->name('dashboard');

    // Admin Management (Super Admin Only)
    Route::middleware(['superadmin'])->group(function () {
        Route::get('/admin', [AdminController::class, 'index'])->name('admin.index');
        Route::get('/admin/create', [AdminController::class, 'create'])->name('admin.create');
        Route::post('/admin', [AdminController::class, 'store'])->name('admin.store');
        Route::patch('/admin/{user}/toggle-status', [AdminController::class, 'toggleStatus'])->name('admin.toggle-status');
        Route::delete('/admin/{user}', [AdminController::class, 'destroy'])->name('admin.destroy');
    });

    // Keep old /manajemen and /menajemen links working by redirecting to the
    // canonical /admin routes. We avoid registering duplicate named routes so
    // the Wayfinder generator won't create colliding TypeScript exports.
    Route::middleware(['superadmin'])->group(function () {
        Route::get('/manajemen', function () { return redirect('/admin'); });
        Route::get('/menajemen', function () { return redirect('/admin/create'); });
    });

    // Document Management (All Admins)
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::patch('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Validasi PPh - support search and creation for category 'validasi_pph'
    Route::get('/validasi-pph', function (\Illuminate\Http\Request $request) {
        $search = $request->input('search');

        // Query real documents in the validasi_pph category. If none exist in DB,
        // the page will simply show an empty list until items are created.
        $documentsQuery = \App\Models\Document::where('category', 'validasi_pph')
            ->when($search, function ($q, $search) {
                $q->where('nomor_pengajuan', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc');

        $documents = $documentsQuery->paginate(15)->withQueryString();

        return Inertia::render('documents/validasi-pph', [
            'documents' => $documents,
            'filters' => ['search' => $search],
        ]);
    })->name('validasi.pph');

    // Allow admins to create Validasi PPh documents via a dedicated endpoint so
    // we don't mix categories in the generic DocumentController (which is for
    // 'kuitansi'). This keeps Validasi PPh creation scoped-only to this route.
    Route::post('/validasi-pph', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'nomor_pengajuan' => ['required', 'string', 'unique:documents,nomor_pengajuan', 'regex:/^\\d+\/PPh\/2026$/'],
            'status_proses' => 'required|in:proses,siap_diambil,selesai',
            'catatan' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['category'] = 'validasi_pph';

        \App\Models\Document::create($validated);

        // Redirect back to the validasi-pph page so the frontend can show the
        // newly created item in its search/list (no cross-category side-effects).
        return redirect()->route('validasi.pph')->with('success', 'Validasi PPh berhasil ditambahkan.');
    })->name('validasi.pph.store');

    // Document Management for Kutipan RL (All Admins)
    Route::get('/documents/rl', [\App\Http\Controllers\DocumentRLController::class, 'index'])->name('documents.rl.index');
    Route::post('/documents/rl', [\App\Http\Controllers\DocumentRLController::class, 'store'])->name('documents.rl.store');
    Route::patch('/documents/rl/{document}', [\App\Http\Controllers\DocumentRLController::class, 'update'])->name('documents.rl.update');
    Route::delete('/documents/rl/{document}', [\App\Http\Controllers\DocumentRLController::class, 'destroy'])->name('documents.rl.destroy');
});
require __DIR__.'/settings.php';
