<?php

namespace App\Interfaces;

interface OcrServiceInterface
{
    /**
     * Ekstrak teks dari file dokumen.
     */
    public function extractText(string $filePath): string;
}
