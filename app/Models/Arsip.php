<?php

namespace App\Models;

use App\Enums\WorkflowStatus;
use Database\Factories\ArsipFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * Model Arsip.
 *
 * @property int $id
 * @property string $nomor_arsip
 * @property string $judul
 * @property string|null $deskripsi
 * @property Carbon $tanggal_arsip
 * @property int|null $jenis_arsip_id
 * @property int $klasifikasi_arsip_id
 * @property int|null $sifat_arsip_id
 * @property int|null $lokasi_arsip_id
 * @property int|null $media_arsip_id
 * @property int|null $kondisi_arsip_id
 * @property int|null $status_arsip_id
 * @property int|null $tingkat_akses_arsip_id
 * @property int|null $tingkat_perkembangan_arsip_id
 * @property int|null $retensi_arsip_id
 * @property int|null $unit_organisasi_id
 * @property int|null $created_by
 * @property WorkflowStatus $workflow_status
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read JenisArsip|null $jenisArsip
 * @property-read KlasifikasiArsip $klasifikasiArsip
 * @property-read SifatArsip|null $sifatArsip
 * @property-read LokasiArsip|null $lokasiArsip
 * @property-read MediaArsip|null $mediaArsip
 * @property-read KondisiArsip|null $kondisiArsip
 * @property-read StatusArsip|null $statusArsip
 * @property-read TingkatAksesArsip|null $tingkatAksesArsip
 * @property-read TingkatPerkembanganArsip|null $tingkatPerkembanganArsip
 * @property-read RetensiArsip|null $retensiArsip
 * @property-read UnitOrganisasi|null $unitOrganisasi
 * @property-read User|null $creator
 * @property-read DokumenArsip|null $dokumen
 * @property-read Collection<int, ArsipWorkflowHistory> $workflowHistories
 *
 * @method static Builder<static> active()
 *
 * @use HasFactory<ArsipFactory>
 */
class Arsip extends Model
{
    /** @use HasFactory<ArsipFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'arsip';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
    'nomor_arsip',
    'judul',
    'deskripsi',
    'tanggal_arsip',
    'jenis_arsip_id',
    'klasifikasi_arsip_id',
    'sifat_arsip_id',
    'lokasi_arsip_id',
    'media_arsip_id',
    'kondisi_arsip_id',
    'status_arsip_id',
    'tingkat_akses_arsip_id',
    'tingkat_perkembangan_arsip_id',
    'retensi_arsip_id',
    'unit_organisasi_id',
    'created_by',
    'workflow_status',
    'catatan_revisi',
    ];

    /**
     * Cast untuk atribut model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_arsip' => 'date',
            'workflow_status' => WorkflowStatus::class,
        ];
    }

    /**
     * Relasi ke Klasifikasi Arsip.
     *
     * @return BelongsTo<KlasifikasiArsip, $this>
     */
    public function klasifikasiArsip(): BelongsTo
    {
        return $this->belongsTo(KlasifikasiArsip::class, 'klasifikasi_arsip_id');
    }

    /**
     * Relasi ke Lokasi Arsip.
     *
     * @return BelongsTo<LokasiArsip, $this>
     */
    public function lokasiArsip(): BelongsTo
    {
        return $this->belongsTo(LokasiArsip::class, 'lokasi_arsip_id');
    }

    /**
     * Relasi ke Jenis Arsip.
     *
     * @return BelongsTo<JenisArsip, $this>
     */
    public function jenisArsip(): BelongsTo
    {
        return $this->belongsTo(JenisArsip::class, 'jenis_arsip_id');
    }

    /**
     * Relasi ke Sifat Arsip.
     *
     * @return BelongsTo<SifatArsip, $this>
     */
    public function sifatArsip(): BelongsTo
    {
        return $this->belongsTo(SifatArsip::class, 'sifat_arsip_id');
    }

    /**
     * Relasi ke Media Arsip.
     *
     * @return BelongsTo<MediaArsip, $this>
     */
    public function mediaArsip(): BelongsTo
    {
        return $this->belongsTo(MediaArsip::class, 'media_arsip_id');
    }

    /**
     * Relasi ke Kondisi Arsip.
     *
     * @return BelongsTo<KondisiArsip, $this>
     */
    public function kondisiArsip(): BelongsTo
    {
        return $this->belongsTo(KondisiArsip::class, 'kondisi_arsip_id');
    }

    /**
     * Relasi ke Status Arsip.
     *
     * @return BelongsTo<StatusArsip, $this>
     */
    public function statusArsip(): BelongsTo
    {
        return $this->belongsTo(StatusArsip::class, 'status_arsip_id');
    }

    /**
     * Relasi ke Tingkat Akses Arsip.
     *
     * @return BelongsTo<TingkatAksesArsip, $this>
     */
    public function tingkatAksesArsip(): BelongsTo
    {
        return $this->belongsTo(TingkatAksesArsip::class, 'tingkat_akses_arsip_id');
    }

    /**
     * Relasi ke Tingkat Perkembangan Arsip.
     *
     * @return BelongsTo<TingkatPerkembanganArsip, $this>
     */
    public function tingkatPerkembanganArsip(): BelongsTo
    {
        return $this->belongsTo(TingkatPerkembanganArsip::class, 'tingkat_perkembangan_arsip_id');
    }

    /**
     * Relasi ke Retensi Arsip.
     *
     * @return BelongsTo<RetensiArsip, $this>
     */
    public function retensiArsip(): BelongsTo
    {
        return $this->belongsTo(RetensiArsip::class, 'retensi_arsip_id');
    }

    /**
     * Relasi ke Unit Organisasi.
     *
     * @return BelongsTo<UnitOrganisasi, $this>
     */
    public function unitOrganisasi(): BelongsTo
    {
        return $this->belongsTo(UnitOrganisasi::class, 'unit_organisasi_id');
    }

    /**
     * Relasi ke Pembuat Arsip (User).
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi ke Riwayat Workflow.
     *
     * @return HasMany<ArsipWorkflowHistory, $this>
     */
    public function workflowHistories(): HasMany
    {
        return $this->hasMany(ArsipWorkflowHistory::class, 'arsip_id')->latest();
    }

    /**
     * Relasi ke Dokumen Fisik Arsip.
     *
     * @return HasOne<DokumenArsip, $this>
     */
    public function dokumen(): HasOne
    {
        return $this->hasOne(DokumenArsip::class, 'arsip_id');
    }

    /**
     * Relasi ke seluruh riwayat TTE arsip ini.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<TteSignature, $this>
     */
    public function tteSignatures(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TteSignature::class, 'arsip_id')->latest('signed_at');
    }

    /**
     * Scope arsip aktif (berdasarkan status_arsip = aktif).
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereHas('statusArsip', function ($q) {
            $q->where('kode', 'SA-00001'); // Kode untuk status 'Aktif'
        });
    }

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): ArsipFactory
    {
        return ArsipFactory::new();
    }
}
