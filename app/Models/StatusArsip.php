<?php

namespace App\Models;

use Database\Factories\StatusArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Model Status Arsip.
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
 * @use HasFactory<StatusArsipFactory>
 */
class StatusArsip extends Model
{
    /** @use HasFactory<StatusArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'status_arsip';

    /**
     * Atribut yang boleh diisi secara massal.
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
     * Factory untuk model ini.
     */
    protected static function newFactory(): StatusArsipFactory
    {
        return StatusArsipFactory::new();
    }
}
