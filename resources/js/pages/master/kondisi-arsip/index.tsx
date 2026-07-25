import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    FileText,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import InputError from '@/components/input-error';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { destroy, index, store, update } from '@/routes/master/kondisi-arsip';

type KondisiArsip = {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string | null;
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedKondisiArsips = {
    data: KondisiArsip[];
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
    total_kondisi_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    kondisiArsips: PaginatedKondisiArsips;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type KondisiArsipFormData = {
    kode: string;
    nama: string;
    deskripsi: string;
    status: 'active' | 'inactive';
};

const emptyForm: KondisiArsipFormData = {
    kode: '',
    nama: '',
    deskripsi: '',
    status: 'active',
};

function statusVariant(status: KondisiArsip['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: KondisiArsip['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function KondisiArsipFormDialog({
    open,
    mode,
    kondisiArsip,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    kondisiArsip: KondisiArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<KondisiArsipFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            kondisiArsip
                ? {
                      kode: kondisiArsip.kode,
                      nama: kondisiArsip.nama,
                      deskripsi: kondisiArsip.deskripsi ?? '',
                      status: kondisiArsip.status,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, kondisiArsip]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && kondisiArsip) {
            form.put(update({ kondisiArsip: kondisiArsip.id }).url, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });

            return;
        }

        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create'
                            ? 'Tambah Kondisi Arsip'
                            : 'Edit Kondisi Arsip'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data kondisi fisik arsip.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode</Label>
                            <Input
                                id="kode"
                                value={form.data.kode}
                                onChange={(event) =>
                                    form.setData('kode', event.target.value)
                                }
                                placeholder="Contoh: KA-00001"
                                maxLength={50}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: KondisiArsipFormData['status'],
                                ) => form.setData('status', value)}
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.status} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nama">Nama</Label>
                        <Input
                            id="nama"
                            value={form.data.nama}
                            onChange={(event) =>
                                form.setData('nama', event.target.value)
                            }
                            placeholder="Nama kondisi arsip"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Input
                            id="deskripsi"
                            value={form.data.deskripsi}
                            onChange={(event) =>
                                form.setData('deskripsi', event.target.value)
                            }
                            placeholder="Deskripsi kondisi arsip"
                        />
                        <InputError message={form.errors.deskripsi} />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={form.processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {mode === 'create' ? 'Simpan' : 'Perbarui'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DetailDialog({
    kondisiArsip,
    onOpenChange,
}: {
    kondisiArsip: KondisiArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={kondisiArsip !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Kondisi Arsip
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap kondisi arsip.
                    </DialogDescription>
                </DialogHeader>

                {kondisiArsip && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow
                            label="Kode"
                            value={kondisiArsip.kode}
                            mono
                        />
                        <DetailRow label="Nama" value={kondisiArsip.nama} />
                        <DetailRow
                            label="Deskripsi"
                            value={kondisiArsip.deskripsi || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={kondisiArsip.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={kondisiArsip.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(kondisiArsip.status)}
                            >
                                {statusLabel(kondisiArsip.status)}
                            </StatusBadge>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={
                    mono
                        ? 'text-right font-mono text-xs'
                        : 'text-right font-medium'
                }
            >
                {value}
            </span>
        </div>
    );
}

export default function KondisiArsipIndex({
    kondisiArsips,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedKondisiArsip, setSelectedKondisiArsip] =
        useState<KondisiArsip | null>(null);
    const [detailKondisiArsip, setDetailKondisiArsip] =
        useState<KondisiArsip | null>(null);
    const [deleteKondisiArsip, setDeleteKondisiArsip] =
        useState<KondisiArsip | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const updateFilters = (
        newParams: Record<string, string | null | undefined>,
    ) => {
        const params = {
            ...filters,
            ...newParams,
        };

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

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search !== (filters.search || '')) {
                updateFilters({ search });
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const openCreateDialog = () => {
        setSelectedKondisiArsip(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (kondisiArsip: KondisiArsip) => {
        setSelectedKondisiArsip(kondisiArsip);
        setFormMode('edit');
        setFormOpen(true);
    };

    const clearFilters = () => {
        setSearch('');
        router.get(
            index().url,
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const confirmDelete = () => {
        if (!deleteKondisiArsip) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        router.delete(destroy({ kondisiArsip: deleteKondisiArsip.id }).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteKondisiArsip(null),
            onError: (errors) => {
                setDeleteError(
                    errors.kondisi_arsip || 'Kondisi arsip gagal dihapus.',
                );
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Kondisi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Kondisi Arsip"
                    description="Manajemen data kondisi fisik dokumen arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Kondisi Arsip', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kondisi
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Kondisi Arsip">
                        <StatValue value={stats.total_kondisi_arsip} />
                    </ContentCard>
                    <ContentCard title="Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>
                    <ContentCard title="Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                    <ContentCard title="Dibuat Bulan Ini">
                        <StatValue value={stats.dibuat_bulan_ini} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Kondisi Arsip"
                    description="Data kondisi fisik arsip yang tersedia"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama, atau deskripsi..."
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

                        {kondisiArsips.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada kondisi ditemukan"
                                description="Tidak ada data kondisi arsip yang cocok dengan pencarian Anda."
                                icon={FileText}
                            />
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[130px] font-semibold">
                                                    Kode
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Nama
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Deskripsi
                                                </TableHead>
                                                <TableHead className="w-[110px] font-semibold">
                                                    Status
                                                </TableHead>
                                                <TableHead className="w-[170px] font-semibold">
                                                    Dibuat Pada
                                                </TableHead>
                                                <TableHead className="w-[80px] text-right font-semibold">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {kondisiArsips.data.map(
                                                (kondisiArsip) => (
                                                    <TableRow
                                                        key={kondisiArsip.id}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {kondisiArsip.kode}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {kondisiArsip.nama}
                                                        </TableCell>
                                                        <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                                                            {kondisiArsip.deskripsi ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                variant={statusVariant(
                                                                    kondisiArsip.status,
                                                                )}
                                                                className="w-fit"
                                                            >
                                                                {statusLabel(
                                                                    kondisiArsip.status,
                                                                )}
                                                            </StatusBadge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {kondisiArsip.created_at ||
                                                                '-'}
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
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-40"
                                                                >
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            setDetailKondisiArsip(
                                                                                kondisiArsip,
                                                                            )
                                                                        }
                                                                        className="flex cursor-pointer items-center gap-2"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        Detail
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                kondisiArsip,
                                                                            )
                                                                        }
                                                                        className="flex cursor-pointer items-center gap-2"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setDeleteError(
                                                                                null,
                                                                            );
                                                                            setDeleteKondisiArsip(
                                                                                kondisiArsip,
                                                                            );
                                                                        }}
                                                                        className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Hapus
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Menampilkan {kondisiArsips.from || 0}{' '}
                                        hingga {kondisiArsips.to || 0} dari{' '}
                                        {kondisiArsips.total} kondisi
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !kondisiArsips.prev_page_url
                                            }
                                            asChild={Boolean(
                                                kondisiArsips.prev_page_url,
                                            )}
                                        >
                                            {kondisiArsips.prev_page_url ? (
                                                <Link
                                                    href={
                                                        kondisiArsips.prev_page_url
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
                                                !kondisiArsips.next_page_url
                                            }
                                            asChild={Boolean(
                                                kondisiArsips.next_page_url,
                                            )}
                                        >
                                            {kondisiArsips.next_page_url ? (
                                                <Link
                                                    href={
                                                        kondisiArsips.next_page_url
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

            <KondisiArsipFormDialog
                open={formOpen}
                mode={formMode}
                kondisiArsip={selectedKondisiArsip}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                kondisiArsip={detailKondisiArsip}
                onOpenChange={(open) => !open && setDetailKondisiArsip(null)}
            />
            <ConfirmDialog
                isOpen={deleteKondisiArsip !== null}
                onClose={() => {
                    setDeleteError(null);
                    setDeleteKondisiArsip(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Kondisi Arsip"
                description={
                    deleteError ||
                    `Hapus kondisi arsip "${deleteKondisiArsip?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`
                }
                confirmLabel="Hapus"
                loading={deleting}
                destructive
            />
        </>
    );
}

function StatValue({ value }: { value: number }) {
    return (
        <div className="text-2xl font-semibold tracking-normal text-foreground">
            {value.toLocaleString('id-ID')}
        </div>
    );
}

KondisiArsipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kondisi Arsip', href: '/master/kondisi-arsip' },
    ],
};
