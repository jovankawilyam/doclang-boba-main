<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Document;

class KutipanRLSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['nomor_pengajuan' => '146/K-RL/2026', 'status_proses' => 'proses', 'catatan' => null],
            ['nomor_pengajuan' => '147/K-RL/2026', 'status_proses' => 'siap_diambil', 'catatan' => 'Ambil di loket 2'],
            ['nomor_pengajuan' => '148/K-RL/2026', 'status_proses' => 'selesai', 'catatan' => null],
            ['nomor_pengajuan' => '149/K-RL/2026', 'status_proses' => 'proses', 'catatan' => null],
            ['nomor_pengajuan' => '150/K-RL/2026', 'status_proses' => 'siap_diambil', 'catatan' => 'Bawa KTP'],
        ];

        foreach ($data as $d) {
            Document::create(array_merge($d, [
                'created_by' => 1,
                'category' => 'kutipan_rl',
            ]));
        }
    }
}
