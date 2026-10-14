<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\Notification;
use App\Models\PeminjamanArsip;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Buat notifikasi baru untuk user (No-op).
     */
    public function create(
        User $user,
        NotificationType $type,
        string $title,
        string $message,
        ?string $url = null,
    ): Notification {
        return new Notification([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'is_read' => true,
        ]);
    }

    /**
     * Kirim notifikasi ke sekumpulan user (No-op).
     *
     * @param  iterable<User|int>  $users
     */
    public function notifyUsers(
        iterable $users,
        NotificationType $type,
        string $title,
        string $message,
        ?string $url = null,
    ): void {}

    /**
     * Kirim notifikasi ke semua user yang memiliki role tertentu (No-op).
     *
     * @param  string|list<string>  $roles
     */
    public function notifyRole(
        string|array $roles,
        NotificationType $type,
        string $title,
        string $message,
        ?string $url = null,
        ?int $excludeUserId = null,
        ?int $unitOrganisasiId = null,
    ): void {}

    /**
     * Kirim notifikasi ke semua user yang memiliki permission tertentu (No-op).
     *
     * @param  string|list<string>  $permissions
     */
    public function notifyPermission(
        string|array $permissions,
        NotificationType $type,
        string $title,
        string $message,
        ?string $url = null,
        ?int $excludeUserId = null,
    ): void {}

    /**
     * Tandai satu notifikasi sebagai sudah dibaca (No-op).
     */
    public function markAsRead(Notification $notification): void {}

    /**
     * Tandai semua notifikasi user sebagai sudah dibaca (No-op).
     */
    public function markAllAsRead(User $user): int
    {
        return 0;
    }

    /**
     * Ambil N notifikasi terbaru milik user (No-op).
     *
     * @return Collection<int, Notification>
     */
    public function latest(User $user, int $limit = 10): Collection
    {
        return collect();
    }

    /**
     * Jumlah notifikasi yang belum dibaca milik user (No-op).
     */
    public function unreadCount(User $user): int
    {
        return 0;
    }

    /**
     * Hapus semua notifikasi yang sudah lebih dari 90 hari (No-op).
     */
    public function deleteExpired(): int
    {
        return 0;
    }

    /**
     * Paginasi notifikasi dengan filter opsional (No-op).
     *
     * @param  array{search?: string, type?: string, status?: string}  $filters
     * @return LengthAwarePaginator<int, Notification>
     */
    public function paginate(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return new LengthAwarePaginator([], 0, $perPage);
    }

    /**
     * Kirim notifikasi saat arsip baru dibuat (No-op).
     */
    public function notifyArsipCreated(Arsip $arsip, User $actor): void {}

    /**
     * Kirim notifikasi berbasis transisi workflow arsip (No-op).
     */
    public function notifyWorkflowTransition(
        Arsip $arsip,
        WorkflowStatus $statusLama,
        WorkflowStatus $target,
        User $actor,
        ?string $keterangan = null,
    ): void {}

    /**
     * Notifikasi saat dokumen arsip diunggah atau diganti (No-op).
     */
    public function notifyDocumentUploaded(Arsip $arsip, User $actor, bool $isReplacement = false): void {}

    /**
     * Notifikasi permohonan peminjaman diajukan (No-op).
     */
    public function notifyPeminjamanRequested(PeminjamanArsip $peminjaman, User $pemohon, Arsip $arsip): void {}

    /**
     * Notifikasi hasil permohonan peminjaman (No-op).
     */
    public function notifyPeminjamanReviewed(
        PeminjamanArsip $peminjaman,
        User $reviewer,
        bool $isApproved,
        ?string $catatan = null,
    ): void {}

    /**
     * Notifikasi arsip dipindahkan ke recycle bin (No-op).
     */
    public function notifyArsipDeleted(Arsip $arsip, User $actor): void {}

    /**
     * Notifikasi arsip dipulihkan dari recycle bin (No-op).
     */
    public function notifyArsipRestored(Arsip $arsip, User $actor): void {}

    /**
     * Notifikasi arsip dihapus permanen (No-op).
     */
    public function notifyArsipForceDeleted(Arsip $arsip, User $actor): void {}
}
