<?php

namespace App\Models;

use Database\Factories\TingkatAksesArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Model Tingkat Akses Arsip.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $deskripsi
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<TingkatAksesArsipFactory>
 */
class TingkatAksesArsip extends Model
{
    /** @use HasFactory<TingkatAksesArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'tingkat_akses_arsip';

    /**
     * Atribut yang boleh diisi secara massal.
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
     * Scope tingkat akses aktif.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): TingkatAksesArsipFactory
    {
        return TingkatAksesArsipFactory::new();
    }
}
