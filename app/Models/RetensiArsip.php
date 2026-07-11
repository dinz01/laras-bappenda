<?php

namespace App\Models;

use Database\Factories\RetensiArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Model Retensi Arsip.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property int $retensi_aktif
 * @property int $retensi_inaktif
 * @property string|null $keterangan
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<RetensiArsipFactory>
 */
class RetensiArsip extends Model
{
    /** @use HasFactory<RetensiArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'retensi_arsip';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'retensi_aktif',
        'retensi_inaktif',
        'keterangan',
        'status',
    ];

    /**
     * Cast untuk atribut model.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'retensi_aktif' => 'integer',
        'retensi_inaktif' => 'integer',
    ];

    /**
     * Scope retensi aktif.
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
    protected static function newFactory(): RetensiArsipFactory
    {
        return RetensiArsipFactory::new();
    }
}
