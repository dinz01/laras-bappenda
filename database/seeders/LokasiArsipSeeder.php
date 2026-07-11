<?php

namespace Database\Seeders;

use App\Models\LokasiArsip;
use Illuminate\Database\Seeder;

class LokasiArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            [
                'kode' => 'LOC-00001',
                'nama' => 'Ruang Arsip Utama Gedung A',
                'gedung' => 'Gedung A',
                'lantai' => '1',
                'ruangan' => 'Ruang 101',
                'rak' => 'Rak A-01',
                'box' => 'BOX-001',
                'keterangan' => 'Penyimpanan arsip aktif keuangan.',
                'status' => 'active',
            ],
            [
                'kode' => 'LOC-00002',
                'nama' => 'Ruang Penyimpanan Digital Server',
                'gedung' => 'Gedung A',
                'lantai' => '2',
                'ruangan' => 'Ruang Server 202',
                'rak' => 'Rak Server 01',
                'box' => 'NAS-01',
                'keterangan' => 'Lokasi fisik server backup.',
                'status' => 'active',
            ],
            [
                'kode' => 'LOC-00003',
                'nama' => 'Ruang Depo Arsip Inaktif',
                'gedung' => 'Gedung B',
                'lantai' => '1',
                'ruangan' => 'Depo Utama 102',
                'rak' => 'Rak B-02',
                'box' => 'BOX-002',
                'keterangan' => 'Penyimpanan arsip inaktif kepegawaian.',
                'status' => 'active',
            ],
        ];

        foreach ($locations as $loc) {
            LokasiArsip::updateOrCreate(
                ['kode' => $loc['kode']],
                $loc
            );
        }
    }
}
