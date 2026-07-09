<?php

namespace App\Interfaces;

interface SearchServiceInterface
{
    /**
     * Indeks dokumen ke mesin pencari.
     *
     * @param  string  $index
     * @param  array<string, mixed>  $documents
     * @return void
     */
    public function index(string $index, array $documents): void;

    /**
     * Cari dokumen pada mesin pencari.
     *
     * @param  string  $index
     * @param  string  $query
     * @param  array<string, mixed>  $options
     * @return array<string, mixed>
     */
    public function search(string $index, string $query, array $options = []): array;

    /**
     * Hapus dokumen dari indeks.
     *
     * @param  string  $index
     * @param  int|string  $id
     * @return void
     */
    public function delete(string $index, int|string $id): void;
}
