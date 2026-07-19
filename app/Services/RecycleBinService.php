<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Arsip;
use App\Models\User;
use App\Support\AppDateTime;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class RecycleBinService
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
     * Daftar arsip yang soft-deleted, diurutkan terbaru dihapus.
     *
     * @return LengthAwarePaginator<int, Arsip>
     */
    public function paginate(int $perPage = 20): LengthAwarePaginator
    {
        return Arsip::onlyTrashed()
            ->with(['unitOrganisasi:id,kode,nama', 'creator:id,name'])
            ->orderByDesc('deleted_at')
            ->paginate($perPage);
    }

    /**
     * Restore arsip dari recycle bin.
     */
    public function restore(Arsip $arsip, User $actor, Request $request): void
    {
        $oldDeletedAt = AppDateTime::dateTime($arsip->deleted_at);

        $arsip->restore();

        $this->auditLogService->log(
            'arsip.restored',
            $arsip,
            ['deleted_at' => $oldDeletedAt],
            ['deleted_at' => null],
            $actor,
            $request
        );

        $this->notificationService->create(
            $actor,
            NotificationType::ArsipDipulihkan,
            'Arsip Dipulihkan',
            "Arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) berhasil dipulihkan dari recycle bin.",
            route('arsip.show', $arsip),
        );
    }

    /**
     * Force delete arsip beserta seluruh relasinya dan file fisik.
     */
    public function forceDelete(Arsip $arsip, User $actor, Request $request, string $via = 'manual'): void
    {
        // Hapus file fisik terlebih dahulu (sebelum DB records musnah)
        $this->deletePhysicalFiles($arsip);

        // Catat audit log SEBELUM force delete (agar id arsip masih ada)
        $this->auditLogService->log(
            'arsip.force_deleted',
            $arsip,
            [
                'nomor_arsip' => $arsip->nomor_arsip,
                'judul' => $arsip->judul,
                'deleted_at' => AppDateTime::dateTime($arsip->deleted_at),
            ],
            null,
            $actor,
            $request
        );

        $this->notificationService->create(
            $actor,
            NotificationType::ArsipDihapusPermanen,
            'Arsip Dihapus Permanen',
            "Arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) telah dihapus secara permanen.",
        );

        // Force delete akan cascade ke relasi melalui DB foreign key ON DELETE CASCADE
        $arsip->forceDelete();
    }

    /**
     * Jumlah arsip yang menunggu penghapusan permanen (< 24 jam).
     */
    public function pendingCount(): int
    {
        return Arsip::onlyTrashed()->count();
    }

    /**
     * Force delete seluruh arsip yang sudah melampaui 24 jam sejak dihapus.
     * Dipanggil oleh scheduler command.
     *
     * @return array{deleted: int, errors: int}
     */
    public function deleteExpired(): array
    {
        $expired = Arsip::onlyTrashed()
            ->where('deleted_at', '<=', now()->subHours(24))
            ->get();

        $deleted = 0;
        $errors = 0;

        foreach ($expired as $arsip) {
            try {
                $this->deletePhysicalFiles($arsip);

                $this->auditLogService->log(
                    'arsip.force_deleted',
                    $arsip,
                    [
                        'nomor_arsip' => $arsip->nomor_arsip,
                        'judul' => $arsip->judul,
                        'deleted_at' => AppDateTime::dateTime($arsip->deleted_at),
                    ],
                    null,
                    null,
                    null
                );

                $arsip->forceDelete();
                $deleted++;
            } catch (\Throwable) {
                $errors++;
            }
        }

        return ['deleted' => $deleted, 'errors' => $errors];
    }

    /**
     * Hapus file fisik arsip beserta file dokumen dan versinya dari storage.
     */
    private function deletePhysicalFiles(Arsip $arsip): void
    {
        if ($arsip->file_path !== null) {
            Storage::disk('local')->delete($arsip->file_path);
        }

        $dokumen = $arsip->dokumen;
        if ($dokumen) {
            if ($dokumen->path_penyimpanan) {
                Storage::disk('local')->delete($dokumen->path_penyimpanan);
            }

            foreach ($dokumen->versions as $version) {
                if ($version->path_file) {
                    Storage::disk('local')->delete($version->path_file);
                }
            }
        }
    }
}
