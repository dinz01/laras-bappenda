<?php

namespace App\Interfaces;

interface TteServiceInterface
{
    /**
     * Tanda tangani dokumen secara elektronik.
     *
     * @param  array<string, mixed>  $signerData
     * @return string Path file yang telah ditandatangani
     */
    public function sign(string $filePath, array $signerData): string;

    /**
     * Verifikasi tanda tangan elektronik dokumen.
     */
    public function verify(string $filePath): bool;
}
