<?php

namespace Database\Seeders;

use App\Models\TingkatPerkembanganArsip;
use Illuminate\Database\Seeder;

class TingkatPerkembanganArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            ['kode' => 'TPA-00001', 'nama' => 'Asli', 'deskripsi' => 'Dokumen primer bertandatangan basah/resmi.', 'status' => 'active'],
            ['kode' => 'TPA-00002', 'nama' => 'Salinan', 'deskripsi' => 'Fotokopi atau salinan resmi dokumen.', 'status' => 'active'],
            ['kode' => 'TPA-00003', 'nama' => 'Tembusan', 'deskripsi' => 'Tembusan surat kedinasan.', 'status' => 'active'],
            ['kode' => 'TPA-00004', 'nama' => 'Konsep', 'deskripsi' => 'Rancangan awal dokumen yang siap disetujui.', 'status' => 'active'],
            ['kode' => 'TPA-00005', 'nama' => 'Draft', 'deskripsi' => 'Coretan kasaran dokumen.', 'status' => 'active'],
        ];

        foreach ($levels as $level) {
            TingkatPerkembanganArsip::updateOrCreate(
                ['kode' => $level['kode']],
                $level
            );
        }
    }
}
