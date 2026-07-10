<?php

namespace App\Services;

use App\Interfaces\AiServiceInterface;
use RuntimeException;

class NullAiService implements AiServiceInterface
{
    /**
     * Klasifikasi dokumen menggunakan AI.
     *
     * @return array<string, mixed>
     */
    public function classifyDocument(string $text): array
    {
        throw new RuntimeException('Fitur AI belum diimplementasikan.');
    }

    /**
     * Generate ringkasan dokumen menggunakan AI.
     */
    public function summarize(string $text): string
    {
        throw new RuntimeException('Fitur AI belum diimplementasikan.');
    }
}
