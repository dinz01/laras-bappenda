<?php

namespace App\Models;

use App\Enums\OcrStatus;
use Database\Factories\DokumenArsipFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Model DokumenArsip.
 *
 * @property int $id
 * @property int $arsip_id
 * @property string $nama_original
 * @property string $nama_generated
 * @property int $ukuran
 * @property string $mime_type
 * @property string $path_penyimpanan
 * @property Carbon|null $uploaded_at
 * @property int|null $uploaded_by
 * @property OcrStatus $ocr_status
 * @property string|null $ocr_text
 * @property float|null $ocr_confidence
 * @property string|null $ocr_language
 * @property int|null $ocr_pages
 * @property Carbon|null $ocr_processed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Arsip $arsip
 * @property-read User|null $uploader
 * @property-read Collection<int, DokumenArsipVersion> $versions
 *
 * @use HasFactory<DokumenArsipFactory>
 */
class DokumenArsip extends Model
{
    /** @use HasFactory<DokumenArsipFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'dokumen_arsip';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'arsip_id',
        'nama_original',
        'nama_generated',
        'ukuran',
        'mime_type',
        'path_penyimpanan',
        'uploaded_at',
        'uploaded_by',
        'ocr_status',
        'ocr_text',
        'ocr_confidence',
        'ocr_language',
        'ocr_pages',
        'ocr_processed_at',
    ];

    /**
     * Cast untuk atribut model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
            'ukuran' => 'integer',
            'ocr_status' => OcrStatus::class,
            'ocr_confidence' => 'float',
            'ocr_pages' => 'integer',
            'ocr_processed_at' => 'datetime',
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
     * Relasi ke User (Pengunggah).
     *
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Relasi ke Versi Dokumen.
     *
     * @return HasMany<DokumenArsipVersion, $this>
     */
    public function versions(): HasMany
    {
        return $this->hasMany(DokumenArsipVersion::class, 'dokumen_arsip_id');
    }

    /**
     * Factory untuk model ini.
     */
    protected static function newFactory(): DokumenArsipFactory
    {
        return DokumenArsipFactory::new();
    }
}
