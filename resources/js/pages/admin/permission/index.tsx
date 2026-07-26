import { Head, Link, router } from '@inertiajs/react';
import { Key, X } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/permission';

type Permission = {
    id: number;
    name: string;
    guard_name: string;
    roles_count: number;
    users_count: number;
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedPermissions = {
    data: Permission[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: PaginationLink[];
};

type Stats = {
    total: number;
    total_groups: number;
    bulan_ini: number;
};

type IndexProps = {
    permissions: PaginatedPermissions;
    stats: Stats;
    filters: {
        search?: string;
    };
};

function StatValue({ value }: { value: number }) {
    return (
        <div className="text-2xl font-semibold tracking-normal text-foreground">
            {value.toLocaleString('id-ID')}
        </div>
    );
}

function getGroup(name: string) {
    return name.split('.')[0] ?? 'other';
}

export default function PermissionIndex({
    permissions,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const updateFilters = (
        newParams: Record<string, string | null | undefined>,
    ) => {
        const params = { ...filters, ...newParams };

        Object.keys(params).forEach((key) => {
            const value = params[key as keyof typeof params];

            if (value === undefined || value === '' || value === null) {
                delete params[key as keyof typeof params];
            }
        });

        router.get(index().url, params, {
            preserveState: true,
            replace: true,
        });
    };

    // Debounce via simple timeout on each change
    const handleSearchChange = (value: string) => {
        setSearch(value);

        const t = setTimeout(() => {
            if (value !== (filters.search || '')) {
                updateFilters({ search: value });
            }
        }, 500);

        return () => clearTimeout(t);
    };

    const clearFilters = () => {
        setSearch('');
        router.get(index().url, {}, { preserveState: true, replace: true });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Permission" />

            <PageContainer>
                <PageHeader
                    title="Permission"
                    description="Manajemen izin akses terperinci untuk setiap fitur sistem."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Permission', href: index.url() },
                    ]}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <ContentCard title="Total Permission">
                        <StatValue value={stats.total} />
                    </ContentCard>
                    <ContentCard title="Total Grup">
                        <StatValue value={stats.total_groups} />
                    </ContentCard>
                    <ContentCard title="Ditambahkan Bulan Ini">
                        <StatValue value={stats.bulan_ini} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Permission"
                    description="Seluruh permission yang terdaftar di sistem (read-only)"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={handleSearchChange}
                            searchPlaceholder="Cari permission..."
                            filters={
                                hasFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Reset Filter
                                    </Button>
                                )
                            }
                        />

                        {permissions.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada permission ditemukan"
                                description="Tidak ada permission yang cocok dengan pencarian."
                                icon={Key}
                            />
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="font-semibold">
                                                    Nama Permission
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Grup
                                                </TableHead>
                                                <TableHead className="w-[110px] font-semibold">
                                                    Digunakan Role
                                                </TableHead>
                                                <TableHead className="w-[110px] font-semibold">
                                                    Digunakan User
                                                </TableHead>
                                                <TableHead className="w-[170px] font-semibold">
                                                    Dibuat Pada
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissions.data.map((perm) => (
                                                <TableRow
                                                    key={perm.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <TableCell className="font-mono text-xs">
                                                        {perm.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {getGroup(perm.name)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {perm.roles_count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {perm.users_count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {perm.created_at || '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Menampilkan {permissions.from || 0}{' '}
                                        hingga {permissions.to || 0} dari{' '}
                                        {permissions.total} permission
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !permissions.prev_page_url
                                            }
                                            asChild={Boolean(
                                                permissions.prev_page_url,
                                            )}
                                        >
                                            {permissions.prev_page_url ? (
                                                <Link
                                                    href={
                                                        permissions.prev_page_url
                                                    }
                                                    preserveState
                                                >
                                                    Sebelumnya
                                                </Link>
                                            ) : (
                                                <span>Sebelumnya</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !permissions.next_page_url
                                            }
                                            asChild={Boolean(
                                                permissions.next_page_url,
                                            )}
                                        >
                                            {permissions.next_page_url ? (
                                                <Link
                                                    href={
                                                        permissions.next_page_url
                                                    }
                                                    preserveState
                                                >
                                                    Selanjutnya
                                                </Link>
                                            ) : (
                                                <span>Selanjutnya</span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>
        </>
    );
}
