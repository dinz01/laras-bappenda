<?php

namespace Database\Seeders;

use App\Models\KondisiArsip;
use Illuminate\Database\Seeder;

class KondisiArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $conditions = [
            ['kode' => 'KA-00001', 'nama' => 'Baik', 'deskripsi' => 'Fisik dan tulisan dokumen utuh, terbaca sangat jelas.', 'status' => 'active'],
            ['kode' => 'KA-00002', 'nama' => 'Rusak Ringan', 'deskripsi' => 'Fisik sedikit kotor/robek kecil di pinggir, tulisan masih terbaca jelas.', 'status' => 'active'],
            ['kode' => 'KA-00003', 'nama' => 'Rusak Berat', 'deskripsi' => 'Fisik lapuk/robek besar, tulisan sulit/sebagian tidak terbaca.', 'status' => 'active'],
        ];

        foreach ($conditions as $cond) {
            KondisiArsip::updateOrCreate(
                ['kode' => $cond['kode']],
                $cond
            );
        }
    }
}
