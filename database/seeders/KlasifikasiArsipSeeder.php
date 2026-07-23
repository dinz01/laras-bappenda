<?php

namespace Database\Seeders;

use App\Models\KlasifikasiArsip;
use Illuminate\Database\Seeder;

class KlasifikasiArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classifications = [
            [
                'kode' => 'KA-FIN',
                'nama' => 'Keuangan',
                'deskripsi' => 'Arsip yang berhubungan dengan pengelolaan administrasi keuangan.',
                'status' => 'active',
            ],
            [
                'kode' => 'KA-HRD',
                'nama' => 'Kepegawaian',
                'deskripsi' => 'Arsip terkait manajemen SDM, berkas pegawai, pembinaan karir, dll.',
                'status' => 'active',
            ],
            [
                'kode' => 'KA-LAW',
                'nama' => 'Hukum',
                'deskripsi' => 'Dokumen produk hukum daerah, peraturan, keputusan kepala daerah.',
                'status' => 'active',
            ],
            [
                'kode' => 'KA-UMM',
                'nama' => 'Umum',
                'deskripsi' => 'Arsip persuratan umum, sarana prasarana, logistik, kehumasan.',
                'status' => 'active',
            ],
        ];

        foreach ($classifications as $item) {
            KlasifikasiArsip::updateOrCreate(
                ['kode' => $item['kode']],
                $item
            );
        }
    }
}
