<?php

namespace Database\Factories;

use App\Models\MediaArsip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MediaArsip>
 */
class MediaArsipFactory extends Factory
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
            'Kertas',
            'Digital',
            'Mikrofilm',
            'Foto',
            'Audio',
            'Video',
            'CD/DVD',
            'Harddisk',
            'Flashdisk',
            'Cloud Storage',
        ];

        return [
            'kode' => 'MA-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($names),
            'deskripsi' => fake()->optional()->sentence(),
            'status' => 'active',
        ];
    }
}
