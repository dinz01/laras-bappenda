<?php

namespace Database\Factories;

use App\Models\Jabatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Jabatan>
 */
class JabatanFactory extends Factory
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
            'kode' => 'JAB-'.str_pad((string) self::$sequence++, 3, '0', STR_PAD_LEFT),
            'nama' => fake()->jobTitle(),
            'singkatan' => strtoupper(fake()->lexify('????')),
            'status' => 'active',
        ];
    }
}
