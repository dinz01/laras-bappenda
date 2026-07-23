<?php

namespace Database\Seeders;

use App\Models\KlasifikasiArsip;
use App\Models\RetensiArsip;
use Illuminate\Database\Seeder;

class KlasifikasiArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $retensiKeuangan = RetensiArsip::where('kode', 'RA-00001')->first();
        $retensiKepegawaian = RetensiArsip::where('kode', 'RA-00002')->first();
        $retensiUmum = RetensiArsip::where('kode', 'RA-00003')->first();

        $classifications = [
            [
                'kode' => 'KA-FIN',
                'nama' => 'Keuangan',
                'deskripsi' => 'Arsip yang berhubungan dengan pengelolaan administrasi keuangan.',
                'retensi_arsip_id' => $retensiKeuangan?->id,
                'status' => 'active',
            ],
            [
                'kode' => 'KA-HRD',
                'nama' => 'Kepegawaian',
                'deskripsi' => 'Arsip terkait manajemen SDM, berkas pegawai, pembinaan karir, dll.',
                'retensi_arsip_id' => $retensiKepegawaian?->id,
                'status' => 'active',
            ],
            [
                'kode' => 'KA-LAW',
                'nama' => 'Hukum',
                'deskripsi' => 'Dokumen produk hukum daerah, peraturan, keputusan kepala daerah.',
                'retensi_arsip_id' => $retensiKepegawaian?->id,
                'status' => 'active',
            ],
            [
                'kode' => 'KA-UMM',
                'nama' => 'Umum',
                'deskripsi' => 'Arsip persuratan umum, sarana prasarana, logistik, kehumasan.',
                'retensi_arsip_id' => $retensiUmum?->id,
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
