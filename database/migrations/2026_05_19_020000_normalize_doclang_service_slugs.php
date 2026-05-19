<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE doclang_proses MODIFY jenis_layanan VARCHAR(50) NOT NULL');
        }

        foreach ([
            'Pemberian Kuitansi Pembayaran' => 'kuitansi',
            'Pemberian Kuitansi Pembayaran Harga Lelang' => 'kuitansi',
            'Pemberian Kutipan Risalah Lelang' => 'risalah_lelang',
            'kutipan_rl' => 'risalah_lelang',
            'Validasi PPh' => 'validasi_pph',
        ] as $from => $to) {
            DB::table('doclang_proses')
                ->where('jenis_layanan', $from)
                ->update(['jenis_layanan' => $to]);
        }
    }

    public function down(): void
    {
        foreach ([
            'kuitansi' => 'Pemberian Kuitansi Pembayaran',
            'risalah_lelang' => 'Pemberian Kutipan Risalah Lelang',
            'validasi_pph' => 'Validasi PPh',
        ] as $from => $to) {
            DB::table('doclang_proses')
                ->where('jenis_layanan', $from)
                ->update(['jenis_layanan' => $to]);
        }
    }
};
