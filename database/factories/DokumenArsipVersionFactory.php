<?php

namespace Database\Factories;

use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DokumenArsipVersion>
 */
class DokumenArsipVersionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dokumen_arsip_id' => DokumenArsip::factory(),
            'versi' => 1,
            'nama_file' => $this->faker->word().'.pdf',
            'path_file' => 'archives/'.$this->faker->uuid().'.pdf',
            'ukuran_file' => $this->faker->numberBetween(1000, 50000),
            'mime_type' => 'application/pdf',
            'hash_file' => hash('sha256', $this->faker->word()),
            'uploaded_by' => User::factory(),
        ];
    }
}
