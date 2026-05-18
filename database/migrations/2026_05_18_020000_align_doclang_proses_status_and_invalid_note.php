<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('doclang_proses')) {
            return;
        }

        if (! Schema::hasColumn('doclang_proses', 'catatan_tidak_valid')) {
            Schema::table('doclang_proses', function (Blueprint $table): void {
                $table->text('catatan_tidak_valid')->nullable()->after('status_proses');
            });
        }

        $hasLegacyRejectionColumn = Schema::hasColumn('doclang_proses', 'alasan_penolakan');

        if ($hasLegacyRejectionColumn) {
            DB::table('doclang_proses')
                ->whereNotNull('alasan_penolakan')
                ->whereNull('catatan_tidak_valid')
                ->update(['catatan_tidak_valid' => DB::raw('alasan_penolakan')]);
        }

        if (DB::getDriverName() === 'sqlite' && $hasLegacyRejectionColumn) {
            $this->rebuildSqliteTable();

            return;
        }

        DB::table('doclang_proses')->where('status_proses', 'Proses')->update(['status_proses' => 'proses']);
        DB::table('doclang_proses')->where('status_proses', 'Selesai')->update(['status_proses' => 'selesai']);
        DB::table('doclang_proses')->where('status_proses', 'Ditolak')->update(['status_proses' => 'tidak_valid']);

        Schema::table('doclang_proses', function (Blueprint $table): void {
            $table->string('status_proses')->default('proses')->change();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('doclang_proses')) {
            return;
        }

        if (Schema::hasColumn('doclang_proses', 'catatan_tidak_valid')) {
            Schema::table('doclang_proses', function (Blueprint $table): void {
                $table->dropColumn('catatan_tidak_valid');
            });
        }
    }

    private function rebuildSqliteTable(): void
    {
        DB::statement('PRAGMA foreign_keys=OFF');
        DB::statement(<<<'SQL'
            CREATE TABLE doclang_proses_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                kode_lot_lelang VARCHAR NOT NULL,
                id_pengajuan VARCHAR NOT NULL,
                tanggal_masuk_pengambilan_dokumen DATE,
                nama_pemohon VARCHAR NOT NULL,
                nomor_wa_pemohon VARCHAR NOT NULL,
                jenis_layanan VARCHAR NOT NULL,
                nomor_dokumen VARCHAR,
                tanggal_dokumen DATE,
                bukti_pelunasan_path VARCHAR,
                status_proses VARCHAR NOT NULL DEFAULT 'proses',
                catatan_tidak_valid TEXT,
                created_at DATETIME,
                updated_at DATETIME
            )
        SQL);

        DB::statement(<<<'SQL'
            INSERT INTO doclang_proses_new (
                id,
                kode_lot_lelang,
                id_pengajuan,
                tanggal_masuk_pengambilan_dokumen,
                nama_pemohon,
                nomor_wa_pemohon,
                jenis_layanan,
                nomor_dokumen,
                tanggal_dokumen,
                bukti_pelunasan_path,
                status_proses,
                catatan_tidak_valid,
                created_at,
                updated_at
            )
            SELECT
                id,
                kode_lot_lelang,
                id_pengajuan,
                tanggal_masuk_pengambilan_dokumen,
                nama_pemohon,
                nomor_wa_pemohon,
                jenis_layanan,
                nomor_dokumen,
                tanggal_dokumen,
                bukti_pelunasan_path,
                CASE status_proses
                    WHEN 'Proses' THEN 'proses'
                    WHEN 'Selesai' THEN 'selesai'
                    WHEN 'Ditolak' THEN 'tidak_valid'
                    ELSE status_proses
                END,
                COALESCE(catatan_tidak_valid, alasan_penolakan),
                created_at,
                updated_at
            FROM doclang_proses
        SQL);

        DB::statement('DROP TABLE doclang_proses');
        DB::statement('ALTER TABLE doclang_proses_new RENAME TO doclang_proses');
        DB::statement('CREATE UNIQUE INDEX doclang_proses_id_pengajuan_unique ON doclang_proses (id_pengajuan)');
        DB::statement('PRAGMA foreign_keys=ON');
    }
};
