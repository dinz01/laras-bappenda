<?php

namespace Database\Factories;

use App\Models\Arsip;
use App\Models\JenisArsip;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\MediaArsip;
use App\Models\RetensiArsip;
use App\Models\SifatArsip;
use App\Models\StatusArsip;
use App\Models\TingkatAksesArsip;
use App\Models\TingkatPerkembanganArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Arsip>
 */
class ArsipFactory extends Factory
{
    /**
     * Counter untuk nomor arsip sekuensial.
     */
    protected static int $sequence = 1;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = fake()->dateTimeBetween('2023-01-01', '2026-12-31');
        $year = $date->format('Y');
        $formattedDate = $date->format('Y-m-d');

        $indonesianTitles = [
            'Surat Permohonan Kunjungan Kerja',
            'Laporan Keuangan Bulanan',
            'Surat Keputusan Kepala Dinas',
            'Undangan Rapat Dinas',
            'Surat Tugas Pelatihan Pegawai',
            'Nota Dinas Pengajuan Anggaran',
            'Laporan Penanggungjawaban Kegiatan',
            'Surat Perjanjian Kerja Sama',
            'Dokumen Perencanaan Strategis',
            'Surat Edaran Sosialisasi Kebijakan',
            'Berita Acara Serah Terima Jabatan',
            'Daftar Inventaris Barang Daerah',
            'Surat Keterangan Bebas Temuan',
            'Rencana Kerja Anggaran SKPD',
            'Dokumen Pelaksanaan Anggaran',
        ];

        $judul = fake()->randomElement($indonesianTitles).' '.fake()->company();

        return [
            'nomor_arsip' => 'ARS-'.$year.'-'.str_pad((string) self::$sequence++, 5, '0', STR_PAD_LEFT),
            'judul' => $judul,
            'deskripsi' => fake()->optional()->paragraph(),
            'tanggal_arsip' => $formattedDate,

            // Model Factory Associations
            'jenis_arsip_id' => JenisArsip::factory(),
            'klasifikasi_arsip_id' => KlasifikasiArsip::factory(),
            'sifat_arsip_id' => SifatArsip::factory(),
            'lokasi_arsip_id' => LokasiArsip::factory(),
            'media_arsip_id' => MediaArsip::factory(),
            'kondisi_arsip_id' => KondisiArsip::factory(),
            'status_arsip_id' => StatusArsip::factory(),
            'tingkat_akses_arsip_id' => TingkatAksesArsip::factory(),
            'tingkat_perkembangan_arsip_id' => TingkatPerkembanganArsip::factory(),
            'retensi_arsip_id' => RetensiArsip::factory(),
            'unit_organisasi_id' => UnitOrganisasi::factory(),
            'created_by' => User::factory(),
        ];
    }
}
