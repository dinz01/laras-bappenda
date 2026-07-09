<?php

namespace App\Interfaces;

interface OcrServiceInterface
{
    /**
     * Ekstrak teks dari file dokumen.
     *
     * @param  string  $filePath
     * @return string
     */
    public function extractText(string $filePath): string;
}
