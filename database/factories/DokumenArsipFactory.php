<?php

namespace Database\Factories;

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DokumenArsip>
 */
class DokumenArsipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'arsip_id' => Arsip::factory(),
            'nama_original' => fake()->word().'.pdf',
            'nama_generated' => fake()->uuid().'.pdf',
            'ukuran' => fake()->numberBetween(1024, 10240000),
            'mime_type' => 'application/pdf',
            'path_penyimpanan' => 'arsip/'.fake()->sha256().'.pdf',
            'uploaded_at' => now(),
            'uploaded_by' => User::factory(),
        ];
    }
}
