<?php

namespace Database\Factories;

use App\Models\StatusArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StatusArsip>
 */
class StatusArsipFactory extends Factory
{
    /**
     * Counter untuk kode sekuensial.
     */
    protected static int $sequence = 1000;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $names = [
            'Aktif',
            'Inaktif',
            'Permanen',
            'Musnah',
            'Dipindahkan',
        ];

        return [
            'kode' => 'SA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
