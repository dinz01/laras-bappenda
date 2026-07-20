<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\KlasifikasiArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Klasifikasi Arsip.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $deskripsi
 * @property int $retensi_aktif
 * @property int $retensi_inaktif
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Arsip> $arsips
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<KlasifikasiArsipFactory>
 */
class KlasifikasiArsip extends Model
{
    /** @use HasFactory<KlasifikasiArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'klasifikasi_arsip';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'deskripsi',
        'retensi_aktif',
        'retensi_inaktif',
        'status',
    ];

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'retensi_aktif' => 'integer',
            'retensi_inaktif' => 'integer',
        ];
    }

    /**
     * Scope klasifikasi aktif.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Arsip yang menggunakan klasifikasi ini.
     *
     * @return HasMany<Arsip, $this>
     */
    public function arsips(): HasMany
    {
        return $this->hasMany(Arsip::class, 'klasifikasi_arsip_id');
    }

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): KlasifikasiArsipFactory
    {
        return KlasifikasiArsipFactory::new();
    }
}
