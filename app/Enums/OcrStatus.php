<?php

declare(strict_types=1);

namespace App\Enums;

enum OcrStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';

    /**
     * Label yang ditampilkan ke pengguna.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu',
            self::Processing => 'Diproses',
            self::Completed => 'Selesai',
            self::Failed => 'Gagal',
        };
    }

    /**
     * Apakah status ini dapat diproses ulang.
     */
    public function isReprocessable(): bool
    {
        return match ($this) {
            self::Completed, self::Failed => true,
            default => false,
        };
    }
}
