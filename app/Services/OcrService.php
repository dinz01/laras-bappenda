<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\OcrResult;
use App\Interfaces\OcrServiceInterface;
use RuntimeException;

/**
 * OcrService production — ganti implementasi ini dengan provider nyata.
 *
 * Saat ini akan throw RuntimeException jika dipanggil.
 * Gunakan MockOcrService untuk development/testing.
 */
class OcrService implements OcrServiceInterface
{
    /**
     * Ekstrak teks dari file dokumen.
     */
    public function extractText(string $filePath): string
    {
        throw new RuntimeException('OcrService belum diimplementasikan. Gunakan MockOcrService.');
    }

    /**
     * Analisis dokumen dan kembalikan hasil OCR lengkap.
     */
    public function analyze(string $filePath): OcrResult
    {
        throw new RuntimeException('OcrService belum diimplementasikan. Gunakan MockOcrService.');
    }

    /**
     * Cek apakah OCR service tersedia.
     */
    public function health(): bool
    {
        return false;
    }
}
