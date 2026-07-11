<?php

namespace Database\Seeders;

use App\Models\JenisDokumen;
use Illuminate\Database\Seeder;

class JenisDokumenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['kode' => 'JD-00001', 'nama' => 'Surat Masuk', 'deskripsi' => 'Dokumen surat masuk eksternal.', 'status' => 'active'],
            ['kode' => 'JD-00002', 'nama' => 'Surat Keluar', 'deskripsi' => 'Dokumen surat keluar dinas.', 'status' => 'active'],
            ['kode' => 'JD-00003', 'nama' => 'Nota Dinas', 'deskripsi' => 'Dokumen nota dinas internal.', 'status' => 'active'],
            ['kode' => 'JD-00004', 'nama' => 'Memo', 'deskripsi' => 'Memo internal singkat pimpinan.', 'status' => 'active'],
            ['kode' => 'JD-00005', 'nama' => 'SOP', 'deskripsi' => 'Dokumen Standar Operasional Prosedur.', 'status' => 'active'],
            ['kode' => 'JD-00006', 'nama' => 'SK', 'deskripsi' => 'Surat Keputusan Kedinasan.', 'status' => 'active'],
            ['kode' => 'JD-00007', 'nama' => 'Laporan', 'deskripsi' => 'Berkas laporan pertanggungjawaban.', 'status' => 'active'],
        ];

        foreach ($types as $type) {
            JenisDokumen::updateOrCreate(
                ['kode' => $type['kode']],
                $type
            );
        }
    }
}
