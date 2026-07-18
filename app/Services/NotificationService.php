<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Buat notifikasi baru untuk user.
     */
    public function create(
        User $user,
        NotificationType $type,
        string $title,
        string $message,
        ?string $url = null,
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'is_read' => false,
        ]);
    }

    /**
     * Tandai satu notifikasi sebagai sudah dibaca.
     */
    public function markAsRead(Notification $notification): void
    {
        if (! $notification->is_read) {
            $notification->update(['is_read' => true]);
        }
    }

    /**
     * Tandai semua notifikasi user sebagai sudah dibaca.
     *
     * @return int Jumlah notifikasi yang diperbarui.
     */
    public function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    /**
     * Ambil N notifikasi terbaru milik user (untuk dropdown bell).
     *
     * @return Collection<int, Notification>
     */
    public function latest(User $user, int $limit = 10): Collection
    {
        return Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Jumlah notifikasi yang belum dibaca milik user.
     */
    public function unreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Hapus semua notifikasi yang sudah lebih dari 90 hari.
     *
     * @return int Jumlah notifikasi yang dihapus.
     */
    public function deleteExpired(): int
    {
        return Notification::where('created_at', '<', now()->subDays(90))
            ->delete();
    }

    /**
     * Paginasi notifikasi dengan filter opsional.
     *
     * @param  array{search?: string, type?: string, status?: string}  $filters
     * @return LengthAwarePaginator<int, Notification>
     */
    public function paginate(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Notification::where('user_id', $user->id)
            ->orderByDesc('created_at');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('is_read', $filters['status'] === 'read');
        }

        return $query->paginate($perPage)->withQueryString();
    }
}
