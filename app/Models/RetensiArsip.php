<?php

namespace App\Models;

use Database\Factories\RetensiArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Model Retensi Arsip.
 *
 * @property int $id
 * @property string $kode
 * @property string $nama
 * @property int $retensi_aktif
 * @property int $retensi_inaktif
 * @property string|null $nasib_akhir
 * @property int|null $metode_penyusutan_arsip_id
 * @property string|null $keterangan
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read MetodePenyusutanArsip|null $metodePenyusutanArsip
 * @property-read Collection<int, KlasifikasiArsip> $klasifikasiArsip
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<RetensiArsipFactory>
 */
class RetensiArsip extends Model
{
    /** @use HasFactory<RetensiArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'retensi_arsip';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'retensi_aktif',
        'retensi_inaktif',
        'nasib_akhir',
        'metode_penyusutan_arsip_id',
        'keterangan',
        'status',
    ];

    /**
     * Cast untuk atribut model.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'retensi_aktif' => 'integer',
        'retensi_inaktif' => 'integer',
    ];

    /**
     * Relasi ke Metode Penyusutan Arsip.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<MetodePenyusutanArsip, $this>
     */
    public function metodePenyusutanArsip(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(MetodePenyusutanArsip::class, 'metode_penyusutan_arsip_id');
    }

    /**
     * Relasi ke Klasifikasi Arsip.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<KlasifikasiArsip, $this>
     */
    public function klasifikasiArsip(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(KlasifikasiArsip::class, 'retensi_arsip_id');
    }

    /**
     * Scope retensi aktif.
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
    protected static function newFactory(): RetensiArsipFactory
    {
        return RetensiArsipFactory::new();
    }
}
