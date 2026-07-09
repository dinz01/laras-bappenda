<?php

namespace App\Services;

use App\Interfaces\TteServiceInterface;
use RuntimeException;

class TteService implements TteServiceInterface
{
    /**
     * Tanda tangani dokumen secara elektronik.
     *
     * @param  string  $filePath
     * @param  array<string, mixed>  $signerData
     * @return string
     */
    public function sign(string $filePath, array $signerData): string
    {
        throw new RuntimeException('Belum diimplementasikan.');
    }

    /**
     * Verifikasi tanda tangan elektronik dokumen.
     *
     * @param  string  $filePath
     * @return bool
     */
    public function verify(string $filePath): bool
    {
        throw new RuntimeException('Belum diimplementasikan.');
    }
}
