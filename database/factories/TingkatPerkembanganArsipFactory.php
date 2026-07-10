<?php

namespace Database\Factories;

use App\Models\TingkatPerkembanganArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TingkatPerkembanganArsip>
 */
class TingkatPerkembanganArsipFactory extends Factory
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
            'Asli',
            'Salinan',
            'Tembusan',
            'Konsep',
            'Draft',
        ];

        return [
            'kode' => 'TPA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
