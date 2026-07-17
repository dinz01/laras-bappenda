<?php

namespace Database\Seeders;

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
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
use Illuminate\Database\Seeder;

class DevelopmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Menggunakan data master yang sudah di-seed oleh base seeders.
     * Hanya menambah user extra dan membuat 500 arsip dummy.
     */
    public function run(): void
    {
        // 1. Tambah user development extra (base UserSeeder hanya buat 1-2 user)
        $extraUsers = User::factory()->count(20)->create();

        // 2. Ambil semua master data dari base seeders (tidak buat duplikat)
        $unitOrganisasis = UnitOrganisasi::all();
        $lokasiArsips = LokasiArsip::all();
        $klasifikasiArsips = KlasifikasiArsip::all();
        $mediaArsips = MediaArsip::all();
        $retensiArsips = RetensiArsip::all();
        $statusArsips = StatusArsip::all();
        $jenisDokumens = JenisDokumen::all();
        $kondisiArsips = KondisiArsip::all();
        $tingkatAksesArsips = TingkatAksesArsip::all();

        // Semua user (termasuk yang dari UserSeeder)
        $users = User::all();

        // 3. Generate 500 Arsip
        for ($i = 0; $i < 500; $i++) {
            $user = $users->random();

            $arsip = Arsip::factory()->create([
                'klasifikasi_arsip_id' => $klasifikasiArsips->random()->id,
                'lokasi_arsip_id' => $lokasiArsips->random()->id,
                'jenis_dokumen_id' => $jenisDokumens->random()->id,
                'media_arsip_id' => $mediaArsips->random()->id,
                'kondisi_arsip_id' => $kondisiArsips->random()->id,
                'status_arsip_id' => $statusArsips->random()->id,
                'tingkat_akses_arsip_id' => $tingkatAksesArsips->random()->id,
                'retensi_arsip_id' => $retensiArsips->random()->id,
                'unit_organisasi_id' => $unitOrganisasis->random()->id,
                'created_by' => $user->id,
            ]);

            // Create DokumenArsip
            $dokumen = DokumenArsip::factory()->create([
                'arsip_id' => $arsip->id,
                'uploaded_by' => $user->id,
            ]);

            // Create DokumenArsipVersion v1
            DokumenArsipVersion::factory()->create([
                'dokumen_arsip_id' => $dokumen->id,
                'versi' => 1,
                'uploaded_by' => $user->id,
            ]);
        }
    }
}
