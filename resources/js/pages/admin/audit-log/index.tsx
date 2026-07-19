import { Head, router } from '@inertiajs/react';
import { Activity, CalendarDays, Eye, FileClock, ListFilter, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import type { BadgeStatusVariant } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/audit-log';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type AuditLog = {
    id: number;
    created_at: string | null;
    created_at_human: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    event: string;
    module: string;
    archive: {
        id: number;
        nomor_arsip: string;
        judul: string;
    } | null;
    ip_address: string | null;
    user_agent: string | null;
    old_values: JsonValue | null;
    new_values: JsonValue | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedAuditLogs = {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Filters = {
    search?: string;
    event_category?: string;
    user_type?: string;
    date_from?: string;
    date_until?: string;
};

type Statistics = {
    total: number;
    today: number;
    active_users_today: number;
    events_today: number;
};

type AuditLogIndexProps = {
    auditLogs: PaginatedAuditLogs;
    statistics: Statistics;
    filters: Filters;
};

const eventCategoryOptions = [
    { value: 'arsip', label: 'Arsip' },
    { value: 'dokumen', label: 'Dokumen' },
    { value: 'workflow', label: 'Workflow' },
    { value: 'ocr', label: 'OCR' },
];

const userTypeOptions = [
    { value: 'system', label: 'Sistem' },
    { value: 'user', label: 'User' },
];

function eventVariant(event: string): BadgeStatusVariant {
    if (['arsip.created', 'arsip.restored'].includes(event)) {
        return 'success';
    }

    if (['arsip.updated', 'workflow.changed'].includes(event)) {
        return 'info';
    }

    if (['dokumen.uploaded', 'dokumen.replaced', 'dokumen.version_created'].includes(event)) {
        return 'warning';
    }

    if (['arsip.deleted', 'arsip.force_deleted'].includes(event)) {
        return 'danger';
    }

    return 'secondary';
}

function prettyJson(value: JsonValue | null): string {
    if (value === null) {
        return '-';
    }

    return JSON.stringify(value, null, 2);
}

function cleanFilters(filters: Filters): Filters {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    ) as Filters;
}

export default function AuditLogIndex({
    auditLogs,
    statistics,
    filters = {},
}: AuditLogIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const updateFilters = (newFilters: Filters) => {
        const params = cleanFilters({
            ...filters,
            ...newFilters,
        });

        router.get(index.url({ query: params }), {}, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                updateFilters({ search });
            }
        }, 500);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const hasFilters = Boolean(
        filters.search || filters.event_category || filters.user_type || filters.date_from || filters.date_until,
    );

    const clearFilters = () => {
        setSearch('');
        router.get(index.url(), {}, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Audit Log" />

            <PageContainer>
                <PageHeader
                    title="Audit Log"
                    description="Riwayat aktivitas dan jejak audit seluruh pengguna sistem."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Audit Log', href: index.url() },
                    ]}
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Audit">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">{statistics.total}</p>
                            <FileClock className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </ContentCard>
                    <ContentCard title="Audit Hari Ini">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">{statistics.today}</p>
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </ContentCard>
                    <ContentCard title="User Aktif Hari Ini">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">{statistics.active_users_today}</p>
                            <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </ContentCard>
                    <ContentCard title="Event Hari Ini">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">{statistics.events_today}</p>
                            <Activity className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </ContentCard>
                </div>

                <ContentCard title="Daftar Audit Log" description="Lacak perubahan arsip, dokumen, workflow, dan OCR.">
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari user, nomor arsip, judul, atau event..."
                            filters={
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        value={filters.event_category ?? 'all'}
                                        onValueChange={(value) => updateFilters({ event_category: value === 'all' ? '' : value })}
                                    >
                                        <SelectTrigger className="h-9 w-[140px] border-border/60">
                                            <ListFilter className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Event</SelectItem>
                                            {eventCategoryOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filters.user_type ?? 'all'}
                                        onValueChange={(value) => updateFilters({ user_type: value === 'all' ? '' : value })}
                                    >
                                        <SelectTrigger className="h-9 w-[130px] border-border/60">
                                            <SelectValue placeholder="User" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua User</SelectItem>
                                            {userTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="date"
                                        value={filters.date_from ?? ''}
                                        onChange={(event) => updateFilters({ date_from: event.target.value })}
                                        className="h-9 w-[150px] border-border/60"
                                        aria-label="Tanggal dari"
                                    />

                                    <Input
                                        type="date"
                                        value={filters.date_until ?? ''}
                                        onChange={(event) => updateFilters({ date_until: event.target.value })}
                                        className="h-9 w-[150px] border-border/60"
                                        aria-label="Tanggal sampai"
                                    />

                                    {hasFilters && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            }
                        />

                        {auditLogs.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada audit log"
                                description="Belum ada aktivitas yang cocok dengan pencarian atau filter."
                                icon={FileClock}
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="min-w-[150px] font-semibold">Waktu</TableHead>
                                                <TableHead className="min-w-[180px] font-semibold">Pengguna</TableHead>
                                                <TableHead className="min-w-[170px] font-semibold">Event</TableHead>
                                                <TableHead className="min-w-[120px] font-semibold">Modul</TableHead>
                                                <TableHead className="min-w-[220px] font-semibold">Nomor Arsip</TableHead>
                                                <TableHead className="min-w-[130px] font-semibold">IP Address</TableHead>
                                                <TableHead className="w-[90px] text-right font-semibold">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogs.data.map((auditLog) => (
                                                <TableRow key={auditLog.id} className="transition-colors hover:bg-muted/30">
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {auditLog.created_at_human ?? '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {auditLog.user ? (
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium">{auditLog.user.name}</p>
                                                                <p className="truncate text-xs text-muted-foreground">{auditLog.user.email}</p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">Sistem</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge variant={eventVariant(auditLog.event)}>
                                                            {auditLog.event}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {auditLog.module}
                                                    </TableCell>
                                                    <TableCell>
                                                        {auditLog.archive ? (
                                                            <div className="min-w-0">
                                                                <p className="font-mono text-xs font-medium">{auditLog.archive.nomor_arsip}</p>
                                                                <p className="max-w-[260px] truncate text-xs text-muted-foreground">
                                                                    {auditLog.archive.judul}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {auditLog.ip_address ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedLog(auditLog)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Detail
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex flex-col gap-3 pt-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Menampilkan {auditLogs.from ?? 0} hingga {auditLogs.to ?? 0} dari {auditLogs.total} audit
                                    </span>
                                    {auditLogs.last_page > 1 && (
                                        <div className="flex flex-wrap items-center gap-1">
                                            {auditLogs.links.map((link, linkIndex) => (
                                                <Button
                                                    key={`${link.label}-${linkIndex}`}
                                                    type="button"
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(link.url, {}, {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detail Audit Log</DialogTitle>
                        <DialogDescription>
                            {selectedLog?.event ?? '-'} pada {selectedLog?.created_at_human ?? '-'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-2">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <DetailItem label="Waktu" value={selectedLog.created_at_human ?? '-'} />
                                <DetailItem label="Pengguna" value={selectedLog.user?.name ?? 'Sistem'} />
                                <DetailItem label="Event" value={selectedLog.event} />
                                <DetailItem label="Modul" value={selectedLog.module} />
                                <DetailItem label="IP Address" value={selectedLog.ip_address ?? '-'} />
                                <DetailItem label="User Agent" value={selectedLog.user_agent ?? '-'} />
                            </div>

                            <JsonBlock title="Old Values" value={selectedLog.old_values} />
                            <JsonBlock title="New Values" value={selectedLog.new_values} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-border/60 p-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 break-words text-sm">{value}</p>
        </div>
    );
}

function JsonBlock({ title, value }: { title: string; value: JsonValue | null }) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-semibold">{title}</p>
            <pre className="max-h-64 overflow-auto rounded-md border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed">
                {prettyJson(value)}
            </pre>
        </div>
    );
}

AuditLogIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Administrasi', href: '#' },
        { title: 'Audit Log', href: index.url() },
    ],
};
