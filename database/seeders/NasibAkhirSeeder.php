<?php

namespace Database\Seeders;

use App\Models\NasibAkhir;
use Illuminate\Database\Seeder;

class NasibAkhirSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'kode' => 'NSB-001',
                'nama' => 'Musnah',
                'keterangan' => 'Arsip dimusnahkan setelah masa retensi berakhir sesuai ketentuan dan prosedur yang berlaku.',
                'status' => 'active',
            ],
        ];

        foreach ($data as $item) {
            NasibAkhir::updateOrCreate(
                ['nama' => $item['nama']],
                $item
            );
        }
    }
}
