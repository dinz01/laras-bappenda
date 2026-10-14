<?php

namespace Database\Factories;

use App\Models\KlasifikasiArsip;
use App\Models\NasibAkhir;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KlasifikasiArsip>
 */
class KlasifikasiArsipFactory extends Factory
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
        return [
            'parent_id' => null,
            'kode' => 'KA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->sentence(3),
            'deskripsi' => fake()->paragraph(),
            'retensi_aktif' => fake()->numberBetween(1, 5),
            'retensi_inaktif' => fake()->numberBetween(1, 10),
            'nasib_akhir_id' => NasibAkhir::factory(),
            'status' => 'active',
        ];
    }
}
