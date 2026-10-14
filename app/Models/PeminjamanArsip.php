<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PeminjamanStatus;
use Database\Factories\PeminjamanArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Model PeminjamanArsip.
 *
 * @property int $id
 * @property int $arsip_id
 * @property int $pemohon_id
 * @property string $alasan
 * @property PeminjamanStatus $status
 * @property string|null $catatan_peninjau
 * @property int|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read Arsip $arsip
 * @property-read User $pemohon
 * @property-read User|null $reviewer
 *
 * @method static Builder<static> pending()
 */
class PeminjamanArsip extends Model
{
    /** @use HasFactory<PeminjamanArsipFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'peminjaman_arsip';

    protected $fillable = [
        'arsip_id',
        'pemohon_id',
        'alasan',
        'status',
        'catatan_peninjau',
        'reviewed_by',
        'reviewed_at',
    ];

    /**
     * Cast untuk atribut model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PeminjamanStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Relasi ke Arsip.
     *
     * @return BelongsTo<Arsip, $this>
     */
    public function arsip(): BelongsTo
    {
        return $this->belongsTo(Arsip::class, 'arsip_id');
    }

    /**
     * Relasi ke User pemohon.
     *
     * @return BelongsTo<User, $this>
     */
    public function pemohon(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pemohon_id');
    }

    /**
     * Relasi ke User peninjau.
     *
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope peminjaman yang masih pending.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', PeminjamanStatus::Pending);
    }
}
