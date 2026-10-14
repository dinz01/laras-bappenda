<?php

declare(strict_types=1);

namespace App\Enums;

enum NotificationType: string
{
    case ArsipBaru = 'arsip_baru';
    case ArsipDihapus = 'arsip_dihapus';
    case ArsipDipulihkan = 'arsip_dipulihkan';
    case ArsipDihapusPermanen = 'arsip_dihapus_permanen';
    case DokumenDiunggah = 'dokumen_diunggah';
    case DokumenDiganti = 'dokumen_diganti';
    case VersiDokumenBaru = 'versi_dokumen_baru';
    case TahapBerubah = 'tahap_berubah';
    case PeminjamanDiajukan = 'peminjaman_diajukan';
    case PeminjamanDisetujui = 'peminjaman_disetujui';
    case PeminjamanDitolak = 'peminjaman_ditolak';

    /**
     * Label bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::ArsipBaru => 'Arsip Berhasil Dibuat',
            self::ArsipDihapus => 'Arsip Dipindahkan ke Recycle Bin',
            self::ArsipDipulihkan => 'Arsip Dipulihkan',
            self::ArsipDihapusPermanen => 'Arsip Dihapus Permanen',
            self::DokumenDiunggah => 'Dokumen Berhasil Diunggah',
            self::DokumenDiganti => 'Dokumen Berhasil Diganti',
            self::VersiDokumenBaru => 'Versi Dokumen Baru Dibuat',
            self::TahapBerubah => 'Tahap Arsip Berubah',
            self::PeminjamanDiajukan => 'Permohonan Peminjaman',
            self::PeminjamanDisetujui => 'Peminjaman Disetujui',
            self::PeminjamanDitolak => 'Peminjaman Ditolak',
        };
    }

    /**
     * Warna badge (kompatibel dengan StatusBadge component).
     */
    public function color(): string
    {
        return match ($this) {
            self::ArsipBaru => 'success',
            self::ArsipDihapus => 'warning',
            self::ArsipDipulihkan => 'success',
            self::ArsipDihapusPermanen => 'danger',
            self::DokumenDiunggah => 'info',
            self::DokumenDiganti => 'warning',
            self::VersiDokumenBaru => 'info',
            self::TahapBerubah => 'info',
            self::PeminjamanDiajukan => 'info',
            self::PeminjamanDisetujui => 'success',
            self::PeminjamanDitolak => 'danger',
        };
    }
}
