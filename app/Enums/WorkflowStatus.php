<?php

declare(strict_types=1);

namespace App\Enums;

enum WorkflowStatus: string
{
    case Draft = 'draft';
    case Review = 'review';
    case Revisi = 'revisi';
    case Approved = 'approved';
    case Active = 'active';
    case Retention = 'retention';
    case RecordCenter = 'record_center';
    case Destruction = 'destruction';

    /**
     * Label bahasa Indonesia untuk ditampilkan ke pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Review => 'Menunggu Verifikasi',
            self::Revisi => 'Perlu Revisi',
            self::Approved => 'Disetujui',
            self::Active => 'Arsip Aktif',
            self::Retention => 'Retensi',
            self::RecordCenter => 'Record Center',
            self::Destruction => 'Pemusnahan',
        };
    }

    /**
     * Warna badge untuk tampilan frontend.
     * Menggunakan nilai yang kompatibel dengan StatusBadge component.
     */
    public function color(): string
    {
        return match ($this) {
            self::Draft => 'secondary',
            self::Review => 'warning',
            self::Revisi => 'danger',
            self::Approved => 'info',
            self::Active => 'success',
            self::Retention => 'warning',
            self::RecordCenter => 'secondary',
            self::Destruction => 'danger',
        };
    }

    /**
     * Daftar status tujuan yang diizinkan dari status saat ini.
     *
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Review],
            self::Review => [self::Approved, self::Revisi],
            self::Revisi => [self::Review],
            self::Approved => [self::Active],
            self::Active => [self::Retention],
            self::Retention => [self::RecordCenter],
            self::RecordCenter => [self::Destruction],
            self::Destruction => [],
        };
    }

    /**
     * Apakah status ini dapat bertransisi ke status target.
     */
    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), strict: true);
    }
}
