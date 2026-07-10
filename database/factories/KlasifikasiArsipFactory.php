<?php

namespace Database\Factories;

use App\Models\KlasifikasiArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KlasifikasiArsip>
 */
class KlasifikasiArsipFactory extends Factory
{
    /**
     * Counter untuk kode sekuensial.
     */
    protected static int $sequence = 1;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode' => 'KA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->sentence(3),
            'deskripsi' => fake()->paragraph(),
            'retensi_aktif' => fake()->numberBetween(1, 10),
            'retensi_inaktif' => fake()->numberBetween(1, 20),
            'status' => 'active',
        ];
    }
}
