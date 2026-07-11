<?php

namespace Database\Factories;

use App\Models\JenisDokumen;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JenisDokumen>
 */
class JenisDokumenFactory extends Factory
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
            'Surat Masuk',
            'Surat Keluar',
            'Nota Dinas',
            'Memo',
            'SK',
            'SOP',
            'Laporan',
            'Dokumen Pendukung',
        ];

        return [
            'kode' => 'JD-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
