<?php

namespace Database\Seeders;

use App\Models\UnitOrganisasi;
use Illuminate\Database\Seeder;

class UnitOrganisasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $struktur = [
            [
                'kode'      => 'UN-00001',
                'nama'      => 'Sekretariat',
                'singkatan' => 'SEKR',
                'children'  => [
                    ['kode' => 'UN-00101', 'nama' => 'Umum dan Kepegawaian',                        'singkatan' => 'UMKEP'],
                    ['kode' => 'UN-00102', 'nama' => 'Keuangan',                                    'singkatan' => 'KEU'],
                    ['kode' => 'UN-00103', 'nama' => 'Kelompok Substansi Program dan Pelaporan',    'singkatan' => 'PROGLAP'],
                ],
            ],
            [
                'kode'      => 'UN-00002',
                'nama'      => 'Perencanaan dan Pengembangan Pendapatan Daerah',
                'singkatan' => 'P3D',
                'children'  => [
                    ['kode' => 'UN-00201', 'nama' => 'Perencanaan',                                             'singkatan' => 'RENC'],
                    ['kode' => 'UN-00202', 'nama' => 'Pengembangan',                                            'singkatan' => 'BANG'],
                    ['kode' => 'UN-00203', 'nama' => 'Kelompok Substansi Pengelolaan Sistem Informasi',         'singkatan' => 'SINFO'],
                ],
            ],
            [
                'kode'      => 'UN-00003',
                'nama'      => 'Pendataan dan Penilaian',
                'singkatan' => 'DATANILAI',
                'children'  => [
                    ['kode' => 'UN-00301', 'nama' => 'Pendataan',                               'singkatan' => 'DATA'],
                    ['kode' => 'UN-00302', 'nama' => 'Penilaian',                               'singkatan' => 'NILAI'],
                    ['kode' => 'UN-00303', 'nama' => 'Kelompok Substansi Pengolahan Data',      'singkatan' => 'OLAHDATA'],
                ],
            ],
            [
                'kode'      => 'UN-00004',
                'nama'      => 'Pelayanan dan Penetapan',
                'singkatan' => 'YANTAP',
                'children'  => [
                    ['kode' => 'UN-00401', 'nama' => 'Pelayanan',                           'singkatan' => 'YAN'],
                    ['kode' => 'UN-00402', 'nama' => 'Penetapan',                           'singkatan' => 'TAP'],
                    ['kode' => 'UN-00403', 'nama' => 'Kelompok Substansi Verifikasi',       'singkatan' => 'VERIF'],
                ],
            ],
            [
                'kode'      => 'UN-00005',
                'nama'      => 'Penagihan Keberatan dan Pengawasan',
                'singkatan' => 'NAGWAS',
                'children'  => [
                    ['kode' => 'UN-00501', 'nama' => 'Penagihan',                                                           'singkatan' => 'TAGIH'],
                    ['kode' => 'UN-00502', 'nama' => 'Keberatan',                                                           'singkatan' => 'BERAT'],
                    ['kode' => 'UN-00503', 'nama' => 'Kelompok Substansi Evaluasi & Pengawasan Pendapatan Daerah',          'singkatan' => 'EVALPD'],
                ],
            ],
        ];

        $upt = [
            ['kode' => 'UN-01001', 'nama' => 'UPT Citeureup',   'singkatan' => 'UPT-CTR'],
            ['kode' => 'UN-01002', 'nama' => 'UPT Leuwiliang',  'singkatan' => 'UPT-LWL'],
            ['kode' => 'UN-01003', 'nama' => 'UPT Ciomas',      'singkatan' => 'UPT-CMS'],
            ['kode' => 'UN-01004', 'nama' => 'UPT Ciawi',       'singkatan' => 'UPT-CWI'],
            ['kode' => 'UN-01005', 'nama' => 'UPT Gunung Putri', 'singkatan' => 'UPT-GNP'],
            ['kode' => 'UN-01006', 'nama' => 'UPT Cigudeg',     'singkatan' => 'UPT-CGD'],
            ['kode' => 'UN-01007', 'nama' => 'UPT Jonggol',     'singkatan' => 'UPT-JGL'],
            ['kode' => 'UN-01008', 'nama' => 'UPT Caringin',    'singkatan' => 'UPT-CRN'],
            ['kode' => 'UN-01009', 'nama' => 'UPT Sukaraja',    'singkatan' => 'UPT-SKR'],
            ['kode' => 'UN-01010', 'nama' => 'UPT Parung',      'singkatan' => 'UPT-PRG'],
        ];

        foreach ($upt as $item) {
            UnitOrganisasi::updateOrCreate(
                ['kode' => $item['kode']],
                array_merge($item, ['parent_id' => null, 'status' => 'active']),
            );
        }

        foreach ($struktur as $induk) {
            $children = $induk['children'];
            unset($induk['children']);

            $parent = UnitOrganisasi::updateOrCreate(
                ['kode' => $induk['kode']],
                array_merge($induk, ['parent_id' => null, 'status' => 'active']),
            );

            foreach ($children as $child) {
                UnitOrganisasi::updateOrCreate(
                    ['kode' => $child['kode']],
                    array_merge($child, ['parent_id' => $parent->id, 'status' => 'active']),
                );
            }
        }
    }
}
