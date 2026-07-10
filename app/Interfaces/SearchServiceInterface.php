<?php

namespace App\Interfaces;

interface SearchServiceInterface
{
    /**
     * Indeks dokumen ke mesin pencari.
     *
     * @param  array<string, mixed>  $documents
     */
    public function index(string $index, array $documents): void;

    /**
     * Cari dokumen pada mesin pencari.
     *
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public function search(string $index, string $query, array $options = []): array;

    /**
     * Hapus dokumen dari indeks.
     */
    public function delete(string $index, int|string $id): void;
}
