<?php

namespace Database\Factories;

use App\Models\KondisiArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KondisiArsip>
 */
class KondisiArsipFactory extends Factory
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
            'Baik',
            'Rusak Ringan',
            'Rusak Berat',
        ];

        return [
            'kode' => 'KND-'.str_pad((string) self::$sequence++, 3, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
