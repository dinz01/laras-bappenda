<?php

namespace Database\Seeders;

use App\Models\MetodePenyusutanArsip;
use Illuminate\Database\Seeder;

class MetodePenyusutanArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            ['kode' => 'MPA-00001', 'nama' => 'Pemusnahan', 'deskripsi' => 'Arsip dihancurkan secara total secara fisik atau digital.', 'status' => 'active'],
            ['kode' => 'MPA-00002', 'nama' => 'Permanen', 'deskripsi' => 'Arsip disimpan selamanya di instansi internal.', 'status' => 'active'],
            ['kode' => 'MPA-00003', 'nama' => 'Penyerahan ke ANRI', 'deskripsi' => 'Arsip diserahkan ke Arsip Nasional Republik Indonesia.', 'status' => 'active'],
        ];

        foreach ($methods as $method) {
            MetodePenyusutanArsip::updateOrCreate(
                ['kode' => $method['kode']],
                $method
            );
        }
    }
}
