<?php

namespace App\Models;

use App\Casts\WorkflowStatusCast;
use App\Enums\WorkflowStatus;
use Carbon\CarbonInterface;
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
 * @property int|null $kategori_arsip_id
 * @property string|null $no_register
 * @property string|null $nop
 * @property string|null $npwpd
 * @property string|null $nama_wajib_pajak
 * @property int|null $jenis_arsip_id
 * @property int $klasifikasi_arsip_id
 * @property int|null $sifat_arsip_id
 * @property int|null $lokasi_arsip_id
 * @property int|null $kondisi_arsip_id
 * @property int|null $tingkat_akses_arsip_id
 * @property int|null $tingkat_perkembangan_arsip_id
 * @property int|null $retensi_arsip_id
 * @property int|null $unit_organisasi_id
 * @property int|null $created_by
 * @property WorkflowStatus $workflow_status
 * @property Carbon|null $deleted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read KategoriArsip|null $kategoriArsip
 * @property-read JenisArsip|null $jenisArsip
 * @property-read KlasifikasiArsip $klasifikasiArsip
 * @property-read SifatArsip|null $sifatArsip
 * @property-read LokasiArsip|null $lokasiArsip
 * @property-read KondisiArsip|null $kondisiArsip
 * @property-read TingkatAksesArsip|null $tingkatAksesArsip
 * @property-read TingkatPerkembanganArsip|null $tingkatPerkembanganArsip
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
     * Atribut yang boleh diisi.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nomor_arsip',
        'judul',
        'deskripsi',
        'tanggal_arsip',
        'kategori_arsip_id',
        'no_register',
        'nop',
        'npwpd',
        'nama_wajib_pajak',
        'jenis_arsip_id',
        'klasifikasi_arsip_id',
        'sifat_arsip_id',
        'lokasi_arsip_id',
        'kondisi_arsip_id',
        'tingkat_akses_arsip_id',
        'tingkat_perkembangan_arsip_id',
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
            'workflow_status' => WorkflowStatusCast::class,
        ];
    }

    /**
     * Relasi ke Kategori Arsip.
     *
     * @return BelongsTo<KategoriArsip, $this>
     */
    public function kategoriArsip(): BelongsTo
    {
        return $this->belongsTo(KategoriArsip::class, 'kategori_arsip_id');
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
     * Relasi ke Kondisi Arsip.
     *
     * @return BelongsTo<KondisiArsip, $this>
     */
    public function kondisiArsip(): BelongsTo
    {
        return $this->belongsTo(KondisiArsip::class, 'kondisi_arsip_id');
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
     * @return HasMany<TteSignature, $this>
     */
    public function tteSignatures(): HasMany
    {
        return $this->hasMany(TteSignature::class, 'arsip_id')->latest('signed_at');
    }

    /**
     * Relasi ke permohonan peminjaman arsip ini.
     *
     * @return HasMany<PeminjamanArsip, $this>
     */
    public function peminjamans(): HasMany
    {
        return $this->hasMany(PeminjamanArsip::class, 'arsip_id')->latest();
    }

    /**
     * Scope arsip aktif (berdasarkan status_arsip = aktif).
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('workflow_status', WorkflowStatus::Active);
    }

    /**
     * Sinkronisasi status arsip aktif/inaktif/nasib akhir yang telah melewati masa retensi.
     */
    public static function syncExpiredRetentionStatus(): void
    {
        $candidateArsips = static::query()
            ->whereNotIn('workflow_status', [
                WorkflowStatus::Review->value,
                WorkflowStatus::Revisi->value,
                WorkflowStatus::Approved->value,
                WorkflowStatus::WaitingTte->value,
            ])
            ->with('klasifikasiArsip.nasibAkhir')
            ->get();

        foreach ($candidateArsips as $arsip) {
            $klasifikasi = $arsip->klasifikasiArsip;

            if ($klasifikasi && $klasifikasi->retensi_aktif !== null && $arsip->tanggal_arsip) {
                $tahunAktif = (int) $klasifikasi->retensi_aktif;
                $endActiveDate = $arsip->tanggal_arsip->copy()->addYears($tahunAktif);

                if (now()->startOfDay()->greaterThanOrEqualTo($endActiveDate->startOfDay())) {
                    // Tentukan target status berdasarkan masa inaktif dan nasib akhir
                    $newStatus = WorkflowStatus::Inactive;

                    if ($klasifikasi->retensi_inaktif !== null) {
                        $tahunInaktif = (int) $klasifikasi->retensi_inaktif;
                        $endInactiveDate = $endActiveDate->copy()->addYears($tahunInaktif);

                        if (now()->startOfDay()->greaterThanOrEqualTo($endInactiveDate->startOfDay())) {
                            $namaNasibAkhir = $klasifikasi->nasibAkhir?->nama;
                            $targetSlug = WorkflowStatus::fromNasibAkhir($namaNasibAkhir);

                            $newStatus = WorkflowStatus::tryFrom($targetSlug) ?? $targetSlug;
                        }
                    }

                    // Jangan turunkan status jika arsip sudah berada di tahap nasib akhir (bukan active/inactive)
                    $isAlreadyNasibAkhir = ! in_array($arsip->workflow_status, [
                        WorkflowStatus::Active,
                        WorkflowStatus::Inactive,
                    ], true);

                    if ($isAlreadyNasibAkhir && $newStatus === WorkflowStatus::Inactive) {
                        if ($klasifikasi->nasibAkhir) {
                            $namaNasibAkhir = $klasifikasi->nasibAkhir->nama;
                            $targetSlug = WorkflowStatus::fromNasibAkhir($namaNasibAkhir);
                            $newStatus = WorkflowStatus::tryFrom($targetSlug) ?? $targetSlug;
                        } else {
                            continue;
                        }
                    }

                    $currentStatusVal = $arsip->workflow_status instanceof WorkflowStatus
                        ? $arsip->workflow_status->value
                        : (is_object($arsip->workflow_status) && isset($arsip->workflow_status->value)
                            ? (string) $arsip->workflow_status->value
                            : (string) $arsip->workflow_status);

                    $newStatusVal = $newStatus instanceof WorkflowStatus
                        ? $newStatus->value
                        : (is_object($newStatus) && isset($newStatus->value)
                            ? (string) $newStatus->value
                            : (string) $newStatus);

                    if ($currentStatusVal === $newStatusVal) {
                        continue;
                    }

                    $arsip->update(['workflow_status' => $newStatus]);

                    ArsipWorkflowHistory::create([
                        'arsip_id' => $arsip->id,
                        'status_lama' => $currentStatusVal,
                        'status_baru' => $newStatusVal,
                        'action' => 'inaktif_otomatis',
                        'user_id' => null, // Dilakukan oleh sistem, bukan pengguna tertentu.
                        'keterangan' => 'Status otomatis disinkronkan berdasarkan masa retensi dan nasib akhir.',
                    ]);
                }
            }
        }
    }

    /**
     * Generate unique sequential nomor arsip.
     */
    public static function generateNomorArsip(?CarbonInterface $date = null): string
    {
        $year = ($date ?? now())->format('Y');
        $prefix = "ARS-{$year}-";

        $lastArsip = static::withTrashed()
            ->where('nomor_arsip', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;
        if ($lastArsip && preg_match('/'.preg_quote($prefix, '/').'(\d+)/', $lastArsip->nomor_arsip, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        $nomor = $prefix.str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);

        while (static::withTrashed()->where('nomor_arsip', $nomor)->exists()) {
            $nextNumber++;
            $nomor = $prefix.str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
        }

        return $nomor;
    }

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): ArsipFactory
    {
        return ArsipFactory::new();
    }
}
