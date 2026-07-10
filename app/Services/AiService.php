<?php

namespace App\Services;

use App\Interfaces\AiServiceInterface;
use RuntimeException;

class AiService implements AiServiceInterface
{
    /**
     * Klasifikasi dokumen menggunakan AI.
     *
     * @return array<string, mixed>
     */
    public function classifyDocument(string $text): array
    {
        throw new RuntimeException('Belum diimplementasikan.');
    }

    /**
     * Generate ringkasan dokumen menggunakan AI.
     */
    public function summarize(string $text): string
    {
        throw new RuntimeException('Belum diimplementasikan.');
    }
}
