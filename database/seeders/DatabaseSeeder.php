<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat Super Admin (Akun utamamu)
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@gmail.com',
            'password' => 'superadmin123',
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // 2. Buat beberapa admin biasa
        User::factory()->create([
            'name' => 'JOVANKA WILYAM MUZAKI',
            'email' => 'admin123@gmail.com',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // 3. Generate 100 dokumen dummy yang diinputkan secara acak oleh user
        \App\Models\Document::factory(100)->create();

        // 4. Seed some Kutipan RL example entries
        $this->call([\Database\Seeders\KutipanRLSeeder::class]);
    }
}
