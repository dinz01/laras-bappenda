<?php

namespace Database\Factories;

use App\Models\NasibAkhir;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NasibAkhir>
 */
class NasibAkhirFactory extends Factory
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
            'kode' => 'NSB-'.str_pad((string) self::$sequence++, 3, '0', STR_PAD_LEFT),
            'nama' => fake()->unique()->word(),
            'keterangan' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
