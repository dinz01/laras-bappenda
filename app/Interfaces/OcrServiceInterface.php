<?php

declare(strict_types=1);

namespace App\Interfaces;

use App\DTOs\OcrResult;

interface OcrServiceInterface
{
    /**
     * Ekstrak teks mentah dari file dokumen.
     */
    public function extractText(string $filePath): string;

    /**
     * Analisis dokumen dan kembalikan hasil OCR lengkap.
     */
    public function analyze(string $filePath): OcrResult;

    /**
     * Cek apakah OCR service tersedia dan siap digunakan.
     */
    public function health(): bool;
}
