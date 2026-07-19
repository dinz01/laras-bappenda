<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
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
