<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the audit logs.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', AuditLog::class);
        $filters = $request->only([
            'search',
            'event_category',
            'user_type',
            'date_from',
            'date_until',
        ]);

        return Inertia::render('admin/audit-log/index', [
            'auditLogs' => $this->auditLogService->paginated($filters),
            'statistics' => $this->auditLogService->statistics(),
            'filters' => $filters,
        ]);
    }
}
