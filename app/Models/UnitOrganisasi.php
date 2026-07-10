<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $singkatan
 * @property int|null $parent_id
 * @property int $urutan
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read UnitOrganisasi|null $parent
 * @property-read Collection<int, UnitOrganisasi> $children
 */
#[Fillable(['kode', 'nama', 'singkatan', 'parent_id', 'urutan', 'status'])]
class UnitOrganisasi extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     *
     * @var string
     */
    protected $table = 'unit_organisasi';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
        ];
    }

    /**
     * Relasi ke parent unit organisasi (Self-referencing).
     *
     * @return BelongsTo<UnitOrganisasi, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(UnitOrganisasi::class, 'parent_id');
    }

    /**
     * Relasi ke child unit organisasi (Self-referencing).
     *
     * @return HasMany<UnitOrganisasi, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(UnitOrganisasi::class, 'parent_id');
    }

    /**
     * Scope untuk memfilter unit organisasi yang aktif.
     *
     * @param  Builder<UnitOrganisasi>  $query
     * @return Builder<UnitOrganisasi>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope untuk memfilter unit organisasi tingkat teratas (root).
     *
     * @param  Builder<UnitOrganisasi>  $query
     * @return Builder<UnitOrganisasi>
     */
    public function scopeRoot(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }
}
