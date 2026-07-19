<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

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
}
