<?php

namespace App\Models;

use Database\Factories\JenisArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Jenis Arsip.
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
 * @use HasFactory<JenisArsipFactory>
 */
class JenisArsip extends Model
{
    /** @use HasFactory<JenisArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'jenis_arsip';

    /**
     * Atribut yang boleh diisi.
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
     * Scope jenis aktif.
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
    public function arsip(): HasMany
    {
        return $this->hasMany(Arsip::class, 'jenis_arsip_id');
    }

    /**
     * Generate unique sequential kode jenis arsip.
     * Prefix: JNS-
     */
    public static function generateKode(): string
    {
        $prefix = 'JNS-';

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

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): JenisArsipFactory
    {
        return JenisArsipFactory::new();
    }
}
