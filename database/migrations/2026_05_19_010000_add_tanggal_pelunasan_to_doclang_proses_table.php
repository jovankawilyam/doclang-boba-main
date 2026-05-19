<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            if (! Schema::hasColumn('doclang_proses', 'tanggal_pelunasan')) {
                $table->date('tanggal_pelunasan')->nullable()->after('jenis_layanan');
            }
        });
    }

    public function down(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            if (Schema::hasColumn('doclang_proses', 'tanggal_pelunasan')) {
                $table->dropColumn('tanggal_pelunasan');
            }
        });
    }
};
