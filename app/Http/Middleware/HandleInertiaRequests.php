<?php

namespace App\Http\Middleware;

use App\Services\NotificationService;
use App\Support\AppDateTime;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $notifications = ['unread_count' => 0, 'latest' => []];
        if ($user) {
            try {
                $notifications = [
                    'unread_count' => $this->notificationService->unreadCount($user),
                    'latest' => $this->notificationService->latest($user, 10)->map(fn ($n) => [
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
                    ])->values()->all(),
                ];
            } catch (\Throwable) {
                // Fallback to empty notifications if database or service fails
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'appTimezone' => config('app.timezone'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'notifications' => $notifications,
        ];
    }
}
