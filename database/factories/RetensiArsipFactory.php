<?php

namespace Database\Factories;

use App\Models\RetensiArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RetensiArsip>
 */
class RetensiArsipFactory extends Factory
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
            'kode' => 'RA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->sentence(2),
            'retensi_aktif' => fake()->numberBetween(1, 10),
            'retensi_inaktif' => fake()->numberBetween(1, 25),
            'keterangan' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
