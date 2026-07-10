<?php

namespace Database\Factories;

use App\Models\SifatArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SifatArsip>
 */
class SifatArsipFactory extends Factory
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
        $names = [
            'Biasa',
            'Penting',
            'Rahasia',
            'Sangat Rahasia',
            'Terbatas',
        ];

        return [
            'kode' => 'SA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
