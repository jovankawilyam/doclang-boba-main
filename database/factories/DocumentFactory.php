<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['proses', 'siap_diambil', 'selesai'];

        return [
            'nomor_pengajuan' => $this->faker->unique()->numberBetween(10, 999) . '/KPHL/2026',
            'status_proses' => $this->faker->randomElement($statuses),
            'catatan' => $this->faker->optional(0.3)->sentence(),
            // Mostly 'kuitansi', sometimes 'kutipan_rl'
            'category' => (rand(1,5) === 1) ? 'kutipan_rl' : 'kuitansi',
            'created_by' => \App\Models\User::inRandomOrder()->first()?->id ?? 1,
        ];
    }
}
