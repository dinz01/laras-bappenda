<?php

namespace App\Models;

use Database\Factories\LokasiArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Lokasi Arsip.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $gedung
 * @property string|null $lantai
 * @property string|null $ruangan
 * @property string|null $rak
 * @property string|null $box
 * @property string|null $keterangan
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Arsip> $arsips
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<LokasiArsipFactory>
 */
class LokasiArsip extends Model
{
    /** @use HasFactory<LokasiArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'lokasi_arsip';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'gedung',
        'lantai',
        'ruangan',
        'rak',
        'box',
        'keterangan',
        'status',
    ];

    /**
     * Scope lokasi aktif.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Relasi ke Arsip.
     *
     * @return HasMany<Arsip, $this>
     */
    public function arsips(): HasMany
    {
        return $this->hasMany(Arsip::class, 'lokasi_arsip_id');
    }

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): LokasiArsipFactory
    {
        return LokasiArsipFactory::new();
    }
}
