<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\KategoriArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriArsip extends Model
{
    /** @use HasFactory<KategoriArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel di database.
     */
    protected $table = 'kategori_arsip';

    /**
     * Atribut yang dapat diisi.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
        'status',
    ];

    /**
     * Scope query untuk hanya mengambil data yang aktif.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Generate unique sequential kode kategori arsip.
     * Prefix: KAT-
     */
    public static function generateKode(): string
    {
        $prefix = 'KAT-';

        $last = static::where('kode', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;
        if ($last && preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $last->kode, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        $kode = $prefix.str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);

        while (static::where('kode', $kode)->exists()) {
            $nextNumber++;
            $kode = $prefix.str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
        }

        return $kode;
    }
}
