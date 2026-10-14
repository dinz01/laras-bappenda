<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Contracts\Permission;
use Spatie\Permission\Traits\HasRoles;

/**
 * Model User.
 *
 * @property int $id
 * @property string|null $nip
 * @property string|null $nik
 * @property string|null $nama_lengkap
 * @property string $name
 * @property string|null $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $status
 * @property string|null $avatar_path
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $last_login_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property int|null $unit_organisasi_id
 * @property int|null $jabatan_id
 * @property-read UnitOrganisasi|null $unitOrganisasi
 * @property-read Jabatan|null $jabatan
 * @property-read Collection<int, Arsip> $arsips
 * @property-read Collection<int, DokumenArsip> $dokumenArsips
 * @property-read Collection<int, ArsipWorkflowHistory> $workflowHistories
 * @property-read Collection<int, AuditLog> $auditLogs
 *
 * @method static Builder<static> active()
 * @method static Builder<static> byUnit(int $unitId)
 * @method static Builder<static> byRole(string $role)
 */
#[Fillable(['nip', 'nik', 'nama_lengkap', 'name', 'username', 'email', 'password', 'status', 'avatar_path', 'last_login_at', 'unit_organisasi_id', 'jabatan_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
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
     * Relasi ke Jabatan.
     *
     * @return BelongsTo<Jabatan, $this>
     */
    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class, 'jabatan_id');
    }

    /**
     * Relasi ke Arsip yang dibuat oleh user ini.
     *
     * @return HasMany<Arsip, $this>
     */
    public function arsips(): HasMany
    {
        return $this->hasMany(Arsip::class, 'created_by');
    }

    /**
     * Relasi ke DokumenArsip yang diunggah oleh user ini.
     *
     * @return HasMany<DokumenArsip, $this>
     */
    public function dokumenArsips(): HasMany
    {
        return $this->hasMany(DokumenArsip::class, 'uploaded_by');
    }

    /**
     * Relasi ke ArsipWorkflowHistory yang diproses oleh user ini.
     *
     * @return HasMany<ArsipWorkflowHistory, $this>
     */
    public function workflowHistories(): HasMany
    {
        return $this->hasMany(ArsipWorkflowHistory::class, 'user_id');
    }

    /**
     * Relasi ke AuditLog aksi user ini.
     *
     * @return HasMany<AuditLog, $this>
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }

    /**
     * Scope akun user aktif.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['active', 'aktif']);
    }

    /**
     * Scope user berdasarkan unit organisasi.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeByUnit(Builder $query, int $unitId): Builder
    {
        return $query->where('unit_organisasi_id', $unitId);
    }

    /**
     * Scope user berdasarkan role.
     *
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeByRole(Builder $query, string $role): Builder
    {
        return $query->role($role);
    }

    /**
     * Cek apakah user adalah Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('Super Admin');
    }

    /**
     * Cek apakah user adalah Administrator.
     */
    public function isAdministrator(): bool
    {
        return $this->hasRole('Administrator');
    }

    /**
     * Cek apakah user adalah Pimpinan.
     */
    public function isPimpinan(): bool
    {
        return $this->hasRole('Pimpinan');
    }

    /**
     * Cek apakah user memiliki permission tertentu.
     */
    public function hasPermission(string|Permission $permission): bool
    {
        return $this->hasPermissionTo($permission);
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
