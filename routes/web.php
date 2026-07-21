<?php

use App\Enums\JenisLayanan;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PermohonanController;
use App\Http\Controllers\WhatsAppConnectionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes (Halaman Depan / Welcome)
|--------------------------------------------------------------------------
*/

Route::get('/', HomeController::class)->name('home');

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

    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Admin Management (Super Admin Only)
    Route::middleware(['superadmin'])->group(function () {
        Route::resource('admin', AdminController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
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
    Route::middleware(['admin'])->group(function () {
        Route::get('/documents/kuitansi', [DocumentController::class, 'index'])->defaults('category', JenisLayanan::Kuitansi->value)->name('documents.kuitansi');
        Route::get('/documents/rl', [DocumentController::class, 'index'])->defaults('category', JenisLayanan::RisalahLelang->value)->name('documents.rl');
        Route::get('/documents/validasi-pph', [DocumentController::class, 'index'])->defaults('category', JenisLayanan::ValidasiPph->value)->name('documents.validasi-pph');

        // 2. Action (Satu pintu untuk Create)
        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');

        Route::patch('/permohonan/{permohonan}', [PermohonanController::class, 'update'])->name('permohonan.update');
        Route::delete('/permohonan/{permohonan}', [PermohonanController::class, 'destroy'])->name('permohonan.destroy');
        Route::post('/permohonan/{permohonan}/send-invalid-notification', [PermohonanController::class, 'sendInvalidNotification'])->name('permohonan.send-invalid-notification');
        Route::post('/whatsapp-notifications/{notification}/retry', [PermohonanController::class, 'retryWhatsAppNotification'])->name('whatsapp-notifications.retry');
        Route::get('/admin/whatsapp', [WhatsAppConnectionController::class, 'index'])->name('whatsapp.connection.index');
        Route::get('/admin/whatsapp/status', [WhatsAppConnectionController::class, 'status'])->name('whatsapp.connection.status');
        Route::get('/admin/whatsapp/qr', [WhatsAppConnectionController::class, 'qr'])->name('whatsapp.connection.qr');
        Route::get('/admin/whatsapp/pairing-code', [WhatsAppConnectionController::class, 'currentPairingCode'])->name('whatsapp.connection.current-pairing-code');
        Route::post('/admin/whatsapp/pairing-code', [WhatsAppConnectionController::class, 'pairingCode'])->name('whatsapp.connection.pairing-code');
        Route::post('/admin/whatsapp/reconnect', [WhatsAppConnectionController::class, 'reconnect'])->name('whatsapp.connection.reconnect');
        Route::get('/permohonan/{permohonan}/file/{field}', [PermohonanController::class, 'downloadFile'])->name('permohonan.file');
    });

});

require __DIR__.'/settings.php';
