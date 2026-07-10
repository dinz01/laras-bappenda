<?php

namespace Database\Factories;

use App\Models\JenisArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JenisArsip>
 */
class JenisArsipFactory extends Factory
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
            'Peraturan',
            'Keputusan',
            'Laporan',
            'Berita Acara',
            'Memorandum',
            'Undangan',
            'Dokumen Pendukung',
        ];

        return [
            'kode' => 'JA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
