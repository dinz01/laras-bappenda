<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WorkflowStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Model ArsipWorkflowHistory.
 *
 * @property int $id
 * @property int $arsip_id
 * @property string $status_lama
 * @property string $status_baru
 * @property int|null $user_id
 * @property string|null $keterangan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Arsip $arsip
 * @property-read User|null $user
 */
class ArsipWorkflowHistory extends Model
{
    /**
     * Nama tabel.
     *
     * @var string
     */
    protected $table = 'arsip_workflow_histories';

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'arsip_id',
        'status_lama',
        'status_baru',
        'user_id',
        'keterangan',
    ];

    /**
     * Cast untuk atribut model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status_lama' => WorkflowStatus::class,
            'status_baru' => WorkflowStatus::class,
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
     * Relasi ke User.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
