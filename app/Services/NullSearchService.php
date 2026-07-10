<?php

namespace App\Services;

use App\Interfaces\SearchServiceInterface;
use RuntimeException;

class NullSearchService implements SearchServiceInterface
{
    /**
     * Indeks dokumen ke mesin pencari.
     *
     * @param  array<string, mixed>  $documents
     */
    public function index(string $index, array $documents): void
    {
        throw new RuntimeException('Fitur pencarian belum diimplementasikan.');
    }

    /**
     * Cari dokumen pada mesin pencari.
     *
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public function search(string $index, string $query, array $options = []): array
    {
        throw new RuntimeException('Fitur pencarian belum diimplementasikan.');
    }

    /**
     * Hapus dokumen dari indeks.
     */
    public function delete(string $index, int|string $id): void
    {
        throw new RuntimeException('Fitur pencarian belum diimplementasikan.');
    }
}
