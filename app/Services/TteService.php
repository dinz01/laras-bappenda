<?php

namespace App\Services;

use App\Interfaces\TteServiceInterface;
use RuntimeException;

class TteService implements TteServiceInterface
{
    /**
     * Tanda tangani dokumen secara elektronik.
     *
     * @param  array<string, mixed>  $signerData
     */
    public function sign(string $filePath, array $signerData): string
    {
        throw new RuntimeException('Belum diimplementasikan.');
    }

    /**
     * Verifikasi tanda tangan elektronik dokumen.
     */
    public function verify(string $filePath): bool
    {
        throw new RuntimeException('Belum diimplementasikan.');
    }
}
