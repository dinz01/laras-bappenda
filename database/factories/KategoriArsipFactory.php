<?php

namespace Database\Factories;

use App\Models\KategoriArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KategoriArsip>
 */
class KategoriArsipFactory extends Factory
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
            'Arsip Internal',
            'Arsip Pelayanan Pajak Daerah',
            'Arsip Keuangan',
            'Arsip Kepegawaian',
        ];

        return [
            'kode' => 'KAT-'.str_pad((string) self::$sequence++, 3, '0', STR_PAD_LEFT),
            'nama' => fake()->unique()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
