<?php

namespace Database\Seeders;

use App\Models\KategoriArsip;
use Illuminate\Database\Seeder;

class KategoriArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'kode' => 'KAT-001',
                'nama' => 'Arsip Internal',
                'deskripsi' => 'Arsip operasional dan administrasi internal badan/instansi.',
                'status' => 'active',
            ],
            [
                'kode' => 'KAT-002',
                'nama' => 'Arsip Pelayanan Pajak Daerah',
                'deskripsi' => 'Arsip terkait pelayanan pajak daerah termasuk berkas wajib pajak dan objek pajak.',
                'status' => 'active',
            ],
        ];

        foreach ($data as $item) {
            KategoriArsip::updateOrCreate(
                ['kode' => $item['kode']],
                $item
            );
        }
    }
}
