<?php

namespace Database\Factories;

use App\Models\UnitOrganisasi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UnitOrganisasi>
 */
class UnitOrganisasiFactory extends Factory
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
        $units = [
            'Sekretariat',
            'Bidang Pendataan',
            'Bidang Penetapan',
            'Bidang Penagihan',
            'Bidang Pengembangan',
            'Bidang Perencanaan',
        ];

        return [
            'kode' => 'UN-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'nama' => fake()->randomElement($units),
            'singkatan' => strtoupper(fake()->lexify('??')),
            'parent_id' => null,
            'status' => 'active',
        ];
    }
}
