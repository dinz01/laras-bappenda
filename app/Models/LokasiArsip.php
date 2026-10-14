<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\LokasiArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Lokasi Arsip.
 *
 * @property int $id
 * @property int|null $parent_id
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
 * @property-read LokasiArsip|null $parent
 * @property-read Collection<int, LokasiArsip> $children
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
     * Atribut yang boleh diisi.
     *
     * @var list<string>
     */
    protected $fillable = [
        'parent_id',
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
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'parent_id' => 'integer',
        ];
    }

    /**
     * Relasi ke Parent Lokasi.
     *
     * @return BelongsTo<LokasiArsip, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(LokasiArsip::class, 'parent_id');
    }

    /**
     * Relasi ke Sub Lokasi (Children).
     *
     * @return HasMany<LokasiArsip, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(LokasiArsip::class, 'parent_id')->orderBy('kode');
    }

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
     * Generate unique sequential kode lokasi arsip.
     * Prefix: LOC-
     */
    public static function generateKode(): string
    {
        $prefix = 'LOC-';

        $lastLokasi = static::where('kode', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;
        if ($lastLokasi && preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $lastLokasi->kode, $matches)) {
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
     * Dapatkan ID lokasi beserta seluruh ID turunannya secara rekursif.
     *
     * @return list<int>
     */
    public static function getSelfAndDescendantIds(int $id, bool $includeSelf = true): array
    {
        $locations = static::query()->get(['id', 'parent_id']);

        $childrenMap = [];
        foreach ($locations as $loc) {
            if ($loc->parent_id !== null) {
                $childrenMap[(int) $loc->parent_id][] = (int) $loc->id;
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
     * Dapatkan semua ID lokasi turunan (termasuk diri sendiri jika $includeSelf = true).
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
    protected static function newFactory(): LokasiArsipFactory
    {
        return LokasiArsipFactory::new();
    }
}
