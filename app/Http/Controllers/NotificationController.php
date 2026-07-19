<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    /**
     * Halaman penuh Notification Center.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type', 'status']);

        $notifications = $this->notificationService->paginate(
            user: $request->user(),
            filters: $filters,
            perPage: 20,
        );

        return Inertia::render('notifications/index', [
            'notifications' => $notifications->through(fn (Notification $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'type' => $n->type->value,
                'type_label' => $n->type->label(),
                'type_color' => $n->type->color(),
                'url' => $n->url,
                'is_read' => $n->is_read,
                'created_at' => AppDateTime::iso($n->created_at),
                'created_at_human' => AppDateTime::dateTime($n->created_at),
            ]),
            'filters' => $filters,
            'types' => array_map(fn (NotificationType $t) => [
                'value' => $t->value,
                'label' => $t->label(),
            ], NotificationType::cases()),
        ]);
    }

    /**
     * Tandai satu notifikasi sebagai sudah dibaca.
     */
    public function markRead(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $this->notificationService->markAsRead($notification);

        return back();
    }

    /**
     * Tandai semua notifikasi user sebagai sudah dibaca.
     */
    public function markAllRead(Request $request): RedirectResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        return back()->with('success', 'Semua notifikasi telah ditandai sebagai dibaca.');
    }

    /**
     * Tandai notifikasi sebagai dibaca lalu redirect ke URL tujuan.
     */
    public function redirect(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $this->notificationService->markAsRead($notification);

        if ($notification->url) {
            return redirect($notification->url);
        }

        return redirect()->route('notifications.index');
    }
}
