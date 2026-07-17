<?php

namespace App\Interfaces;

use App\Models\Arsip;
use Illuminate\Database\Eloquent\Builder;

interface SearchServiceInterface
{
    /**
     * Cari arsip berdasarkan kata kunci.
     *
     * @return Builder<Arsip>
     */
    public function search(string $keyword): Builder;

    /**
     * Cari arsip berdasarkan filter lanjutan.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Arsip>
     */
    public function advancedSearch(array $filters): Builder;
}
