<?php

namespace Database\Seeders;

use App\Models\JenisArsip;
use Illuminate\Database\Seeder;

class JenisArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['kode' => 'JA-00001', 'nama' => 'Surat Masuk', 'deskripsi' => 'Surat resmi yang diterima dari instansi luar.', 'status' => 'active'],
            ['kode' => 'JA-00002', 'nama' => 'Surat Keluar', 'deskripsi' => 'Surat resmi yang dikirimkan ke instansi luar.', 'status' => 'active'],
            ['kode' => 'JA-00003', 'nama' => 'Nota Dinas', 'deskripsi' => 'Nota kedinasan internal antar bidang.', 'status' => 'active'],
            ['kode' => 'JA-00004', 'nama' => 'Peraturan', 'deskripsi' => 'Dokumen peraturan perundang-undangan.', 'status' => 'active'],
            ['kode' => 'JA-00005', 'nama' => 'Keputusan', 'deskripsi' => 'Surat keputusan kepala badan/daerah.', 'status' => 'active'],
            ['kode' => 'JA-00006', 'nama' => 'Laporan', 'deskripsi' => 'Laporan pertanggungjawaban kegiatan.', 'status' => 'active'],
            ['kode' => 'JA-00007', 'nama' => 'Berita Acara', 'deskripsi' => 'Dokumen berita acara serah terima/kejadian.', 'status' => 'active'],
            ['kode' => 'JA-00008', 'nama' => 'Memorandum', 'deskripsi' => 'Memo dinas internal.', 'status' => 'active'],
            ['kode' => 'JA-00009', 'nama' => 'Undangan', 'deskripsi' => 'Surat undangan kedinasan.', 'status' => 'active'],
            ['kode' => 'JA-00010', 'nama' => 'Dokumen Pendukung', 'deskripsi' => 'Lampiran pendukung berkas utama.', 'status' => 'active'],
        ];

        foreach ($types as $type) {
            JenisArsip::updateOrCreate(
                ['kode' => $type['kode']],
                $type
            );
        }
    }
}
