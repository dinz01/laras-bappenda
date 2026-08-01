<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\WorkflowStatus;
use App\Events\WorkflowTransitioned;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class WorkflowService
{
    protected NotificationService $notificationService;

    protected AuditLogService $auditLogService;

    public function __construct(
        ?NotificationService $notificationService = null,
        ?AuditLogService $auditLogService = null,
    ) {
        $this->notificationService = $notificationService ?? resolve(NotificationService::class);
        $this->auditLogService = $auditLogService ?? resolve(AuditLogService::class);
    }

    /**
     * Periksa apakah Arsip dapat bertransisi ke status target.
     */
    public function canTransition(Arsip $arsip, WorkflowStatus $target): bool
    {
        return $arsip->workflow_status->canTransitionTo($target);
    }

    /**
     * Tentukan nama aksi bisnis berdasarkan transisi status.
     */
    public function determineAction(WorkflowStatus $from, WorkflowStatus $to): string
    {
        return match ([$from->value, $to->value]) {
            [WorkflowStatus::Draft->value, WorkflowStatus::Review->value] => 'submit',
            [WorkflowStatus::Review->value, WorkflowStatus::Approved->value] => 'verify',
            [WorkflowStatus::Review->value, WorkflowStatus::Revisi->value] => 'reject',
            [WorkflowStatus::Revisi->value, WorkflowStatus::Review->value] => 'resubmit',
            [WorkflowStatus::Approved->value, WorkflowStatus::Active->value] => 'activate',
            [WorkflowStatus::Active->value, WorkflowStatus::Retention->value] => 'retention',
            [WorkflowStatus::Retention->value, WorkflowStatus::RecordCenter->value] => 'record_center',
            [WorkflowStatus::RecordCenter->value, WorkflowStatus::Destruction->value] => 'destruction',
            default => 'transition',
        };
    }

    /**
     * Eksekusi transisi workflow, simpan riwayat, catat audit log, dan dispatch event.
     *
     * @throws \InvalidArgumentException Jika transisi tidak diizinkan.
     */
    public function transition(
        Arsip $arsip,
        WorkflowStatus $target,
        ?string $keterangan,
        User $actor,
        Request $request,
        ?string $action = null,
    ): ArsipWorkflowHistory {
        if (! $this->canTransition($arsip, $target)) {
            throw new \InvalidArgumentException(
                "Transisi dari [{$arsip->workflow_status->value}] ke [{$target->value}] tidak diizinkan."
            );
        }

        $statusLama = $arsip->workflow_status;

        // 1. Update status arsip
        $arsip->update(['workflow_status' => $target]);

        $actionName = $action ?? $this->determineAction($statusLama, $target);

        // 2. Simpan riwayat
        $history = ArsipWorkflowHistory::create([
            'arsip_id' => $arsip->id,
            'status_lama' => $statusLama->value,
            'status_baru' => $target->value,
            'action' => $actionName,
            'user_id' => $actor->id,
            'keterangan' => $keterangan,
        ]);

        // 3. Catat audit log
        $this->auditLogService->log(
            'workflow.changed',
            $arsip,
            ['workflow_status' => $statusLama->value],
            ['workflow_status' => $target->value],
            $actor,
            $request
        );

        // 4. Dispatch event
        WorkflowTransitioned::dispatch($arsip, $statusLama, $target, $actor);

        // 5. Kirim notifikasi
        $this->notificationService->create(
            $actor,
            NotificationType::TahapBerubah,
            'Tahap Arsip Berubah',
            "Arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) berpindah dari [{$statusLama->label()}] ke [{$target->label()}].",
            route('arsip.index'),
        );

        return $history;
    }

    /**
     * Ambil riwayat transisi workflow untuk sebuah arsip.
     *
     * @return Collection<int, ArsipWorkflowHistory>
     */
    public function history(Arsip $arsip): Collection
    {
        return $arsip->workflowHistories()->with('user')->get();
    }

    /**
     * Ambil daftar status tujuan yang valid dari kondisi saat ini.
     *
     * @return list<array{value: string, label: string}>
     */
    public function allowedTransitions(Arsip $arsip): array
    {
        return array_map(
            fn (WorkflowStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            $arsip->workflow_status->allowedTransitions()
        );
    }
}
