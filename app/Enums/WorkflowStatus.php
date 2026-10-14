<?php

declare(strict_types=1);

namespace App\Enums;

use Illuminate\Support\Str;

enum WorkflowStatus: string
{
    case Review = 'review';
    case Revisi = 'revisi';
    case Approved = 'approved';
    case WaitingTte = 'waiting_tte';
    case Active = 'active';
    case Inactive = 'inactive';
    case Musnah = 'musnah';
    case Permanen = 'permanen';
    case DinilaiKembali = 'dinilai_kembali';

    /**
     * Dapatkan string status dari nama nasib akhir.
     */
    public static function fromNasibAkhir(?string $nama): string
    {
        if (empty($nama)) {
            return self::Inactive->value;
        }

        $slug = Str::slug($nama, '_');

        return self::tryFrom($slug)?->value ?? $slug;
    }

    /**
     * Label bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Review => 'Menunggu Review',
            self::Revisi => 'Revisi',
            self::Approved => 'Disetujui',
            self::WaitingTte => 'Menunggu TTE',
            self::Active => 'Aktif',
            self::Inactive => 'Inaktif',
            self::Musnah => 'Musnah',
            self::Permanen => 'Permanen',
            self::DinilaiKembali => 'Dinilai Kembali',
        };
    }

    /**
     * Warna badge.
     */
    public function color(): string
    {
        return match ($this) {
            self::Review => 'warning',
            self::Revisi => 'danger',
            self::Approved => 'info',
            self::WaitingTte => 'info',
            self::Active => 'success',
            self::Inactive => 'secondary',
            self::Musnah => 'danger',
            self::Permanen => 'success',
            self::DinilaiKembali => 'info',
        };
    }

    /**
     * Transisi status.
     *
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Review => [
                self::Approved,
                self::WaitingTte,
                self::Revisi,
            ],

            self::Revisi => [
                self::Review,
            ],

            self::Approved => [
                self::WaitingTte,
                self::Active,
            ],

            self::WaitingTte => [
                self::Active,
                self::Inactive,
                self::Musnah,
                self::Permanen,
                self::DinilaiKembali,
            ],

            self::Active => [
                self::Inactive,
                self::Musnah,
                self::Permanen,
                self::DinilaiKembali,
            ],

            self::Inactive => [
                self::Musnah,
                self::Permanen,
                self::DinilaiKembali,
            ],

            self::Musnah => [],
            self::Permanen => [],
            self::DinilaiKembali => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
