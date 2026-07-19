<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Arsip;
use App\Models\AuditLog;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\User;
use App\Support\AppDateTime;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class AuditLogService
{
    /**
     * Log an audit event.
     *
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function log(
        string $event,
        Model $model,
        ?array $oldValues,
        ?array $newValues,
        ?User $actor,
        ?Request $request = null
    ): void {
        $resolvedRequest = $request ?? request();

        AuditLog::create([
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'user_id' => $actor ? $actor->id : auth()->id(),
            'ip_address' => $resolvedRequest->ip(),
            'user_agent' => $resolvedRequest->userAgent(),
        ]);
    }

    /**
     * Get paginated audit logs for the administration UI.
     *
     * @param  array{
     *     search?: string|null,
     *     event_category?: string|null,
     *     user_type?: string|null,
     *     date_from?: string|null,
     *     date_until?: string|null
     * }  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginated(array $filters): LengthAwarePaginator
    {
        $query = AuditLog::query()
            ->with([
                'auditable',
            ])
            ->latest('created_at')
            ->latest('id');

        $this->applyFilters($query, $filters);

        return $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn (AuditLog $auditLog): array => $this->toRow($auditLog));
    }

    /**
     * Get summary statistics for audit logs.
     *
     * @return array{total: int, today: int, active_users_today: int, events_today: int}
     */
    public function statistics(): array
    {
        $today = Carbon::today();

        return [
            'total' => AuditLog::count(),
            'today' => AuditLog::whereDate('created_at', $today)->count(),
            'active_users_today' => AuditLog::whereDate('created_at', $today)
                ->whereNotNull('user_id')
                ->distinct('user_id')
                ->count('user_id'),
            'events_today' => AuditLog::whereDate('created_at', $today)
                ->distinct('event')
                ->count('event'),
        ];
    }

    /**
     * @param  Builder<AuditLog>  $query
     * @param  array<string, string|null>  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $query) use ($search): void {
                $query
                    ->where('event', 'like', "%{$search}%")
                    ->orWhereHas('user', function (Builder $query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHasMorph('auditable', [Arsip::class], function (Builder $query) use ($search): void {
                        $query
                            ->where('nomor_arsip', 'like', "%{$search}%")
                            ->orWhere('judul', 'like', "%{$search}%");
                    })
                    ->orWhereHasMorph('auditable', [DokumenArsip::class], function (Builder $query) use ($search): void {
                        $query->whereHas('arsip', function (Builder $query) use ($search): void {
                            $query
                                ->where('nomor_arsip', 'like', "%{$search}%")
                                ->orWhere('judul', 'like', "%{$search}%");
                        });
                    })
                    ->orWhereHasMorph('auditable', [DokumenArsipVersion::class], function (Builder $query) use ($search): void {
                        $query->whereHas('dokumenArsip.arsip', function (Builder $query) use ($search): void {
                            $query
                                ->where('nomor_arsip', 'like', "%{$search}%")
                                ->orWhere('judul', 'like', "%{$search}%");
                        });
                    });
            });
        }

        $eventCategory = (string) ($filters['event_category'] ?? '');

        if (in_array($eventCategory, ['arsip', 'dokumen', 'workflow', 'ocr'], true)) {
            $query->where('event', 'like', "{$eventCategory}.%");
        }

        $userType = (string) ($filters['user_type'] ?? '');

        if ($userType === 'system') {
            $query->whereNull('user_id');
        }

        if ($userType === 'user') {
            $query->whereNotNull('user_id');
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', (string) $filters['date_from']);
        }

        if (! empty($filters['date_until'])) {
            $query->whereDate('created_at', '<=', (string) $filters['date_until']);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function toRow(AuditLog $auditLog): array
    {
        $archive = $this->resolveArchive($auditLog->auditable);

        return [
            'id' => $auditLog->id,
            'created_at' => AppDateTime::iso($auditLog->created_at),
            'created_at_human' => AppDateTime::dateTime($auditLog->created_at),
            'user' => $auditLog->user ? [
                'id' => $auditLog->user->id,
                'name' => $auditLog->user->name,
                'email' => $auditLog->user->email,
            ] : null,
            'event' => $auditLog->event,
            'module' => $this->moduleLabel($auditLog->event),
            'archive' => $archive,
            'ip_address' => $auditLog->ip_address,
            'user_agent' => $auditLog->user_agent,
            'old_values' => $auditLog->old_values,
            'new_values' => $auditLog->new_values,
        ];
    }

    /**
     * @return array{id: int, nomor_arsip: string, judul: string}|null
     */
    private function resolveArchive(?Model $auditable): ?array
    {
        $arsip = match (true) {
            $auditable instanceof Arsip => $auditable,
            $auditable instanceof DokumenArsip => $auditable->arsip,
            $auditable instanceof DokumenArsipVersion => $auditable->dokumenArsip->arsip,
            default => null,
        };

        if (! $arsip instanceof Arsip) {
            return null;
        }

        return [
            'id' => $arsip->id,
            'nomor_arsip' => $arsip->nomor_arsip,
            'judul' => $arsip->judul,
        ];
    }

    private function moduleLabel(string $event): string
    {
        return match (str($event)->before('.')->value()) {
            'arsip' => 'Arsip',
            'dokumen' => 'Dokumen',
            'workflow' => 'Workflow',
            'ocr' => 'OCR',
            default => 'Sistem',
        };
    }
}
