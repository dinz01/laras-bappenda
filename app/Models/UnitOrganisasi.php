<?php

namespace App\Models;

use Database\Factories\UnitOrganisasiFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Unit Organisasi.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $singkatan
 * @property int|null $parent_id
 * @property string $status
 * @property int|null $arsips_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read UnitOrganisasi|null $parent
 * @property-read Collection<int, UnitOrganisasi> $children
 * @property-read Collection<int, Arsip> $arsips
 * @property-read Collection<int, User> $users
 *
 * @method static Builder<static> active()
 * @method static Builder<static> root()
 *
 * @use HasFactory<UnitOrganisasiFactory>
 */
class UnitOrganisasi extends Model
{
    /** @use HasFactory<UnitOrganisasiFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'unit_organisasi';

    /**
     * Atribut yang boleh diisi.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'singkatan',
        'tipe',
        'parent_id',
        'status',
    ];

    /**
     * Relasi ke parent unit organisasi.
     *
     * @return BelongsTo<UnitOrganisasi, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Relasi ke seluruh child unit organisasi.
     *
     * @return HasMany<UnitOrganisasi, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * Format unit organisasi ini untuk keperluan tampilan (Bidang/Sub Bidang/UPT terpisah).
     *
     * @return array{bidang: string|null, sub_bidang: string|null, upt: string|null}
     */
    public function toDisplayArray(): array
    {
        return match ($this->tipe) {
            'sub_bidang' => [
                'bidang' => $this->parent?->nama,
                'sub_bidang' => $this->nama,
                'upt' => null,
            ],
            'bidang' => [
                'bidang' => $this->nama,
                'sub_bidang' => null,
                'upt' => null,
            ],
            'upt' => [
                'bidang' => null,
                'sub_bidang' => null,
                'upt' => $this->nama,
            ],
            default => [
                'bidang' => null,
                'sub_bidang' => null,
                'upt' => null,
            ],
        };
    }

    /**
     * Relasi ke arsip yang menggunakan unit organisasi ini.
     *
     * @return HasMany<Arsip, $this>
     */
    public function arsips(): HasMany
    {
        return $this->hasMany(Arsip::class, 'unit_organisasi_id');
    }

    /**
     * Relasi ke seluruh user yang berada di unit organisasi ini.
     *
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'unit_organisasi_id');
    }

    /**
     * Scope unit aktif.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope unit level root.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeRoot(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Generate unique sequential kode unit organisasi berdasarkan tipe.
     * Prefix: BID- (bidang), SUB- (sub_bidang), UPT- (upt).
     */
    public static function generateKode(string $tipe): string
    {
        $prefix = match ($tipe) {
            'bidang' => 'BID-',
            'sub_bidang' => 'SUB-',
            'upt' => 'UPT-',
            default => 'UN-',
        };

        $lastUnit = static::where('kode', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;
        if ($lastUnit && preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $lastUnit->kode, $matches)) {
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
     * Dapatkan ID unit organisasi beserta seluruh ID turunannya secara rekursif.
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
     * Dapatkan semua ID unit organisasi turunan (termasuk diri sendiri jika $includeSelf = true).
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
    protected static function newFactory(): UnitOrganisasiFactory
    {
        return UnitOrganisasiFactory::new();
    }
}
