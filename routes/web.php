<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PermohonanController;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Public Routes (Halaman Depan / Welcome)
|--------------------------------------------------------------------------
*/

Route::get('/', function (Request $request) {
    $search = $request->input('search');
    $target_category = $request->input('category');

    // 1. Cari Kuitansi
    $document = ($search && $target_category === 'kuitansi')
        ? Document::where('nomor_pengajuan', $search)->where('category', 'kuitansi')->first()
        : null;

    // 2. Cari Kutipan RL
    $document_rl = ($search && $target_category === 'kutipan_rl')
        ? Document::where('nomor_pengajuan', $search)->where('category', 'kutipan_rl')->first()
        : null;

    // 3. Cari Validasi PPh
    $document_validasi = ($search && $target_category === 'validasi_pph')
        ? Document::where('nomor_pengajuan', $search)->where('category', 'validasi_pph')->first()
        : null;

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'statistics' => App\Http\Controllers\DocumentController::getStatistics(),
        'document' => $document,
        'search' => $target_category === 'kuitansi' ? $search : null,
        'document_rl' => $document_rl,
        'search_rl' => $target_category === 'kutipan_rl' ? $search : null,
        'document_validasi' => $document_validasi,
        'search_validasi' => $target_category === 'validasi_pph' ? $search : null,
    ]);
})->name('home');

Route::get('/persyaratan', function () {
    return Inertia::render('persyaratan');
});
Route::get('/form', function () {
    return Inertia::render('form');
});
Route::post('/permohonan/store', [PermohonanController::class, 'store'])->name('permohonan.store');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Dashboard & Admin Management)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard Utama
    Route::get('/dashboard', function () {
        $documentStats = DocumentController::getStatistics();
        $admins = User::whereIn('role', ['super_admin', 'admin'])
            ->orderByRaw("CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'is_active']);

        return Inertia::render('dashboard', [
            'admins' => $admins,
            'stats' => [
                'super_admin' => User::where('role', 'super_admin')->count(),
                'admin' => User::where('role', 'admin')->count(),
                'total' => User::whereIn('role', ['super_admin', 'admin'])->count(),
            ],
            'statistics' => $documentStats,
            'docStats' => $documentStats['kuitansi'],
            'docStatsKutipan' => $documentStats['kutipan_rl'],
            'docStatsValidasi' => $documentStats['validasi_pph'],
            'todayDocumentTotal' => Document::whereDate('created_at', today())->count(),
        ]);
    })->name('dashboard');

    // Admin Management (Super Admin Only)
    Route::middleware(['superadmin'])->group(function () {
        Route::resource('admin', AdminController::class);
        Route::patch('/admin/{user}/toggle-status', [AdminController::class, 'toggleStatus'])->name('admin.toggle-status');

        // Redirect link lama agar tidak broken
        Route::get('/manajemen', fn () => redirect('/admin'));
    });

    /*
    |--------------------------------------------------------------------------
    | Document Management (Unified Controller)
    |--------------------------------------------------------------------------
    */

    // 1. Menu Navigasi (Halaman List)
    Route::get('/documents/kuitansi', [DocumentController::class, 'index'])->defaults('category', 'kuitansi')->name('documents.kuitansi');
    Route::get('/documents/rl', [DocumentController::class, 'index'])->defaults('category', 'kutipan_rl')->name('documents.rl');
    Route::get('/documents/validasi-pph', [DocumentController::class, 'index'])->defaults('category', 'validasi_pph')->name('documents.validasi-pph');

    // 2. Action (Satu pintu untuk Create, Update, Delete)
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::patch('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::patch('/permohonan/{permohonan}', [PermohonanController::class, 'update'])->name('permohonan.update');
    Route::delete('/permohonan/{permohonan}', [PermohonanController::class, 'destroy'])->name('permohonan.destroy');

});

require __DIR__.'/settings.php';
