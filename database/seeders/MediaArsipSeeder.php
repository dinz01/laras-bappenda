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
        $mediaArsips = [
            ['kode' => 'MA-00001', 'nama' => 'Kertas', 'deskripsi' => 'Arsip fisik berbentuk dokumen kertas.', 'status' => 'active'],
            ['kode' => 'MA-00002', 'nama' => 'Digital/PDF', 'deskripsi' => 'Arsip dalam bentuk file digital (PDF, hasil scan, dsb).', 'status' => 'active'],
            ['kode' => 'MA-00003', 'nama' => 'Mikrofilm', 'deskripsi' => 'Arsip yang disimpan dalam bentuk mikrofilm.', 'status' => 'active'],
            ['kode' => 'MA-00004', 'nama' => 'Foto', 'deskripsi' => 'Arsip berbentuk media foto/gambar.', 'status' => 'active'],
            ['kode' => 'MA-00005', 'nama' => 'Elektronik/Media Rekam', 'deskripsi' => 'Arsip pada media rekam elektronik seperti CD, DVD, flashdisk, hard disk.', 'status' => 'active'],
        ];

        foreach ($mediaArsips as $media) {
            MediaArsip::updateOrCreate(
                ['kode' => $media['kode']],
                $media
            );
        }
    }
}
