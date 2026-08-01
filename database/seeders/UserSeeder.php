<?php

namespace Database\Seeders;

use App\Models\UnitOrganisasi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'email' => 'admin@laras.test',
                'name'  => 'Super Administrator',
                'role'  => 'Super Administrator',
                'unit_nama' => null,
            ],
            [
                'email' => 'arsiparis@laras.test',
                'name'  => 'Arsiparis',
                'role'  => 'Arsiparis',
                'unit_nama' => null,
            ],
            [
                'email' => 'pimpinan@laras.test',
                'name'  => 'Pimpinan',
                'role'  => 'Pimpinan',
                'unit_nama' => null, // Kepala Bappenda — memang tidak punya unit
            ],
            [
                'email' => 'pegawai@laras.test',
                'name'  => 'Pegawai',
                'role'  => 'Pegawai',
                'unit_nama' => null,
            ],

            // Operator per bidang induk
            [
                'email' => 'operator.sekretariat@laras.test',
                'name'  => 'Operator Sekretariat',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Sekretariat',
            ],
            [
                'email' => 'operator.p3d@laras.test',
                'name'  => 'Operator Perencanaan dan Pengembangan Pendapatan Daerah',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Perencanaan dan Pengembangan Pendapatan Daerah',
            ],
            [
                'email' => 'operator.datanilai@laras.test',
                'name'  => 'Operator Pendataan dan Penilaian',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Pendataan dan Penilaian',
            ],
            [
                'email' => 'operator.yantap@laras.test',
                'name'  => 'Operator Pelayanan dan Penetapan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Pelayanan dan Penetapan',
            ],
            [
                'email' => 'operator.nagwas@laras.test',
                'name'  => 'Operator Penagihan Keberatan dan Pengawasan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Penagihan Keberatan dan Pengawasan',
            ],

            // Operator per sub bidang — Sekretariat
            [
                'email' => 'operator.umkep@laras.test',
                'name'  => 'Operator Umum dan Kepegawaian',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Umum dan Kepegawaian',
            ],
            [
                'email' => 'operator.keu@laras.test',
                'name'  => 'Operator Keuangan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Keuangan',
            ],
            [
                'email' => 'operator.proglap@laras.test',
                'name'  => 'Operator Kelompok Substansi Program dan Pelaporan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Kelompok Substansi Program dan Pelaporan',
            ],

            // Operator per sub bidang — P3D
            [
                'email' => 'operator.renc@laras.test',
                'name'  => 'Operator Perencanaan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Perencanaan',
            ],
            [
                'email' => 'operator.bang@laras.test',
                'name'  => 'Operator Pengembangan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Pengembangan',
            ],
            [
                'email' => 'operator.sinfo@laras.test',
                'name'  => 'Operator Kelompok Substansi Pengelolaan Sistem Informasi',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Kelompok Substansi Pengelolaan Sistem Informasi',
            ],

            // Operator per sub bidang — Pendataan dan Penilaian
            [
                'email' => 'operator.data@laras.test',
                'name'  => 'Operator Pendataan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Pendataan',
            ],
            [
                'email' => 'operator.nilai@laras.test',
                'name'  => 'Operator Penilaian',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Penilaian',
            ],
            [
                'email' => 'operator.olahdata@laras.test',
                'name'  => 'Operator Kelompok Substansi Pengolahan Data',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Kelompok Substansi Pengolahan Data',
            ],

            // Operator per sub bidang — Pelayanan dan Penetapan
            [
                'email' => 'operator.yan@laras.test',
                'name'  => 'Operator Pelayanan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Pelayanan',
            ],
            [
                'email' => 'operator.tap@laras.test',
                'name'  => 'Operator Penetapan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Penetapan',
            ],
            [
                'email' => 'operator.verif@laras.test',
                'name'  => 'Operator Kelompok Substansi Verifikasi',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Kelompok Substansi Verifikasi',
            ],

            // Operator per sub bidang — Penagihan Keberatan dan Pengawasan
            [
                'email' => 'operator.tagih@laras.test',
                'name'  => 'Operator Penagihan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Penagihan',
            ],
            [
                'email' => 'operator.berat@laras.test',
                'name'  => 'Operator Keberatan',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Keberatan',
            ],
            [
                'email' => 'operator.evalpd@laras.test',
                'name'  => 'Operator Kelompok Substansi Evaluasi & Pengawasan Pendapatan Daerah',
                'role'  => 'Operator Unit Pengolah',
                'unit_nama' => 'Kelompok Substansi Evaluasi & Pengawasan Pendapatan Daerah',
            ],
        ];

        foreach ($users as $data) {
            $unitId = $data['unit_nama']
                ? UnitOrganisasi::where('nama', $data['unit_nama'])->value('id')
                : null;

            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status'            => 'active',
                    'unit_organisasi_id' => $unitId,
                ],
            );

            // Pastikan unit_organisasi_id ikut ter-update kalau user sudah ada sebelumnya (dari run sebelumnya yang masih bug)
            $user->update(['unit_organisasi_id' => $unitId]);

            $user->syncRoles([$data['role']]);
        }
    }
}