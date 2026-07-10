<?php

namespace Database\Factories;

use App\Models\LokasiArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LokasiArsip>
 */
class LokasiArsipFactory extends Factory
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
        $gedungLetter = fake()->randomElement(['A', 'B', 'C', 'D']);
        $lantai = (string) fake()->numberBetween(1, 5);
        $ruangNo = fake()->numberBetween(100, 310);
        $rakLetter = fake()->randomElement(['A', 'B', 'C', 'D']);
        $rakNo = str_pad((string) fake()->numberBetween(1, 20), 2, '0', STR_PAD_LEFT);

        return [
            'kode' => 'LOC-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->words(2, true),
            'gedung' => 'Gedung '.$gedungLetter,
            'lantai' => $lantai,
            'ruangan' => 'Ruang '.$ruangNo,
            'rak' => 'Rak '.$rakLetter.'-'.$rakNo,
            'box' => 'BOX-'.str_pad((string) fake()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'keterangan' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
