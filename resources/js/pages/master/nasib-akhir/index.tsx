import { Head, router, useForm } from '@inertiajs/react';
import {
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Tag,
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
import { destroy, index, store, update } from '@/routes/master/nasib-akhir';

type NasibAkhir = {
    id: number;
    kode: string;
    nama: string;
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

type PaginatedNasibAkhirs = {
    data: NasibAkhir[];
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
    total_nasib_akhir: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    nasibAkhirs: PaginatedNasibAkhirs;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type NasibAkhirFormData = {
    kode: string;
    nama: string;
    keterangan: string;
    status: 'active' | 'inactive';
};

const emptyForm: NasibAkhirFormData = {
    kode: '',
    nama: '',
    keterangan: '',
    status: 'active',
};

function statusVariant(status: NasibAkhir['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: NasibAkhir['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function NasibAkhirFormDialog({
    open,
    mode,
    nasibAkhir,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    nasibAkhir: NasibAkhir | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<NasibAkhirFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            nasibAkhir
                ? {
                      kode: nasibAkhir.kode,
                      nama: nasibAkhir.nama,
                      keterangan: nasibAkhir.keterangan ?? '',
                      status: nasibAkhir.status,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, nasibAkhir]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && nasibAkhir) {
            form.put(update({ nasibAkhir: nasibAkhir.id }).url, {
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
                            ? 'Tambah Nasib Akhir'
                            : 'Edit Nasib Akhir'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data master nasib akhir arsip sesuai ketentuan
                        yang berlaku.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode</Label>
                            <Input
                                id="kode"
                                value="[Otomatis dibuat oleh sistem]"
                                disabled
                                className="cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground"
                            />
                            <p className="text-[0.75rem] text-muted-foreground">
                                {mode === 'edit'
                                    ? 'Kode nasib akhir bersifat tetap dan tidak dapat diubah.'
                                    : 'Nomor unik akan digenerate otomatis saat disimpan.'}
                            </p>
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: NasibAkhirFormData['status'],
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
                            placeholder="Contoh: Musnah / Permanen"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <Input
                            id="keterangan"
                            value={form.data.keterangan}
                            onChange={(event) =>
                                form.setData('keterangan', event.target.value)
                            }
                            placeholder="Keterangan nasib akhir"
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
    nasibAkhir,
    onOpenChange,
}: {
    nasibAkhir: NasibAkhir | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={nasibAkhir !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Nasib Akhir
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap data master nasib akhir.
                    </DialogDescription>
                </DialogHeader>

                {nasibAkhir && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={nasibAkhir.kode} mono />
                        <DetailRow label="Nama" value={nasibAkhir.nama} />
                        <DetailRow
                            label="Keterangan"
                            value={nasibAkhir.keterangan || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={nasibAkhir.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={nasibAkhir.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(nasibAkhir.status)}
                            >
                                {statusLabel(nasibAkhir.status)}
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

export default function NasibAkhirIndex({
    nasibAkhirs,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedNasibAkhir, setSelectedNasibAkhir] =
        useState<NasibAkhir | null>(null);
    const [detailNasibAkhir, setDetailNasibAkhir] = useState<NasibAkhir | null>(
        null,
    );
    const [deleteNasibAkhir, setDeleteNasibAkhir] = useState<NasibAkhir | null>(
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
        setSelectedNasibAkhir(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (nasibAkhir: NasibAkhir) => {
        setSelectedNasibAkhir(nasibAkhir);
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
        if (!deleteNasibAkhir) {
            return;
        }

        setDeleting(true);

        router.delete(destroy({ nasibAkhir: deleteNasibAkhir.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteNasibAkhir(null);
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
        <RouteGuard permission="master-nasib-akhir.view">
            <Head title="Nasib Akhir" />

            <PageContainer>
                <PageHeader
                    title="Nasib Akhir"
                    description="Manajemen data master nasib akhir arsip."
                    breadcrumb={[
                        { title: 'MASTER DATA' },
                        { title: 'Nasib Akhir', href: index.url() },
                    ]}
                    actions={
                        <Can permission="master.create">
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Nasib Akhir
                            </Button>
                        </Can>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <ContentCard title="Total Nasib Akhir">
                        <StatValue value={stats.total_nasib_akhir} />
                    </ContentCard>
                    <ContentCard title="Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>
                    <ContentCard title="Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Nasib Akhir"
                    description="Data master nasib akhir yang tersedia"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama, atau keterangan..."
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

                        {nasibAkhirs.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada nasib akhir ditemukan"
                                description="Tidak ada data nasib akhir yang cocok dengan pencarian Anda."
                                icon={Tag}
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
                                                    Keterangan
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
                                            {nasibAkhirs.data.map(
                                                (nasibAkhir) => (
                                                    <TableRow
                                                        key={nasibAkhir.id}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {nasibAkhir.kode}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {nasibAkhir.nama}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {nasibAkhir.keterangan ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                variant={statusVariant(
                                                                    nasibAkhir.status,
                                                                )}
                                                                className="w-fit"
                                                            >
                                                                {statusLabel(
                                                                    nasibAkhir.status,
                                                                )}
                                                            </StatusBadge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {nasibAkhir.created_at ||
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
                                                                            setDetailNasibAkhir(
                                                                                nasibAkhir,
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
                                                                                    nasibAkhir,
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
                                                                                setDeleteNasibAkhir(
                                                                                    nasibAkhir,
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
                                    data={nasibAkhirs}
                                    itemName="nasib akhir"
                                />
                            </>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <NasibAkhirFormDialog
                open={formOpen}
                mode={formMode}
                nasibAkhir={selectedNasibAkhir}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                nasibAkhir={detailNasibAkhir}
                onOpenChange={(open) => !open && setDetailNasibAkhir(null)}
            />
            <ConfirmDialog
                isOpen={deleteNasibAkhir !== null}
                onClose={() => {
                    setDeleteNasibAkhir(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Nasib Akhir"
                description={`Hapus nasib akhir "${deleteNasibAkhir?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
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

NasibAkhirIndex.layout = {
    breadcrumbs: [
        { title: 'MASTER DATA' },
        { title: 'Nasib Akhir', href: '/master/nasib-akhir' },
    ],
};
