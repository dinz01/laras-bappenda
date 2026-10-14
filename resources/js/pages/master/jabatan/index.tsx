import { Head, router, useForm } from '@inertiajs/react';
import {
    BriefcaseBusiness,
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
import { destroy, index, store, update } from '@/routes/master/jabatan';

type Jabatan = {
    id: number;
    kode: string;
    nama: string;
    singkatan: string | null;
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedJabatans = {
    data: Jabatan[];
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
    total_jabatan: number;
    aktif: number;
    nonaktif: number;
    bulan_ini: number;
};

type IndexProps = {
    jabatans: PaginatedJabatans;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type JabatanFormData = {
    kode: string;
    nama: string;
    singkatan: string;
    status: 'active' | 'inactive';
};

const emptyForm: JabatanFormData = {
    kode: '',
    nama: '',
    singkatan: '',
    status: 'active',
};

function statusVariant(status: Jabatan['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: Jabatan['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function JabatanFormDialog({
    open,
    mode,
    jabatan,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    jabatan: Jabatan | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<JabatanFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            jabatan
                ? {
                      kode: jabatan.kode,
                      nama: jabatan.nama,
                      singkatan: jabatan.singkatan ?? '',
                      status: jabatan.status,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, jabatan]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && jabatan) {
            form.put(update({ jabatan: jabatan.id }).url, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
                onError: () =>
                    toast.error('Terjadi kesalahan saat memperbarui jabatan.', {
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
                toast.error('Terjadi kesalahan saat menyimpan jabatan.', {
                    description: 'Periksa kembali kolom yang ditandai merah.',
                }),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create' ? 'Tambah Jabatan' : 'Edit Jabatan'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data jabatan sesuai struktur organisasi.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode Jabatan</Label>
                            <div>
                                <Input
                                    id="kode"
                                    value="[Otomatis dibuat oleh sistem]"
                                    disabled
                                    className="cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground"
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {mode === 'edit'
                                        ? 'Kode jabatan bersifat tetap dan tidak dapat diubah.'
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
                                    value: JabatanFormData['status'],
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
                        <Label htmlFor="nama">Nama Jabatan</Label>
                        <Input
                            id="nama"
                            value={form.data.nama}
                            onChange={(event) =>
                                form.setData('nama', event.target.value)
                            }
                            placeholder="Nama jabatan"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="singkatan">Singkatan</Label>
                        <Input
                            id="singkatan"
                            value={form.data.singkatan}
                            onChange={(e) =>
                                form.setData('singkatan', e.target.value)
                            }
                            placeholder="Contoh: KABID"
                            maxLength={50}
                        />
                        <InputError message={form.errors.singkatan} />
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
    jabatan,
    onOpenChange,
}: {
    jabatan: Jabatan | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={jabatan !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Jabatan
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap jabatan.
                    </DialogDescription>
                </DialogHeader>

                {jabatan && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={jabatan.kode} mono />
                        <DetailRow label="Nama Jabatan" value={jabatan.nama} />
                        <DetailRow
                            label="Singkatan"
                            value={jabatan.singkatan || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={jabatan.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={jabatan.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(jabatan.status)}
                            >
                                {statusLabel(jabatan.status)}
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

export default function JabatanIndex({
    jabatans,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedJabatan, setSelectedJabatan] = useState<Jabatan | null>(
        null,
    );
    const [detailJabatan, setDetailJabatan] = useState<Jabatan | null>(null);
    const [deleteJabatan, setDeleteJabatan] = useState<Jabatan | null>(null);
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
        setSelectedJabatan(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (jabatan: Jabatan) => {
        setSelectedJabatan(jabatan);
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
        if (!deleteJabatan) {
            return;
        }

        setDeleting(true);

        router.delete(destroy({ jabatan: deleteJabatan.id }).url, {
            preserveScroll: true,
            onError: () => {
                toast.error('Jabatan gagal dihapus.', {
                    description: 'Terjadi kesalahan, silakan coba lagi.',
                });
            },
            onSuccess: () => {
                setDeleteJabatan(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <RouteGuard permission="master-jabatan.view">
            <Head title="Jabatan" />

            <PageContainer>
                <PageHeader
                    title="Jabatan"
                    description="Manajemen data jabatan dalam struktur organisasi."
                    breadcrumb={[
                        { title: 'MASTER DATA' },
                        { title: 'Jabatan' },
                    ]}
                    actions={
                        <Can permission="master.create">
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Jabatan
                            </Button>
                        </Can>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <ContentCard title="Total Jabatan">
                        <StatValue value={stats.total_jabatan} />
                    </ContentCard>
                    <ContentCard title="Jabatan Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>

                    <ContentCard title="Jabatan Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Jabatan"
                    description="Data jabatan yang tersedia dalam struktur organisasi"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama jabatan, atau singkatan..."
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

                        {jabatans.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada jabatan ditemukan"
                                description="Tidak ada data jabatan yang cocok dengan pencarian Anda."
                                icon={BriefcaseBusiness}
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
                                                    Nama Jabatan
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Singkatan
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
                                            {jabatans.data.map((jabatan) => (
                                                <TableRow
                                                    key={jabatan.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {jabatan.kode}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {jabatan.nama}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {jabatan.singkatan ||
                                                            '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            variant={statusVariant(
                                                                jabatan.status,
                                                            )}
                                                            className="w-fit"
                                                        >
                                                            {statusLabel(
                                                                jabatan.status,
                                                            )}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {jabatan.created_at ||
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
                                                                        setDetailJabatan(
                                                                            jabatan,
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
                                                                                jabatan,
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
                                                                            setDeleteJabatan(
                                                                                jabatan,
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <DataTablePagination
                                    data={jabatans}
                                    itemName="jabatan"
                                />
                            </>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <JabatanFormDialog
                open={formOpen}
                mode={formMode}
                jabatan={selectedJabatan}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                jabatan={detailJabatan}
                onOpenChange={(open) => !open && setDetailJabatan(null)}
            />
            <ConfirmDialog
                isOpen={deleteJabatan !== null}
                onClose={() => setDeleteJabatan(null)}
                onConfirm={confirmDelete}
                title="Hapus Jabatan"
                description={`Hapus jabatan "${deleteJabatan?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
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

JabatanIndex.layout = {
    breadcrumbs: [
        { title: 'MASTER DATA' },
        { title: 'Jabatan', href: '/master/jabatan' },
    ],
};
