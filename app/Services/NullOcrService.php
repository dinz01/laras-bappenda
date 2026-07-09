<?php

namespace App\Services;

use App\Interfaces\OcrServiceInterface;
use RuntimeException;

class NullOcrService implements OcrServiceInterface
{
    /**
     * Ekstrak teks dari file dokumen.
     *
     * @param  string  $filePath
     * @return string
     */
    public function extractText(string $filePath): string
    {
        throw new RuntimeException('Fitur OCR belum diimplementasikan.');
    }
}
