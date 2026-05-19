<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            if (! Schema::hasColumn('doclang_proses', 'peran_pemohon')) {
                $table->string('peran_pemohon')->default('pemenang');
            }

            if (! Schema::hasColumn('doclang_proses', 'dokumen_identitas_pemohon_path')) {
                $table->string('dokumen_identitas_pemohon_path')->nullable();
            }

            if (! Schema::hasColumn('doclang_proses', 'dokumen_identitas_pemberi_kuasa_path')) {
                $table->string('dokumen_identitas_pemberi_kuasa_path')->nullable();
            }

            if (! Schema::hasColumn('doclang_proses', 'surat_kuasa_path')) {
                $table->string('surat_kuasa_path')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            if (Schema::hasColumn('doclang_proses', 'peran_pemohon')) {
                $table->dropColumn('peran_pemohon');
            }

            if (Schema::hasColumn('doclang_proses', 'dokumen_identitas_pemohon_path')) {
                $table->dropColumn('dokumen_identitas_pemohon_path');
            }

            if (Schema::hasColumn('doclang_proses', 'dokumen_identitas_pemberi_kuasa_path')) {
                $table->dropColumn('dokumen_identitas_pemberi_kuasa_path');
            }

            if (Schema::hasColumn('doclang_proses', 'surat_kuasa_path')) {
                $table->dropColumn('surat_kuasa_path');
            }
        });
    }
};
