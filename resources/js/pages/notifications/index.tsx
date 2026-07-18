import { Head, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    index as notificationsIndex,
    markAllRead as markAllReadRoute,
    redirect as notificationRedirect,
} from '@/routes/notifications';
import type { NotificationItem } from '@/types/global';

type PaginationLink = { url: string | null; label: string; active: boolean };

type NotificationsProps = {
    notifications: {
        data: NotificationItem[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
        status?: string;
    };
    types: Array<{ value: string; label: string }>;
};

function timeAgo(dateString: string | null): string {
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

    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const colorMap: Record<string, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    secondary: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function NotificationsIndex({ notifications, filters, types }: NotificationsProps) {
    const { notifications: shared } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(newFilters: Record<string, string>) {
        router.get(notificationsIndex.url({ query: { ...filters, ...newFilters } }), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter({ search });
    }

    function handleMarkAll() {
        router.post(markAllReadRoute.url(), {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['notifications'] }),
        });
    }

    function handleRowClick(notif: NotificationItem) {
        router.get(notificationRedirect.url({ notification: notif.id }));
    }

    return (
        <>
            <Head title="Notifikasi" />
            <PageContainer>
                <PageHeader
                    title="Notifikasi"
                    description="Pusat pemberitahuan aktivitas sistem"
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Notifikasi', href: notificationsIndex.url() },
                    ]}
                />

                <Card>
                    <CardContent className="pt-4">
                        {/* Toolbar */}
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex flex-1 min-w-48 items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="notification-search"
                                        placeholder="Cari notifikasi..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                </div>
                                <Button type="submit" size="sm" variant="secondary" id="notification-search-btn">
                                    Cari
                                </Button>
                            </form>

                            {/* Filter Type */}
                            <Select
                                value={filters.type ?? 'all'}
                                onValueChange={(v) => applyFilter({ type: v === 'all' ? '' : v })}
                            >
                                <SelectTrigger className="w-44 h-9" id="notification-filter-type">
                                    <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Jenis</SelectItem>
                                    {types.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Filter Status */}
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) => applyFilter({ status: v === 'all' ? '' : v })}
                            >
                                <SelectTrigger className="w-40 h-9" id="notification-filter-status">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="unread">Belum Dibaca</SelectItem>
                                    <SelectItem value="read">Sudah Dibaca</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Mark All Read */}
                            {shared.unread_count > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-9"
                                    onClick={handleMarkAll}
                                    id="notification-mark-all-btn"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                    Tandai Semua Dibaca
                                </Button>
                            )}
                        </div>

                        {/* Table */}
                        {notifications.data.length === 0 ? (
                            <EmptyTable
                                icon={Bell}
                                title="Tidak ada notifikasi"
                                description="Belum ada notifikasi yang sesuai filter."
                            />
                        ) : (
                            <>
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-8"></TableHead>
                                                <TableHead>Judul</TableHead>
                                                <TableHead className="hidden md:table-cell">Pesan</TableHead>
                                                <TableHead className="w-36">Jenis</TableHead>
                                                <TableHead className="w-28">Waktu</TableHead>
                                                <TableHead className="w-28">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {notifications.data.map((notif) => (
                                                <TableRow
                                                    key={notif.id}
                                                    className={`cursor-pointer hover:bg-muted/50 ${!notif.is_read ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''}`}
                                                    onClick={() => handleRowClick(notif)}
                                                    id={`notif-row-${notif.id}`}
                                                >
                                                    <TableCell className="text-center">
                                                        {!notif.is_read && (
                                                            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-sm">
                                                        {notif.title}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs truncate">
                                                        {notif.message}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[notif.type_color] ?? colorMap.secondary}`}>
                                                            {notif.type_label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {timeAgo(notif.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={notif.is_read ? 'secondary' : 'default'} className="text-xs">
                                                            {notif.is_read ? 'Dibaca' : 'Belum'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {notifications.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Total: {notifications.total} notifikasi</span>
                                        <div className="flex gap-1">
                                            {notifications.links.map((link, i) => (
                                                <button
                                                    key={i}
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    className={`rounded px-2.5 py-1 text-xs transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </PageContainer>
        </>
    );
}
