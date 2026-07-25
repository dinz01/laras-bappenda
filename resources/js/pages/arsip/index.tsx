import { Head, Link, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { index, show } from '@/routes/arsip';
import type { MasterItem } from './create-dialog';
import { ArsipCreateDialog } from './create-dialog';

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    file_path: string | null;
    klasifikasi_arsip_id: number;
    lokasi_arsip_id: number | null;
    jenis_dokumen_id: number | null;
    media_arsip_id: number | null;
    kondisi_arsip_id: number | null;
    status_arsip_id: number | null;
    tingkat_akses_arsip_id: number | null;
    retensi_arsip_id: number | null;
    unit_organisasi_id: number | null;
    created_by: number | null;
    klasifikasi_arsip?: MasterItem | null;
    lokasi_arsip?: MasterItem | null;
    status_arsip?: MasterItem | null;
    unit_organisasi?: MasterItem | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedArsips = {
    data: Arsip[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: PaginationLink[];
};

type IndexProps = {
    arsips: PaginatedArsips;
    klasifikasis?: MasterItem[];
    unitOrganisasis?: MasterItem[];
    statusArsips?: MasterItem[];
    jenisArsips?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    lokasiArsips?: MasterItem[];
    filters?: {
        search?: string;
        status_arsip_id?: string;
        unit_organisasi_id?: string;
        klasifikasi_arsip_id?: string;
        tahun?: string;
    };
};

function statusVariant(statusName?: string | null) {
    if (!statusName) {
        return 'secondary' as const;
    }

    const name = statusName.toLowerCase();

    if (name.includes('aktif') && !name.includes('inaktif')) {
        return 'success' as const;
    }

    if (name.includes('inaktif')) {
        return 'secondary' as const;
    }

    if (name.includes('musnah') || name.includes('hapus')) {
        return 'danger' as const;
    }

    return 'warning' as const;
}

export default function Index({
    arsips,
    klasifikasis = [],
    unitOrganisasis = [],
    statusArsips = [],
    jenisArsips = [],
    sifatArsips = [],
    tingkatPerkembanganArsips = [],
    lokasiArsips = [],
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Handle filter/search trigger
    const updateFilters = (
        newParams: Record<string, string | null | undefined>,
    ) => {
        const params = {
            ...filters,
            ...newParams,
        };

        // Clean parameters
        Object.keys(params).forEach((key) => {
            const val = params[key as keyof typeof params];

            if (val === undefined || val === '' || val === null) {
                delete params[key as keyof typeof params];
            }
        });

        router.get(index(), params, {
            preserveState: true,
            replace: true,
        });
    };

    // Debounce search input
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search !== (filters.search || '')) {
                updateFilters({ search });
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Handle deletion
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus arsip ini?')) {
            router.delete(`/arsip/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const hasFilters =
        filters.status_arsip_id ||
        filters.unit_organisasi_id ||
        filters.klasifikasi_arsip_id ||
        filters.tahun ||
        filters.search;

    const clearFilters = () => {
        setSearch('');
        router.get(
            index(),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Repository Arsip" />
            <PageContainer>
                <PageHeader
                    title="Repository Arsip"
                    description="Kelola seluruh arsip digital instansi"
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                    ]}
                    actions={
                        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Arsip
                        </Button>
                    }
                />

                <ContentCard
                    title="Daftar Arsip"
                    description="Data seluruh arsip yang telah diregistrasi"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari nomor, judul, atau kode klasifikasi..."
                            filters={
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Klasifikasi Filter */}
                                    <Select
                                        value={
                                            filters.klasifikasi_arsip_id ||
                                            'all'
                                        }
                                        onValueChange={(val) =>
                                            updateFilters({
                                                klasifikasi_arsip_id:
                                                    val === 'all' ? null : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[150px] border-border/60">
                                            <SelectValue placeholder="Klasifikasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Klasifikasi
                                            </SelectItem>
                                            {klasifikasis.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.id.toString()}
                                                >
                                                    {opt.kode} — {opt.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Unit Organisasi Filter */}
                                    <Select
                                        value={
                                            filters.unit_organisasi_id || 'all'
                                        }
                                        onValueChange={(val) =>
                                            updateFilters({
                                                unit_organisasi_id:
                                                    val === 'all' ? null : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[150px] border-border/60">
                                            <SelectValue placeholder="Unit Organisasi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Unit
                                            </SelectItem>
                                            {unitOrganisasis.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.id.toString()}
                                                >
                                                    {opt.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Status Filter */}
                                    <Select
                                        value={filters.status_arsip_id || 'all'}
                                        onValueChange={(val) =>
                                            updateFilters({
                                                status_arsip_id:
                                                    val === 'all' ? null : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[120px] border-border/60">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Status
                                            </SelectItem>
                                            {statusArsips.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.id.toString()}
                                                >
                                                    {opt.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Tahun Filter */}
                                    <Select
                                        value={filters.tahun || 'all'}
                                        onValueChange={(val) =>
                                            updateFilters({
                                                tahun:
                                                    val === 'all' ? null : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-[110px] border-border/60">
                                            <SelectValue placeholder="Tahun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Tahun
                                            </SelectItem>
                                            {Array.from(
                                                { length: 10 },
                                                (_, i) =>
                                                    new Date().getFullYear() -
                                                    i,
                                            ).map((yr) => (
                                                <SelectItem
                                                    key={yr}
                                                    value={yr.toString()}
                                                >
                                                    {yr}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {hasFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="mr-1 h-4 w-4" />
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            }
                        />

                        {arsips.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada arsip ditemukan"
                                description="Tidak ada data arsip yang cocok dengan pencarian atau filter Anda."
                                icon={Archive}
                            />
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[180px] font-semibold">
                                                    Nomor Arsip
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Judul
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Klasifikasi
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Unit Organisasi
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Lokasi
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Status
                                                </TableHead>
                                                <TableHead className="w-[80px] text-right font-semibold">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {arsips.data.map((arsip) => (
                                                <TableRow
                                                    key={arsip.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {arsip.nomor_arsip}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate font-medium">
                                                        {arsip.judul}
                                                    </TableCell>
                                                    <TableCell>
                                                        {arsip.klasifikasi_arsip ? (
                                                            <span
                                                                className="inline-flex items-center rounded bg-muted px-2 py-0.5 font-mono text-xs"
                                                                title={
                                                                    arsip
                                                                        .klasifikasi_arsip
                                                                        .nama
                                                                }
                                                            >
                                                                {
                                                                    arsip
                                                                        .klasifikasi_arsip
                                                                        .kode
                                                                }
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {arsip.unit_organisasi
                                                            ?.nama || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {arsip.lokasi_arsip
                                                            ?.nama || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            variant={statusVariant(
                                                                arsip
                                                                    .status_arsip
                                                                    ?.nama,
                                                            )}
                                                        >
                                                            {arsip.status_arsip
                                                                ?.nama ||
                                                                'Draft'}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <span className="sr-only">
                                                                        Menu
                                                                        aksi
                                                                    </span>
                                                                    <svg
                                                                        className="h-4 w-4"
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <circle
                                                                            cx="4"
                                                                            cy="10"
                                                                            r="1.5"
                                                                        />
                                                                        <circle
                                                                            cx="10"
                                                                            cy="10"
                                                                            r="1.5"
                                                                        />
                                                                        <circle
                                                                            cx="16"
                                                                            cy="10"
                                                                            r="1.5"
                                                                        />
                                                                    </svg>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-40"
                                                            >
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={show(
                                                                            {
                                                                                arsip: arsip.id,
                                                                            },
                                                                        )}
                                                                        className="flex cursor-pointer items-center gap-2"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        Detail
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/arsip/${arsip.id}/edit`}
                                                                        className="flex cursor-pointer items-center gap-2"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            arsip.id,
                                                                        )
                                                                    }
                                                                    className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
                                    <span>
                                        Menampilkan {arsips.from || 0} hingga{' '}
                                        {arsips.to || 0} dari {arsips.total}{' '}
                                        arsip
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!arsips.prev_page_url}
                                            asChild={!!arsips.prev_page_url}
                                        >
                                            {arsips.prev_page_url ? (
                                                <Link
                                                    href={arsips.prev_page_url}
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
                                            disabled={!arsips.next_page_url}
                                            asChild={!!arsips.next_page_url}
                                        >
                                            {arsips.next_page_url ? (
                                                <Link
                                                    href={arsips.next_page_url}
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

                <ArsipCreateDialog
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    klasifikasis={klasifikasis}
                    unitOrganisasis={unitOrganisasis}
                    statusArsips={statusArsips}
                    jenisArsips={jenisArsips}
                    sifatArsips={sifatArsips}
                    tingkatPerkembanganArsips={tingkatPerkembanganArsips}
                    lokasiArsips={lokasiArsips}
                />
            </PageContainer>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Repository Arsip', href: '/arsip' },
    ],
};
