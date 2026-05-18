<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doclang_proses', function (Blueprint $table): void {
            $table->id();
            $table->string('kode_lot_lelang');
            $table->string('id_pengajuan')->unique();
            $table->date('tanggal_masuk_pengambilan_dokumen');
            $table->string('nama_pemohon');
            $table->string('nomor_wa_pemohon');
            $table->enum('jenis_layanan', [
                'Pemberian Kuitansi Pembayaran',
                'Pemberian Kutipan Risalah Lelang',
                'Validasi PPh',
            ]);
            $table->string('nomor_dokumen')->nullable();
            $table->date('tanggal_dokumen')->nullable();
            $table->string('bukti_pelunasan_path')->nullable();
            $table->enum('status_proses', ['proses', 'siap_diambil', 'selesai', 'tidak_valid'])->default('proses');
            $table->text('catatan_tidak_valid')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doclang_proses');
    }
};
