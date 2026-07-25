import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
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
import { destroy, index, store, update } from '@/routes/master/retensi-arsip';

type MetodePenyusutanArsipOption = {
    id: number;
    kode: string;
    nama: string;
};

type RetensiArsip = {
    id: number;
    kode: string;
    nama: string;
    retensi_aktif: number;
    retensi_inaktif: number;
    nasib_akhir: string | null;
    metode_penyusutan_arsip_id: number | null;
    metode_penyusutan_arsip: MetodePenyusutanArsipOption | null;
    keterangan: string | null;
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedRetensiArsips = {
    data: RetensiArsip[];
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
    total_retensi_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    retensiArsips: PaginatedRetensiArsips;
    metodePenyusutanArsips: MetodePenyusutanArsipOption[];
    stats: Stats;
    filters: {
        search?: string;
    };
};

type RetensiArsipFormData = {
    kode: string;
    nama: string;
    retensi_aktif: string;
    retensi_inaktif: string;
    nasib_akhir: string;
    metode_penyusutan_arsip_id: string;
    keterangan: string;
    status: 'active' | 'inactive';
};

const emptyForm: RetensiArsipFormData = {
    kode: '',
    nama: '',
    retensi_aktif: '0',
    retensi_inaktif: '0',
    nasib_akhir: '',
    metode_penyusutan_arsip_id: '',
    keterangan: '',
    status: 'active',
};

function statusVariant(status: RetensiArsip['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: RetensiArsip['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function RetensiArsipFormDialog({
    open,
    mode,
    retensiArsip,
    metodePenyusutanArsips,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    retensiArsip: RetensiArsip | null;
    metodePenyusutanArsips: MetodePenyusutanArsipOption[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<RetensiArsipFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            retensiArsip
                ? {
                      kode: retensiArsip.kode,
                      nama: retensiArsip.nama,
                      retensi_aktif: String(retensiArsip.retensi_aktif),
                      retensi_inaktif: String(retensiArsip.retensi_inaktif),
                      nasib_akhir: retensiArsip.nasib_akhir ?? '',
                      metode_penyusutan_arsip_id:
                          retensiArsip.metode_penyusutan_arsip_id
                              ? String(retensiArsip.metode_penyusutan_arsip_id)
                              : '',
                      keterangan: retensiArsip.keterangan ?? '',
                      status: retensiArsip.status,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, retensiArsip]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && retensiArsip) {
            form.put(update({ retensiArsip: retensiArsip.id }).url, {
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
                            ? 'Tambah Retensi Arsip'
                            : 'Edit Retensi Arsip'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data jadwal retensi arsip sesuai ketentuan yang
                        berlaku.
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
                                placeholder="Contoh: JRA-001"
                                maxLength={50}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: RetensiArsipFormData['status'],
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
                            placeholder="Nama retensi arsip"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="retensi_aktif">
                                Retensi Aktif (Tahun)
                            </Label>
                            <Input
                                id="retensi_aktif"
                                type="number"
                                min="0"
                                value={form.data.retensi_aktif}
                                onChange={(event) =>
                                    form.setData(
                                        'retensi_aktif',
                                        event.target.value,
                                    )
                                }
                                placeholder="0"
                            />
                            <InputError message={form.errors.retensi_aktif} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="retensi_inaktif">
                                Retensi Inaktif (Tahun)
                            </Label>
                            <Input
                                id="retensi_inaktif"
                                type="number"
                                min="0"
                                value={form.data.retensi_inaktif}
                                onChange={(event) =>
                                    form.setData(
                                        'retensi_inaktif',
                                        event.target.value,
                                    )
                                }
                                placeholder="0"
                            />
                            <InputError message={form.errors.retensi_inaktif} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nasib_akhir">Nasib Akhir</Label>
                            <Input
                                id="nasib_akhir"
                                value={form.data.nasib_akhir}
                                onChange={(event) =>
                                    form.setData(
                                        'nasib_akhir',
                                        event.target.value,
                                    )
                                }
                                placeholder="Contoh: Musnah / Permanen"
                                maxLength={100}
                            />
                            <InputError message={form.errors.nasib_akhir} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metode_penyusutan_arsip_id">
                                Metode Penyusutan
                            </Label>
                            <Select
                                value={form.data.metode_penyusutan_arsip_id}
                                onValueChange={(value: string) =>
                                    form.setData(
                                        'metode_penyusutan_arsip_id',
                                        value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="metode_penyusutan_arsip_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih metode penyusutan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {metodePenyusutanArsips.map((metode) => (
                                        <SelectItem
                                            key={metode.id}
                                            value={String(metode.id)}
                                        >
                                            {metode.nama} ({metode.kode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError
                                message={form.errors.metode_penyusutan_arsip_id}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <Input
                            id="keterangan"
                            value={form.data.keterangan}
                            onChange={(event) =>
                                form.setData('keterangan', event.target.value)
                            }
                            placeholder="Keterangan retensi arsip"
                        />
                        <InputError message={form.errors.keterangan} />
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
    retensiArsip,
    onOpenChange,
}: {
    retensiArsip: RetensiArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={retensiArsip !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Retensi Arsip
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap jadwal retensi arsip.
                    </DialogDescription>
                </DialogHeader>

                {retensiArsip && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow
                            label="Kode"
                            value={retensiArsip.kode}
                            mono
                        />
                        <DetailRow label="Nama" value={retensiArsip.nama} />
                        <DetailRow
                            label="Retensi Aktif"
                            value={`${retensiArsip.retensi_aktif} Tahun`}
                        />
                        <DetailRow
                            label="Retensi Inaktif"
                            value={`${retensiArsip.retensi_inaktif} Tahun`}
                        />
                        <DetailRow
                            label="Nasib Akhir"
                            value={retensiArsip.nasib_akhir || '-'}
                        />
                        <DetailRow
                            label="Metode Penyusutan"
                            value={
                                retensiArsip.metode_penyusutan_arsip
                                    ? `${retensiArsip.metode_penyusutan_arsip.nama} (${retensiArsip.metode_penyusutan_arsip.kode})`
                                    : '-'
                            }
                        />
                        <DetailRow
                            label="Keterangan"
                            value={retensiArsip.keterangan || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={retensiArsip.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={retensiArsip.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(retensiArsip.status)}
                            >
                                {statusLabel(retensiArsip.status)}
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

export default function RetensiArsipIndex({
    retensiArsips,
    metodePenyusutanArsips = [],
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedRetensiArsip, setSelectedRetensiArsip] =
        useState<RetensiArsip | null>(null);
    const [detailRetensiArsip, setDetailRetensiArsip] =
        useState<RetensiArsip | null>(null);
    const [deleteRetensiArsip, setDeleteRetensiArsip] =
        useState<RetensiArsip | null>(null);
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
        setSelectedRetensiArsip(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (retensiArsip: RetensiArsip) => {
        setSelectedRetensiArsip(retensiArsip);
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
        if (!deleteRetensiArsip) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        router.delete(destroy({ retensiArsip: deleteRetensiArsip.id }).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteRetensiArsip(null),
            onError: (errors) => {
                setDeleteError(
                    errors.retensi_arsip || 'Retensi arsip gagal dihapus.',
                );
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Retensi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Retensi Arsip"
                    description="Manajemen data jadwal retensi arsip (JRA)."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Retensi Arsip', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Retensi
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Retensi Arsip">
                        <StatValue value={stats.total_retensi_arsip} />
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
                    title="Daftar Retensi Arsip"
                    description="Data jadwal retensi arsip yang tersedia"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama, nasib akhir, atau keterangan..."
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

                        {retensiArsips.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada retensi arsip ditemukan"
                                description="Tidak ada data retensi arsip yang cocok dengan pencarian Anda."
                                icon={Archive}
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
                                                <TableHead className="w-[110px] text-center font-semibold">
                                                    Retensi Aktif
                                                </TableHead>
                                                <TableHead className="w-[110px] text-center font-semibold">
                                                    Retensi Inaktif
                                                </TableHead>
                                                <TableHead className="w-[130px] font-semibold">
                                                    Nasib Akhir
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
                                            {retensiArsips.data.map(
                                                (retensiArsip) => (
                                                    <TableRow
                                                        key={retensiArsip.id}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {retensiArsip.kode}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {retensiArsip.nama}
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm">
                                                            {
                                                                retensiArsip.retensi_aktif
                                                            }{' '}
                                                            Thn
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm">
                                                            {
                                                                retensiArsip.retensi_inaktif
                                                            }{' '}
                                                            Thn
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium">
                                                            {retensiArsip.nasib_akhir ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                variant={statusVariant(
                                                                    retensiArsip.status,
                                                                )}
                                                                className="w-fit"
                                                            >
                                                                {statusLabel(
                                                                    retensiArsip.status,
                                                                )}
                                                            </StatusBadge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {retensiArsip.created_at ||
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
                                                                            setDetailRetensiArsip(
                                                                                retensiArsip,
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
                                                                                retensiArsip,
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
                                                                            setDeleteRetensiArsip(
                                                                                retensiArsip,
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
                                        Menampilkan {retensiArsips.from || 0}{' '}
                                        hingga {retensiArsips.to || 0} dari{' '}
                                        {retensiArsips.total} retensi
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !retensiArsips.prev_page_url
                                            }
                                            asChild={Boolean(
                                                retensiArsips.prev_page_url,
                                            )}
                                        >
                                            {retensiArsips.prev_page_url ? (
                                                <Link
                                                    href={
                                                        retensiArsips.prev_page_url
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
                                                !retensiArsips.next_page_url
                                            }
                                            asChild={Boolean(
                                                retensiArsips.next_page_url,
                                            )}
                                        >
                                            {retensiArsips.next_page_url ? (
                                                <Link
                                                    href={
                                                        retensiArsips.next_page_url
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

            <RetensiArsipFormDialog
                open={formOpen}
                mode={formMode}
                retensiArsip={selectedRetensiArsip}
                metodePenyusutanArsips={metodePenyusutanArsips}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                retensiArsip={detailRetensiArsip}
                onOpenChange={(open) => !open && setDetailRetensiArsip(null)}
            />
            <ConfirmDialog
                isOpen={deleteRetensiArsip !== null}
                onClose={() => {
                    setDeleteError(null);
                    setDeleteRetensiArsip(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Retensi Arsip"
                description={
                    deleteError ||
                    `Hapus retensi arsip "${deleteRetensiArsip?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`
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

RetensiArsipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Retensi Arsip', href: '/master/retensi-arsip' },
    ],
};
