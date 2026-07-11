<?php

namespace Database\Seeders;

use App\Models\StatusArsip;
use Illuminate\Database\Seeder;

class StatusArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['kode' => 'SA-00001', 'nama' => 'Aktif', 'deskripsi' => 'Arsip yang masih sering dipergunakan secara kontinyu.', 'status' => 'active'],
            ['kode' => 'SA-00002', 'nama' => 'Inaktif', 'deskripsi' => 'Arsip yang frekuensi penggunaannya telah menurun.', 'status' => 'active'],
            ['kode' => 'SA-00003', 'nama' => 'Permanen', 'deskripsi' => 'Arsip bernilai guna kesejarahan yang wajib disimpan selamanya.', 'status' => 'active'],
            ['kode' => 'SA-00004', 'nama' => 'Musnah', 'deskripsi' => 'Arsip yang sudah melewati masa retensi dan disetujui untuk dimusnahkan.', 'status' => 'active'],
            ['kode' => 'SA-00005', 'nama' => 'Dipindahkan', 'deskripsi' => 'Arsip yang dipindahkan lokasinya ke Depo pusat.', 'status' => 'active'],
        ];

        foreach ($statuses as $status) {
            StatusArsip::updateOrCreate(
                ['kode' => $status['kode']],
                $status
            );
        }
    }
}
