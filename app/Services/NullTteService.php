<?php

namespace App\Services;

use App\Interfaces\TteServiceInterface;
use RuntimeException;

class NullTteService implements TteServiceInterface
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
        throw new RuntimeException('Fitur TTE belum diimplementasikan.');
    }

    /**
     * Verifikasi tanda tangan elektronik dokumen.
     *
     * @param  string  $filePath
     * @return bool
     */
    public function verify(string $filePath): bool
    {
        throw new RuntimeException('Fitur TTE belum diimplementasikan.');
    }
}
