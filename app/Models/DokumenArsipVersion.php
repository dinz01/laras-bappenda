<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\DokumenArsipVersionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Model DokumenArsipVersion.
 *
 * @property int $id
 * @property int $dokumen_arsip_id
 * @property int $versi
 * @property string $nama_file
 * @property string $path_file
 * @property int $ukuran_file
 * @property string $mime_type
 * @property string $hash_file
 * @property string|null $catatan_perubahan
 * @property int|null $uploaded_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read DokumenArsip $dokumenArsip
 * @property-read User|null $uploader
 *
 * @use HasFactory<DokumenArsipVersionFactory>
 */
class DokumenArsipVersion extends Model
{
    /** @use HasFactory<DokumenArsipVersionFactory> */
    use HasFactory;

    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'dokumen_arsip_versions';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'dokumen_arsip_id',
        'versi',
        'nama_file',
        'path_file',
        'ukuran_file',
        'mime_type',
        'hash_file',
        'catatan_perubahan',
        'uploaded_by',
    ];

    /**
     * Cast untuk atribut model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'versi' => 'integer',
            'ukuran_file' => 'integer',
        ];
    }

    /**
     * Relasi ke DokumenArsip.
     *
     * @return BelongsTo<DokumenArsip, $this>
     */
    public function dokumenArsip(): BelongsTo
    {
        return $this->belongsTo(DokumenArsip::class, 'dokumen_arsip_id');
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
     * Factory untuk model ini.
     */
    protected static function newFactory(): DokumenArsipVersionFactory
    {
        return DokumenArsipVersionFactory::new();
    }
}
