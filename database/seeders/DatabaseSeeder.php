<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

        // 1. Buat / update Super Admin
        User::updateOrCreate(
            [
                'email' => env('SEED_SUPER_ADMIN_EMAIL', 'superadmin@example.test'),
            ],
            [
                'name' => 'Super Admin',
                'password' => Hash::make(
                    env('SEED_SUPER_ADMIN_PASSWORD', 'password')
                ),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        // 2. Buat admin biasa hanya untuk lingkungan non-production
        if (app()->isProduction()) {
            return;
        }

        User::updateOrCreate(
            [
                'email' => env('SEED_ADMIN_EMAIL', 'admin@example.test'),
            ],
            [
                'name' => 'JOVANKA WILYAM MUZAKI',
                'password' => Hash::make(
                    env('SEED_ADMIN_PASSWORD', 'password')
                ),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $this->call(CsvMigrationSeeder::class);
    }
}
