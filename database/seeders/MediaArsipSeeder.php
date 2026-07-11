<?php

namespace Database\Seeders;

use App\Models\MediaArsip;
use Illuminate\Database\Seeder;

class MediaArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $media = [
            ['kode' => 'MA-00001', 'nama' => 'Kertas', 'deskripsi' => 'Media fisik berbasis kertas.', 'status' => 'active'],
            ['kode' => 'MA-00002', 'nama' => 'Digital', 'deskripsi' => 'Media penyimpanan file digital/elektronik.', 'status' => 'active'],
            ['kode' => 'MA-00003', 'nama' => 'Foto', 'deskripsi' => 'Media visual berupa dokumentasi cetak.', 'status' => 'active'],
            ['kode' => 'MA-00004', 'nama' => 'Audio', 'deskripsi' => 'Media perekaman suara.', 'status' => 'active'],
            ['kode' => 'MA-00005', 'nama' => 'Video', 'deskripsi' => 'Media dokumentasi audio visual.', 'status' => 'active'],
        ];

        foreach ($media as $item) {
            MediaArsip::updateOrCreate(
                ['kode' => $item['kode']],
                $item
            );
        }
    }
}
