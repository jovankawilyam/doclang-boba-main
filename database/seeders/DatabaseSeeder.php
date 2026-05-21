<?php

namespace Database\Seeders;

use App\Models\DoclangProses;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->isProduction() && (! env('SEED_SUPER_ADMIN_EMAIL') || ! env('SEED_SUPER_ADMIN_PASSWORD'))) {
            throw new \RuntimeException('Production seeding requires SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD.');
        }

        // 1. Buat Super Admin (Akun utamamu)
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => env('SEED_SUPER_ADMIN_EMAIL', 'superadmin@example.test'),
            'password' => env('SEED_SUPER_ADMIN_PASSWORD', Str::password(32)),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // 2. Buat admin biasa hanya untuk lingkungan non-production.
        if (app()->isProduction()) {
            return;
        }

        User::factory()->create([
            'name' => 'JOVANKA WILYAM MUZAKI',
            'email' => env('SEED_ADMIN_EMAIL', 'admin@example.test'),
            'password' => env('SEED_ADMIN_PASSWORD', Str::password(32)),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $services = [
            'kuitansi',
            'risalah_lelang',
            'validasi_pph',
        ];
        $statuses = ['proses', 'siap_diambil', 'selesai', 'tidak_valid'];

        foreach (range(1, 30) as $index) {
            DoclangProses::create([
                'kode_lot_lelang' => sprintf('BGR-LOT-%03d', $index),
                'id_pengajuan' => sprintf('%04d/%s/%s', $index, match ($services[$index % count($services)]) {
                    'risalah_lelang' => 'K-RL',
                    'validasi_pph' => 'V-PPh',
                    default => 'KPHL',
                }, now()->format('Y')),
                'tanggal_masuk_pengambilan_dokumen' => now()->subDays($index % 10)->toDateString(),
                'peran_pemohon' => 'pemenang',
                'nama_pemohon' => fake()->name(),
                'nomor_wa_pemohon' => '0812'.fake()->numerify('########'),
                'jenis_layanan' => $services[$index % count($services)],
                'status_proses' => $statuses[$index % count($statuses)],
                'catatan_tidak_valid' => $statuses[$index % count($statuses)] === 'tidak_valid'
                    ? 'Dokumen pendukung perlu diperbaiki.'
                    : null,
            ]);
        }
    }
}
