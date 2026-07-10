<?php

namespace App\Interfaces;

interface AiServiceInterface
{
    /**
     * Klasifikasi dokumen menggunakan AI.
     *
     * @return array<string, mixed>
     */
    public function classifyDocument(string $text): array;

    /**
     * Generate ringkasan dokumen menggunakan AI.
     */
    public function summarize(string $text): string;
}
