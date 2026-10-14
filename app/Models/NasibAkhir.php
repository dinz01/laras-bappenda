<?php

namespace App\Models;

use Database\Factories\NasibAkhirFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Nasib Akhir.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $keterangan
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, KlasifikasiArsip> $klasifikasiArsip
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<NasibAkhirFactory>
 */
class NasibAkhir extends Model
{
    /** @use HasFactory<NasibAkhirFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'nasib_akhir';

    /**
     * Atribut yang boleh diisi.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'keterangan',
        'status',
    ];

    /**
     * Scope status aktif.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Relasi ke KlasifikasiArsip.
     *
     * @return HasMany<KlasifikasiArsip, $this>
     */
    public function klasifikasiArsip(): HasMany
    {
        return $this->hasMany(KlasifikasiArsip::class, 'nasib_akhir_id');
    }

    /**
     * Generate kode nasib akhir otomatis dengan prefix NSB-.
     */
    public static function generateKode(): string
    {
        $prefix = 'NSB-';

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
    protected static function newFactory(): NasibAkhirFactory
    {
        return NasibAkhirFactory::new();
    }
}
