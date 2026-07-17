<?php

namespace App\Services;

use App\Interfaces\SearchServiceInterface;
use App\Models\Arsip;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

class NullSearchService implements SearchServiceInterface
{
    /**
     * Cari arsip berdasarkan kata kunci.
     *
     * @return Builder<Arsip>
     */
    public function search(string $keyword): Builder
    {
        throw new RuntimeException('Fitur pencarian belum diimplementasikan.');
    }

    /**
     * Cari arsip berdasarkan filter lanjutan.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Arsip>
     */
    public function advancedSearch(array $filters): Builder
    {
        throw new RuntimeException('Fitur pencarian belum diimplementasikan.');
    }
}
