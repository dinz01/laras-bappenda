<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\KlasifikasiArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Klasifikasi Arsip.
 *
 * @property int $id
 * @property int|null $parent_id
 * @property string $kode
 * @property string $nama
 * @property string|null $deskripsi
 * @property int|null $retensi_aktif
 * @property int|null $retensi_inaktif
 * @property int|null $nasib_akhir_id
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read KlasifikasiArsip|null $parent
 * @property-read Collection<int, KlasifikasiArsip> $children
 * @property-read NasibAkhir|null $nasibAkhir
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
     * Atribut yang boleh diisi.
     *
     * @var list<string>
     */
    protected $fillable = [
        'parent_id',
        'kode',
        'nama',
        'deskripsi',
        'retensi_aktif',
        'retensi_inaktif',
        'nasib_akhir_id',
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
            'parent_id' => 'integer',
            'retensi_aktif' => 'integer',
            'retensi_inaktif' => 'integer',
            'nasib_akhir_id' => 'integer',
        ];
    }

    /**
     * Relasi ke Parent Klasifikasi.
     *
     * @return BelongsTo<KlasifikasiArsip, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(KlasifikasiArsip::class, 'parent_id');
    }

    /**
     * Relasi ke Sub-Klasifikasi (Children).
     *
     * @return HasMany<KlasifikasiArsip, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(KlasifikasiArsip::class, 'parent_id')->orderBy('kode');
    }

    /**
     * Relasi ke Nasib Akhir.
     *
     * @return BelongsTo<NasibAkhir, $this>
     */
    public function nasibAkhir(): BelongsTo
    {
        return $this->belongsTo(NasibAkhir::class, 'nasib_akhir_id');
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
     * Dapatkan ID klasifikasi beserta seluruh ID turunannya secara rekursif.
     *
     * @return list<int>
     */
    public static function getSelfAndDescendantIds(int $id, bool $includeSelf = true): array
    {
        $items = static::query()->get(['id', 'parent_id']);

        $childrenMap = [];
        foreach ($items as $item) {
            if ($item->parent_id !== null) {
                $childrenMap[(int) $item->parent_id][] = (int) $item->id;
            }
        }

        $visited = [];
        $result = [];

        if ($includeSelf) {
            $result[] = $id;
            $visited[$id] = true;
        }

        $queue = [$id];

        while (! empty($queue)) {
            $currentId = array_shift($queue);
            if (isset($childrenMap[$currentId])) {
                foreach ($childrenMap[$currentId] as $childId) {
                    if (! isset($visited[$childId])) {
                        $visited[$childId] = true;
                        $result[] = $childId;
                        $queue[] = $childId;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Dapatkan semua ID klasifikasi turunan (termasuk diri sendiri jika $includeSelf = true).
     *
     * @return list<int>
     */
    public function getAllDescendantIds(bool $includeSelf = true): array
    {
        return static::getSelfAndDescendantIds($this->id, $includeSelf);
    }

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): KlasifikasiArsipFactory
    {
        return KlasifikasiArsipFactory::new();
    }
}
