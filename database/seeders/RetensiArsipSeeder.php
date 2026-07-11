<?php

namespace Database\Seeders;

use App\Models\RetensiArsip;
use Illuminate\Database\Seeder;

class RetensiArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $retentions = [
            [
                'kode' => 'RA-00001',
                'nama' => 'Aturan Retensi Keuangan',
                'retensi_aktif' => 5,
                'retensi_inaktif' => 10,
                'keterangan' => 'Retensi standar dokumen administrasi keuangan.',
                'status' => 'active',
            ],
            [
                'kode' => 'RA-00002',
                'nama' => 'Aturan Retensi Kepegawaian',
                'retensi_aktif' => 2,
                'retensi_inaktif' => 5,
                'keterangan' => 'Retensi standar berkas kepegawaian rutin.',
                'status' => 'active',
            ],
            [
                'kode' => 'RA-00003',
                'nama' => 'Aturan Retensi Administrasi Umum',
                'retensi_aktif' => 1,
                'retensi_inaktif' => 2,
                'keterangan' => 'Retensi surat undangan dan administrasi umum harian.',
                'status' => 'active',
            ],
        ];

        foreach ($retentions as $item) {
            RetensiArsip::updateOrCreate(
                ['kode' => $item['kode']],
                $item
            );
        }
    }
}
