<?php

namespace Database\Seeders;

use App\Models\SifatArsip;
use Illuminate\Database\Seeder;

class SifatArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sifats = [
            ['kode' => 'SA-00001', 'nama' => 'Biasa', 'deskripsi' => 'Informasi yang bersifat umum dan publik.', 'status' => 'active'],
            ['kode' => 'SA-00002', 'nama' => 'Penting', 'deskripsi' => 'Informasi penting untuk internal instansi.', 'status' => 'active'],
            ['kode' => 'SA-00003', 'nama' => 'Rahasia', 'deskripsi' => 'Informasi terbatas yang hanya boleh diakses oleh pihak berwenang.', 'status' => 'active'],
            ['kode' => 'SA-00004', 'nama' => 'Sangat Rahasia', 'deskripsi' => 'Informasi rahasia tingkat tinggi terkait keamanan instansi/negara.', 'status' => 'active'],
        ];

        foreach ($sifats as $sifat) {
            SifatArsip::updateOrCreate(
                ['kode' => $sifat['kode']],
                $sifat
            );
        }
    }
}
