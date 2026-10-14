import { Head, router, useForm } from '@inertiajs/react';
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
import { toast } from 'sonner';
import { Can } from '@/components/Can';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import InputError from '@/components/input-error';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { DataTablePagination } from '@/components/Tables/data-table-pagination';
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
import { destroy, index, store, update } from '@/routes/master/jenis-arsip';

type JenisArsip = {
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

type PaginatedJenisArsips = {
    data: JenisArsip[];
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
    total_jenis_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    jenisArsips: PaginatedJenisArsips;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type JenisArsipFormData = {
    kode: string;
    nama: string;
    deskripsi: string;
    status: 'active' | 'inactive';
};

const emptyForm: JenisArsipFormData = {
    kode: '',
    nama: '',
    deskripsi: '',
    status: 'active',
};

function statusVariant(status: JenisArsip['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: JenisArsip['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function JenisArsipFormDialog({
    open,
    mode,
    jenisArsip,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    jenisArsip: JenisArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<JenisArsipFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            jenisArsip
                ? {
                      kode: jenisArsip.kode,
                      nama: jenisArsip.nama,
                      deskripsi: jenisArsip.deskripsi ?? '',
                      status: jenisArsip.status,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, jenisArsip]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && jenisArsip) {
            form.put(update({ jenisArsip: jenisArsip.id }).url, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
                onError: () =>
                    toast.error('Terjadi kesalahan saat memperbarui data.', {
                        description:
                            'Periksa kembali kolom yang ditandai merah.',
                    }),
            });

            return;
        }

        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
            onError: () =>
                toast.error('Terjadi kesalahan saat menyimpan data.', {
                    description: 'Periksa kembali kolom yang ditandai merah.',
                }),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create'
                            ? 'Tambah Jenis Arsip'
                            : 'Edit Jenis Arsip'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data jenis arsip sesuai kategori yang
                        digunakan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode Jenis Arsip</Label>
                            <div>
                                <Input
                                    id="kode"
                                    value="[Otomatis dibuat oleh sistem]"
                                    disabled
                                    className="cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground"
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {mode === 'edit'
                                        ? 'Kode jenis arsip bersifat tetap dan tidak dapat diubah.'
                                        : 'Nomor unik akan digenerate otomatis saat disimpan.'}
                                </p>
                            </div>
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: JenisArsipFormData['status'],
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
                            placeholder="Nama jenis arsip"
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
                            placeholder="Deskripsi jenis arsip"
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
    jenisArsip,
    onOpenChange,
}: {
    jenisArsip: JenisArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={jenisArsip !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Jenis Arsip
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap jenis arsip.
                    </DialogDescription>
                </DialogHeader>

                {jenisArsip && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={jenisArsip.kode} mono />
                        <DetailRow label="Nama" value={jenisArsip.nama} />
                        <DetailRow
                            label="Deskripsi"
                            value={jenisArsip.deskripsi || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={jenisArsip.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={jenisArsip.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(jenisArsip.status)}
                            >
                                {statusLabel(jenisArsip.status)}
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

export default function JenisArsipIndex({
    jenisArsips,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedJenisArsip, setSelectedJenisArsip] =
        useState<JenisArsip | null>(null);
    const [detailJenisArsip, setDetailJenisArsip] = useState<JenisArsip | null>(
        null,
    );
    const [deleteJenisArsip, setDeleteJenisArsip] = useState<JenisArsip | null>(
        null,
    );
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
        setSelectedJenisArsip(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (jenisArsip: JenisArsip) => {
        setSelectedJenisArsip(jenisArsip);
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
        if (!deleteJenisArsip) {
            return;
        }

        setDeleting(true);

        router.delete(destroy({ jenisArsip: deleteJenisArsip.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteJenisArsip(null);
            },
            onError: () => {
                toast.error('Gagal menghapus data.', {
                    description: 'Terjadi kesalahan, silakan coba lagi.',
                });
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <RouteGuard permission="master-jenis-arsip.view">
            <Head title="Jenis Arsip" />

            <PageContainer>
                <PageHeader
                    title="Jenis Arsip"
                    description="Manajemen data jenis dan kategori dokumen arsip."
                    breadcrumb={[
                        { title: 'MASTER DATA' },
                        { title: 'Jenis Arsip' },
                    ]}
                    actions={
                        <Can permission="master.create">
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Jenis
                            </Button>
                        </Can>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <ContentCard title="Total Jenis Arsip">
                        <StatValue value={stats.total_jenis_arsip} />
                    </ContentCard>
                    <ContentCard title="Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>
                    <ContentCard title="Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Jenis Arsip"
                    description="Data jenis arsip yang tersedia dalam repositori"
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

                        {jenisArsips.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada jenis arsip ditemukan"
                                description="Tidak ada data jenis arsip yang cocok dengan pencarian Anda."
                                icon={FileText}
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border border-border/60">
                                    <Table className="min-w-[650px]">
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
                                            {jenisArsips.data.map(
                                                (jenisArsip) => (
                                                    <TableRow
                                                        key={jenisArsip.id}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {jenisArsip.kode}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {jenisArsip.nama}
                                                        </TableCell>
                                                        <TableCell className="max-w-[260px] truncate text-sm text-muted-foreground">
                                                            {jenisArsip.deskripsi ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                variant={statusVariant(
                                                                    jenisArsip.status,
                                                                )}
                                                                className="w-fit"
                                                            >
                                                                {statusLabel(
                                                                    jenisArsip.status,
                                                                )}
                                                            </StatusBadge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {jenisArsip.created_at ||
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
                                                                            setDetailJenisArsip(
                                                                                jenisArsip,
                                                                            )
                                                                        }
                                                                        className="flex cursor-pointer items-center gap-2"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        Detail
                                                                    </DropdownMenuItem>
                                                                    <Can permission="master.update">
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                openEditDialog(
                                                                                    jenisArsip,
                                                                                )
                                                                            }
                                                                            className="flex cursor-pointer items-center gap-2"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                    </Can>
                                                                    <Can permission="master.delete">
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setDeleteJenisArsip(
                                                                                    jenisArsip,
                                                                                );
                                                                            }}
                                                                            className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            Hapus
                                                                        </DropdownMenuItem>
                                                                    </Can>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <DataTablePagination
                                    data={jenisArsips}
                                    itemName="jenis"
                                />
                            </>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <JenisArsipFormDialog
                open={formOpen}
                mode={formMode}
                jenisArsip={selectedJenisArsip}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                jenisArsip={detailJenisArsip}
                onOpenChange={(open) => !open && setDetailJenisArsip(null)}
            />
            <ConfirmDialog
                isOpen={deleteJenisArsip !== null}
                onClose={() => {
                    setDeleteJenisArsip(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Jenis Arsip"
                description={`Hapus jenis arsip "${deleteJenisArsip?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
                confirmLabel="Hapus"
                loading={deleting}
                destructive
            />
        </RouteGuard>
    );
}

function StatValue({ value }: { value: number }) {
    return (
        <div className="text-2xl font-semibold tracking-normal text-foreground">
            {value.toLocaleString('id-ID')}
        </div>
    );
}

JenisArsipIndex.layout = {
    breadcrumbs: [
        { title: 'MASTER DATA' },
        { title: 'Jenis Arsip', href: '/master/jenis-arsip' },
    ],
};
