<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('doclang_proses', 'tanggal_masuk_pengambilan_dokumen')) {
            Schema::table('doclang_proses', function (Blueprint $table): void {
                $table->date('tanggal_masuk_pengambilan_dokumen')->nullable()->after('id_pengajuan');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('doclang_proses', 'tanggal_masuk_pengambilan_dokumen')) {
            Schema::table('doclang_proses', function (Blueprint $table): void {
                $table->dropColumn('tanggal_masuk_pengambilan_dokumen');
            });
        }
    }
};
