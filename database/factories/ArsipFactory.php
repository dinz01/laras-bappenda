<?php

namespace Database\Factories;

use App\Models\Arsip;
use App\Models\JenisDokumen;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\MediaArsip;
use App\Models\RetensiArsip;
use App\Models\StatusArsip;
use App\Models\TingkatAksesArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Arsip>
 */
class ArsipFactory extends Factory
{
    /**
     * Counter untuk nomor arsip sekuensial.
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
            'nomor_arsip' => 'ARS/2026/'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'judul' => fake()->sentence(3),
            'deskripsi' => fake()->optional()->paragraph(),
            'tanggal_arsip' => fake()->dateTimeBetween('-3 years', 'now')->format('Y-m-d'),
            'file_path' => fake()->optional()->lexify('arsip/doc-??????.pdf'),

            // Model Factory Associations
            'klasifikasi_arsip_id' => KlasifikasiArsip::factory(),
            'lokasi_arsip_id' => LokasiArsip::factory(),
            'jenis_dokumen_id' => JenisDokumen::factory(),
            'media_arsip_id' => MediaArsip::factory(),
            'kondisi_arsip_id' => KondisiArsip::factory(),
            'status_arsip_id' => StatusArsip::factory(),
            'tingkat_akses_arsip_id' => TingkatAksesArsip::factory(),
            'retensi_arsip_id' => RetensiArsip::factory(),
            'unit_organisasi_id' => UnitOrganisasi::factory(),
            'created_by' => User::factory(),
        ];
    }
}
