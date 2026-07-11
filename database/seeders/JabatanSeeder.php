<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jabatans = [
            [
                'kode' => 'JB-00001',
                'nama' => 'Kepala Badan',
                'singkatan' => 'KABAN',
                'level' => 1,
                'status' => 'active',
            ],
            [
                'kode' => 'JB-00002',
                'nama' => 'Sekretaris',
                'singkatan' => 'SEKRETARIS',
                'level' => 2,
                'status' => 'active',
            ],
            [
                'kode' => 'JB-00003',
                'nama' => 'Kepala Bidang',
                'singkatan' => 'KABID',
                'level' => 3,
                'status' => 'active',
            ],
            [
                'kode' => 'JB-00004',
                'nama' => 'Kepala Sub Bidang',
                'singkatan' => 'KASUBID',
                'level' => 4,
                'status' => 'active',
            ],
            [
                'kode' => 'JB-00005',
                'nama' => 'Arsiparis',
                'singkatan' => 'ARSIPARIS',
                'level' => 5,
                'status' => 'active',
            ],
            [
                'kode' => 'JB-00006',
                'nama' => 'Operator',
                'singkatan' => 'OPERATOR',
                'level' => 6,
                'status' => 'active',
            ],
        ];

        foreach ($jabatans as $jabatan) {
            Jabatan::updateOrCreate(
                ['kode' => $jabatan['kode']],
                $jabatan
            );
        }
    }
}
