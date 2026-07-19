import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    index as notificationsIndex,
    markAllRead,
    redirect as notificationRedirect,
} from '@/routes/notifications';
import type { NotificationItem } from '@/types/global';

function timeAgo(dateString: string | null, fallback: string | null): string {
    if (!dateString) {
return '-';
}

    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

    if (seconds < 60) {
return 'Baru saja';
}

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
return `${minutes} mnt lalu`;
}

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
return `${hours} jam lalu`;
}

    const days = Math.floor(hours / 24);

    return days < 7 ? `${days} hari lalu` : fallback ?? dateString;
}

export type NotificationBellProps = {
    notifications?: NotificationItem[];
    unreadCount?: number;
};

export function NotificationBell({
    notifications: propNotifications,
    unreadCount: propUnreadCount,
}: NotificationBellProps = {}) {
    const { notifications: shared } = usePage().props as any;

    const notifications: NotificationItem[] = propNotifications ?? shared?.latest ?? [];
    const unreadCount = propUnreadCount ?? shared?.unread_count ?? 0;

    function handleMarkAll() {
        router.post(markAllRead.url(), {}, { preserveScroll: true });
    }

    function handleClick(notif: NotificationItem) {
        router.get(notificationRedirect.url({ notification: notif.id }));
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="group flex items-center gap-1 h-9 px-2.5 cursor-pointer"
                    aria-label="Notifikasi"
                    id="notification-bell-trigger"
                >
                    <Bell className="!size-5 opacity-80 group-hover:opacity-100" />
                    {unreadCount > 0 && (
                        <span className="text-xs font-semibold text-destructive dark:text-red-400">
                            ({unreadCount > 99 ? '99+' : unreadCount})
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 p-0"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="text-sm font-semibold">Notifikasi</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAll}
                            id="notification-mark-all-read"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>

                {/* List */}
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Bell className="mb-2 h-8 w-8 opacity-30" />
                        <p className="text-sm">Belum ada notifikasi</p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto divide-y">
                        {notifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex flex-col items-start gap-1 px-4 py-3 cursor-pointer ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                                onClick={() => handleClick(notif)}
                                id={`notification-item-${notif.id}`}
                            >
                                <div className="flex w-full items-start justify-between gap-2">
                                    <span className={`text-xs font-semibold leading-snug ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {notif.title}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-1">
                                        {!notif.is_read && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        )}
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {timeAgo(notif.created_at, notif.created_at_human)}
                                        </span>
                                    </div>
                                </div>
                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {notif.message}
                                </p>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                <DropdownMenuSeparator />

                {/* Footer */}
                <div className="px-2 py-2">
                    <Link
                        href={notificationsIndex.url()}
                        className="flex items-center justify-center gap-1 w-full rounded-md py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        id="notification-view-all"
                    >
                        Lihat Semua Notifikasi
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
