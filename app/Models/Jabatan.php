<?php

namespace App\Models;

use Database\Factories\JabatanFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model Jabatan.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property string|null $singkatan
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, User> $users
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<JabatanFactory>
 */
class Jabatan extends Model
{
    /** @use HasFactory<JabatanFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'jabatan';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'singkatan',
        'status',
    ];

    /**
     * Relasi ke seluruh user yang menduduki jabatan ini.
     *
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'jabatan_id');
    }

    /**
     * Scope jabatan aktif.
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
    protected static function newFactory(): JabatanFactory
    {
        return JabatanFactory::new();
    }
}
