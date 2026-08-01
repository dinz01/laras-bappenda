<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TteSignatureFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Model TteSignature — pencatatan pengajuan TTE dummy.
 *
 * @property int $id
 * @property int $arsip_id
 * @property int|null $dokumen_arsip_version_id
 * @property int $signed_by
 * @property string $sandi_pimpinan
 * @property string|null $catatan
 * @property string $verification_code
 * @property Carbon $signed_at
 * @property-read Arsip $arsip
 * @property-read DokumenArsipVersion|null $dokumenArsipVersion
 * @property-read User $signer
 *
 * @use HasFactory<TteSignatureFactory>
 */
class TteSignature extends Model
{
    /** @use HasFactory<TteSignatureFactory> */
    use HasFactory;

    protected $table = 'tte_signatures';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'arsip_id',
        'dokumen_arsip_version_id',
        'signed_by',
        'sandi_pimpinan',
        'catatan',
        'verification_code',
        'signed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'signed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Arsip, $this>
     */
    public function arsip(): BelongsTo
    {
        return $this->belongsTo(Arsip::class, 'arsip_id');
    }

    /**
     * @return BelongsTo<DokumenArsipVersion, $this>
     */
    public function dokumenArsipVersion(): BelongsTo
    {
        return $this->belongsTo(DokumenArsipVersion::class, 'dokumen_arsip_version_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function signer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signed_by');
    }
}