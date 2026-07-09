<?php

namespace App\Interfaces;

interface AiServiceInterface
{
    /**
     * Klasifikasi dokumen menggunakan AI.
     *
     * @param  string  $text
     * @return array<string, mixed>
     */
    public function classifyDocument(string $text): array;

    /**
     * Generate ringkasan dokumen menggunakan AI.
     *
     * @param  string  $text
     * @return string
     */
    public function summarize(string $text): string;
}
