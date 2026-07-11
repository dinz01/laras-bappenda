<?php

namespace Database\Seeders;

use App\Models\TingkatAksesArsip;
use Illuminate\Database\Seeder;

class TingkatAksesArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            ['kode' => 'TAA-00001', 'nama' => 'Terbuka', 'deskripsi' => 'Dapat diakses oleh publik luas.', 'status' => 'active'],
            ['kode' => 'TAA-00002', 'nama' => 'Terbatas', 'deskripsi' => 'Hanya diakses oleh kalangan internal tertentu.', 'status' => 'active'],
            ['kode' => 'TAA-00003', 'nama' => 'Rahasia', 'deskripsi' => 'Akses ketat, memerlukan izin pimpinan bidang terkait.', 'status' => 'active'],
            ['kode' => 'TAA-00004', 'nama' => 'Sangat Rahasia', 'deskripsi' => 'Akses terbatas hanya kepala badan dan arsiparis utama.', 'status' => 'active'],
        ];

        foreach ($levels as $level) {
            TingkatAksesArsip::updateOrCreate(
                ['kode' => $level['kode']],
                $level
            );
        }
    }
}
