<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DocumentController;
use App\Models\User;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

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

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Dashboard & Admin Management)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard Utama
    Route::get('/dashboard', function () {
        $admins = User::whereIn('role', ['super_admin', 'admin'])
            ->orderByRaw("CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'is_active']);

        return Inertia::render('dashboard', [
            'admins' => $admins,
            'stats' => [
                'super_admin' => User::where('role', 'super_admin')->count(),
                'admin'       => User::where('role', 'admin')->count(),
                'total'       => User::whereIn('role', ['super_admin', 'admin'])->count(),
            ],
            'statistics' => App\Http\Controllers\DocumentController::getStatistics(),
            'docStats' => [
                'total' => Document::where('category', 'kuitansi')->count(),
                'siap_diambil' => Document::where('category', 'kuitansi')->where('status_proses', 'siap_diambil')->count(),
            ],
            'docStatsKutipan' => [
                'total' => Document::where('category', 'kutipan_rl')->count(),
                'siap_diambil' => Document::where('category', 'kutipan_rl')->where('status_proses', 'siap_diambil')->count(),
            ],
            'docStatsValidasi' => [
                'total' => Document::where('category', 'validasi_pph')->count(),
                'siap_diambil' => Document::where('category', 'validasi_pph')->where('status_proses', 'siap_diambil')->count(),
            ],
        ]);
    })->name('dashboard');

    // Admin Management (Super Admin Only)
    Route::middleware(['superadmin'])->group(function () {
        Route::resource('admin', AdminController::class);
        Route::patch('/admin/{user}/toggle-status', [AdminController::class, 'toggleStatus'])->name('admin.toggle-status');
        
        // Redirect link lama agar tidak broken
        Route::get('/manajemen', fn() => redirect('/admin'));
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

});

require __DIR__.'/settings.php';