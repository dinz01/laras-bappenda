<?php

declare(strict_types=1);

namespace App\DTOs;

/**
 * Immutable value object hasil analisis OCR.
 *
 * @phpstan-immutable
 */
final readonly class OcrResult
{
    /**
     * @param  string  $text  Teks yang diekstrak
     * @param  int  $pages  Jumlah halaman yang diproses
     * @param  string  $language  Kode bahasa (mis. 'id', 'en')
     * @param  float  $confidence  Tingkat keyakinan 0–100
     * @param  string  $processedAt  Timestamp pemrosesan (ISO 8601)
     * @param  int  $processingTimeMs  Waktu proses dalam milidetik
     */
    public function __construct(
        public readonly string $text,
        public readonly int $pages,
        public readonly string $language,
        public readonly float $confidence,
        public readonly string $processedAt,
        public readonly int $processingTimeMs,
    ) {}

    /**
     * Konversi ke array untuk disimpan ke database atau dikembalikan sebagai JSON.
     *
     * @return array{text: string, pages: int, language: string, confidence: float, processed_at: string, processing_time_ms: int}
     */
    public function toArray(): array
    {
        return [
            'text' => $this->text,
            'pages' => $this->pages,
            'language' => $this->language,
            'confidence' => $this->confidence,
            'processed_at' => $this->processedAt,
            'processing_time_ms' => $this->processingTimeMs,
        ];
    }
}
