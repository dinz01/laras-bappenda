<?php

namespace Database\Seeders;

use App\Models\UnitOrganisasi;
use Illuminate\Database\Seeder;

class UnitOrganisasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            [
                'kode' => 'UN-00001',
                'nama' => 'Sekretariat',
                'singkatan' => 'SEKR',
                'parent_id' => null,
                'status' => 'active',
            ],
            [
                'kode' => 'UN-00002',
                'nama' => 'Bidang Pendataan',
                'singkatan' => 'DATA',
                'parent_id' => null,
                'status' => 'active',
            ],
            [
                'kode' => 'UN-00003',
                'nama' => 'Bidang Penetapan',
                'singkatan' => 'TAP',
                'parent_id' => null,
                'status' => 'active',
            ],
            [
                'kode' => 'UN-00004',
                'nama' => 'Bidang Penagihan',
                'singkatan' => 'TAG',
                'parent_id' => null,
                'status' => 'active',
            ],
            [
                'kode' => 'UN-00005',
                'nama' => 'Bidang Pengembangan',
                'singkatan' => 'BANG',
                'parent_id' => null,
                'status' => 'active',
            ],
            [
                'kode' => 'UN-00006',
                'nama' => 'Bidang Perencanaan',
                'singkatan' => 'RENC',
                'parent_id' => null,
                'status' => 'active',
            ],
        ];

        foreach ($units as $unit) {
            UnitOrganisasi::updateOrCreate(
                ['kode' => $unit['kode']],
                $unit
            );
        }
    }
}
