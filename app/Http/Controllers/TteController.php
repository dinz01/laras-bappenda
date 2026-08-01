<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use App\Services\TteService;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TteController extends Controller
{
    public function __construct(
        protected TteService $tteService,
        protected WorkflowService $workflowService,
        protected NotificationService $notificationService,
        protected AuditLogService $auditLogService,
    ) {}

    /**
     * Tampilkan antrian arsip yang menunggu TTE (status approved).
     */
    public function index(Request $request): Response
    {
        Gate::authorize('workflow.tte');

        $arsips = Arsip::query()
            ->with([
                'klasifikasiArsip',
                'lokasiArsip',
                'unitOrganisasi',
                'creator',
                'dokumen',
            ])
            ->where('workflow_status', WorkflowStatus::Approved)
            ->orderBy('updated_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('kelola-tte/index', [
            'arsips' => $arsips,
        ]);
    }

    /**
     * Ajukan TTE dummy untuk sebuah arsip.
     */
    public function ajukan(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('workflow.tte');

        $validated = $request->validate([
            'sandi_pimpinan' => 'required|string|max:255',
            'catatan' => 'nullable|string|max:1000',
        ]);

        if ($arsip->workflow_status !== WorkflowStatus::Approved) {
            return redirect()->back()->withErrors([
                'workflow' => 'Arsip tidak dalam status menunggu TTE.',
            ]);
        }

        /** @var User $pimpinan */
        $pimpinan = $request->user();

        $this->tteService->ajukanTte(
            $arsip,
            $pimpinan,
            $validated['sandi_pimpinan'],
            $validated['catatan'] ?? null,
        );

        $this->workflowService->transition(
            arsip: $arsip,
            target: WorkflowStatus::Active,
            keterangan: 'Dokumen telah ditandatangani secara elektronik (dummy).',
            actor: $pimpinan,
            request: $request,
            action: 'tte',
        );

        return redirect()->back()
            ->with('success', 'Arsip berhasil ditandatangani secara elektronik dan kini berstatus Aktif.');
    }
}