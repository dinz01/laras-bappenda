<?php

declare(strict_types=1);

namespace App\Services;

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
    public function determineAction(WorkflowStatus $from, WorkflowStatus $target): string
    {
        return match ([$from->value, $target->value]) {
            [WorkflowStatus::Review->value, WorkflowStatus::Approved->value] => 'verify',
            [WorkflowStatus::Review->value, WorkflowStatus::WaitingTte->value] => 'verify',
            [WorkflowStatus::Review->value, WorkflowStatus::Revisi->value] => 'reject',
            [WorkflowStatus::Revisi->value, WorkflowStatus::Review->value] => 'resubmit',
            [WorkflowStatus::Approved->value, WorkflowStatus::WaitingTte->value] => 'waiting_tte',
            [WorkflowStatus::Approved->value, WorkflowStatus::Active->value] => 'activate',
            [WorkflowStatus::WaitingTte->value, WorkflowStatus::Active->value] => 'tte',
            [WorkflowStatus::Active->value, WorkflowStatus::Inactive->value] => 'inaktif',
            [WorkflowStatus::Inactive->value, WorkflowStatus::Musnah->value] => 'musnah',
            [WorkflowStatus::Inactive->value, WorkflowStatus::Permanen->value] => 'permanen',
            [WorkflowStatus::Active->value, WorkflowStatus::Musnah->value] => 'musnah',
            [WorkflowStatus::Active->value, WorkflowStatus::Permanen->value] => 'permanen',
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
            $fromVal = $arsip->workflow_status instanceof WorkflowStatus
                ? $arsip->workflow_status->value
                : (string) $arsip->workflow_status;

            throw new \InvalidArgumentException(
                "Transisi dari [{$fromVal}] ke [{$target->value}] tidak diizinkan."
            );
        }

        $statusLama = $arsip->workflow_status;

        // Auto-check retention expiry if target is Active
        if ($target === WorkflowStatus::Active) {
            $arsip->loadMissing('klasifikasiArsip.nasibAkhir');
            $klasifikasi = $arsip->klasifikasiArsip;

            if ($klasifikasi && $klasifikasi->retensi_aktif !== null && $arsip->tanggal_arsip) {
                $tahunAktif = (int) $klasifikasi->retensi_aktif;
                $endActiveDate = $arsip->tanggal_arsip->copy()->addYears($tahunAktif);

                if (now()->startOfDay()->greaterThanOrEqualTo($endActiveDate->startOfDay())) {
                    // Masa aktif sudah lewat — cek masa inaktif
                    if ($klasifikasi->retensi_inaktif !== null) {
                        $tahunInaktif = (int) $klasifikasi->retensi_inaktif;
                        $endInactiveDate = $endActiveDate->copy()->addYears($tahunInaktif);

                        if (now()->startOfDay()->greaterThanOrEqualTo($endInactiveDate->startOfDay())) {
                            // Masa inaktif pun sudah lewat — tentukan berdasarkan nasib akhir
                            $namaNasibAkhir = $klasifikasi->nasibAkhir?->nama;
                            $targetSlug = WorkflowStatus::fromNasibAkhir($namaNasibAkhir);

                            $target = WorkflowStatus::tryFrom($targetSlug) ?? WorkflowStatus::Musnah;
                        } else {
                            // Masa aktif lewat, masa inaktif belum
                            $target = WorkflowStatus::Inactive;
                        }
                    } else {
                        // Tidak ada retensi inaktif → langsung Inactive
                        $target = WorkflowStatus::Inactive;
                    }
                }
            }
        }

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
        $this->notificationService->notifyWorkflowTransition(
            arsip: $arsip,
            statusLama: $statusLama,
            target: $target,
            actor: $actor,
            keterangan: $keterangan,
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
        return array_values(array_map(
            fn (WorkflowStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            $arsip->workflow_status->allowedTransitions()
        ));
    }
}
