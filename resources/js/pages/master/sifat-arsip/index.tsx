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
import { destroy, index, store, update } from '@/routes/master/sifat-arsip';

type SifatArsip = {
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

type PaginatedSifatArsips = {
    data: SifatArsip[];
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
    total_sifat_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    sifatArsips: PaginatedSifatArsips;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type SifatArsipFormData = {
    kode: string;
    nama: string;
    deskripsi: string;
    status: 'active' | 'inactive';
};

const emptyForm: SifatArsipFormData = {
    kode: '',
    nama: '',
    deskripsi: '',
    status: 'active',
};

function statusVariant(status: SifatArsip['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: SifatArsip['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function SifatArsipFormDialog({
    open,
    mode,
    sifatArsip,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    sifatArsip: SifatArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<SifatArsipFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            sifatArsip
                ? {
                      kode: sifatArsip.kode,
                      nama: sifatArsip.nama,
                      deskripsi: sifatArsip.deskripsi ?? '',
                      status: sifatArsip.status,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, sifatArsip]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && sifatArsip) {
            form.put(update({ sifatArsip: sifatArsip.id }).url, {
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
                            ? 'Tambah Sifat Arsip'
                            : 'Edit Sifat Arsip'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data sifat keamanan/kerahasiaan arsip.
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
                                placeholder="Contoh: SA-001"
                                maxLength={50}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: SifatArsipFormData['status'],
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
                            placeholder="Nama sifat arsip"
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
                            placeholder="Deskripsi sifat arsip"
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
    sifatArsip,
    onOpenChange,
}: {
    sifatArsip: SifatArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={sifatArsip !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Sifat Arsip
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap sifat arsip.
                    </DialogDescription>
                </DialogHeader>

                {sifatArsip && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={sifatArsip.kode} mono />
                        <DetailRow label="Nama" value={sifatArsip.nama} />
                        <DetailRow
                            label="Deskripsi"
                            value={sifatArsip.deskripsi || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={sifatArsip.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={sifatArsip.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(sifatArsip.status)}
                            >
                                {statusLabel(sifatArsip.status)}
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

export default function SifatArsipIndex({
    sifatArsips,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedSifatArsip, setSelectedSifatArsip] =
        useState<SifatArsip | null>(null);
    const [detailSifatArsip, setDetailSifatArsip] = useState<SifatArsip | null>(
        null,
    );
    const [deleteSifatArsip, setDeleteSifatArsip] = useState<SifatArsip | null>(
        null,
    );
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
        setSelectedSifatArsip(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (sifatArsip: SifatArsip) => {
        setSelectedSifatArsip(sifatArsip);
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
        if (!deleteSifatArsip) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        router.delete(destroy({ sifatArsip: deleteSifatArsip.id }).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteSifatArsip(null),
            onError: (errors) => {
                setDeleteError(
                    errors.sifat_arsip || 'Sifat arsip gagal dihapus.',
                );
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Sifat Arsip" />

            <PageContainer>
                <PageHeader
                    title="Sifat Arsip"
                    description="Manajemen data sifat keamanan dan kerahasiaan dokumen arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Sifat Arsip', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Sifat
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Sifat Arsip">
                        <StatValue value={stats.total_sifat_arsip} />
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
                    title="Daftar Sifat Arsip"
                    description="Data sifat arsip yang tersedia dalam repositori"
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

                        {sifatArsips.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada sifat arsip ditemukan"
                                description="Tidak ada data sifat arsip yang cocok dengan pencarian Anda."
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
                                            {sifatArsips.data.map(
                                                (sifatArsip) => (
                                                    <TableRow
                                                        key={sifatArsip.id}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {sifatArsip.kode}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {sifatArsip.nama}
                                                        </TableCell>
                                                        <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                                                            {sifatArsip.deskripsi ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                variant={statusVariant(
                                                                    sifatArsip.status,
                                                                )}
                                                                className="w-fit"
                                                            >
                                                                {statusLabel(
                                                                    sifatArsip.status,
                                                                )}
                                                            </StatusBadge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {sifatArsip.created_at ||
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
                                                                            setDetailSifatArsip(
                                                                                sifatArsip,
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
                                                                                sifatArsip,
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
                                                                            setDeleteSifatArsip(
                                                                                sifatArsip,
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
                                        Menampilkan {sifatArsips.from || 0}{' '}
                                        hingga {sifatArsips.to || 0} dari{' '}
                                        {sifatArsips.total} sifat
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !sifatArsips.prev_page_url
                                            }
                                            asChild={Boolean(
                                                sifatArsips.prev_page_url,
                                            )}
                                        >
                                            {sifatArsips.prev_page_url ? (
                                                <Link
                                                    href={
                                                        sifatArsips.prev_page_url
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
                                                !sifatArsips.next_page_url
                                            }
                                            asChild={Boolean(
                                                sifatArsips.next_page_url,
                                            )}
                                        >
                                            {sifatArsips.next_page_url ? (
                                                <Link
                                                    href={
                                                        sifatArsips.next_page_url
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

            <SifatArsipFormDialog
                open={formOpen}
                mode={formMode}
                sifatArsip={selectedSifatArsip}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                sifatArsip={detailSifatArsip}
                onOpenChange={(open) => !open && setDetailSifatArsip(null)}
            />
            <ConfirmDialog
                isOpen={deleteSifatArsip !== null}
                onClose={() => {
                    setDeleteError(null);
                    setDeleteSifatArsip(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Sifat Arsip"
                description={
                    deleteError ||
                    `Hapus sifat arsip "${deleteSifatArsip?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`
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

SifatArsipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Sifat Arsip', href: '/master/sifat-arsip' },
    ],
};
