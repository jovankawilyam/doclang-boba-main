<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('documents', function (Blueprint $table) {
        $table->id();
        $table->string('nomor_pengajuan')->unique();
        
        // TAMBAHKAN BARIS INI (Kunci utama agar welcome page jalan)
        $table->enum('category', ['kuitansi', 'kutipan_rl', 'validasi_pph'])->default('kuitansi');
        
        $table->enum('status_proses', ['proses', 'siap_diambil', 'selesai'])->default('proses');
        $table->text('catatan')->nullable();
        $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
