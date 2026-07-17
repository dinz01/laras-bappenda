<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\OcrResult;
use App\Interfaces\OcrServiceInterface;
use Illuminate\Support\Carbon;

class NullOcrService implements OcrServiceInterface
{
    /**
     * Ekstrak teks dari file dokumen.
     */
    public function extractText(string $filePath): string
    {
        return '';
    }

    /**
     * Analisis dokumen (stub — belum diimplementasikan).
     */
    public function analyze(string $filePath): OcrResult
    {
        return new OcrResult(
            text: '',
            pages: 0,
            language: 'id',
            confidence: 0.0,
            processedAt: Carbon::now()->toIso8601String(),
            processingTimeMs: 0,
        );
    }

    /**
     * Cek kesehatan service (selalu false karena tidak diimplementasikan).
     */
    public function health(): bool
    {
        return false;
    }
}
