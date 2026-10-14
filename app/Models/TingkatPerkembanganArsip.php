<?php

namespace App\Models;

use Database\Factories\TingkatPerkembanganArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Tingkat Perkembangan Arsip.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $deskripsi
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Arsip> $arsips
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<TingkatPerkembanganArsipFactory>
 */
class TingkatPerkembanganArsip extends Model
{
    /** @use HasFactory<TingkatPerkembanganArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'tingkat_perkembangan_arsip';

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
     * Scope tingkat perkembangan aktif.
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
        return $this->hasMany(Arsip::class, 'tingkat_perkembangan_arsip_id');
    }

    /**
     * Generate unique sequential kode tingkat perkembangan arsip.
     * Prefix: TPA-
     */
    public static function generateKode(): string
    {
        $prefix = 'TPA-';

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
    protected static function newFactory(): TingkatPerkembanganArsipFactory
    {
        return TingkatPerkembanganArsipFactory::new();
    }
}
