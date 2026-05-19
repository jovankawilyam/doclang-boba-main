<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            if (! Schema::hasColumn('doclang_proses', 'jenis_objek_risalah')) {
                $table->string('jenis_objek_risalah')->nullable()->after('tanggal_pelunasan');
            }

            if (! Schema::hasColumn('doclang_proses', 'bukti_validasi_sspd_bphtb_path')) {
                $table->string('bukti_validasi_sspd_bphtb_path')->nullable()->after('bukti_pelunasan_path');
            }

            if (! Schema::hasColumn('doclang_proses', 'kuitansi_pembayaran_harga_lelang_path')) {
                $table->string('kuitansi_pembayaran_harga_lelang_path')->nullable()->after('bukti_validasi_sspd_bphtb_path');
            }

            if (! Schema::hasColumn('doclang_proses', 'nomor_kuitansi_pembayaran_harga_lelang')) {
                $table->string('nomor_kuitansi_pembayaran_harga_lelang')->nullable()->after('kuitansi_pembayaran_harga_lelang_path');
            }

            if (! Schema::hasColumn('doclang_proses', 'nomor_objek_pajak')) {
                $table->string('nomor_objek_pajak')->nullable()->after('nomor_kuitansi_pembayaran_harga_lelang');
            }

            if (! Schema::hasColumn('doclang_proses', 'slip_setor_pbb_atau_bphtb_path')) {
                $table->string('slip_setor_pbb_atau_bphtb_path')->nullable()->after('nomor_objek_pajak');
            }

            if (! Schema::hasColumn('doclang_proses', 'alamat_objek_lelang')) {
                $table->text('alamat_objek_lelang')->nullable()->after('slip_setor_pbb_atau_bphtb_path');
            }

            if (! Schema::hasColumn('doclang_proses', 'ntpn')) {
                $table->string('ntpn')->nullable()->after('alamat_objek_lelang');
            }

            if (! Schema::hasColumn('doclang_proses', 'slip_setor_pph_path')) {
                $table->string('slip_setor_pph_path')->nullable()->after('ntpn');
            }

            if (! Schema::hasColumn('doclang_proses', 'npwp_pemenang_lelang')) {
                $table->string('npwp_pemenang_lelang')->nullable()->after('slip_setor_pph_path');
            }

            if (! Schema::hasColumn('doclang_proses', 'npwp_pemenang_lelang_path')) {
                $table->string('npwp_pemenang_lelang_path')->nullable()->after('npwp_pemenang_lelang');
            }
        });
    }

    public function down(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            foreach ([
                'jenis_objek_risalah',
                'bukti_validasi_sspd_bphtb_path',
                'kuitansi_pembayaran_harga_lelang_path',
                'nomor_kuitansi_pembayaran_harga_lelang',
                'nomor_objek_pajak',
                'slip_setor_pbb_atau_bphtb_path',
                'alamat_objek_lelang',
                'ntpn',
                'slip_setor_pph_path',
                'npwp_pemenang_lelang',
                'npwp_pemenang_lelang_path',
            ] as $column) {
                if (Schema::hasColumn('doclang_proses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
