import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Eye,
    MapPin,
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
import { destroy, index, store, update } from '@/routes/master/lokasi-arsip';

type LokasiArsip = {
    id: number;
    kode: string;
    nama: string;
    gedung: string | null;
    lantai: string | null;
    ruangan: string | null;
    rak: string | null;
    box: string | null;
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

type PaginatedLokasiArsips = {
    data: LokasiArsip[];
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
    total_lokasi_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    lokasiArsips: PaginatedLokasiArsips;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type LokasiArsipFormData = {
    kode: string;
    nama: string;
    gedung: string;
    lantai: string;
    ruangan: string;
    rak: string;
    box: string;
    keterangan: string;
    status: 'active' | 'inactive';
};

const emptyForm: LokasiArsipFormData = {
    kode: '',
    nama: '',
    gedung: '',
    lantai: '',
    ruangan: '',
    rak: '',
    box: '',
    keterangan: '',
    status: 'active',
};

function statusVariant(status: LokasiArsip['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: LokasiArsip['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function LokasiArsipFormDialog({
    open,
    mode,
    lokasiArsip,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    lokasiArsip: LokasiArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<LokasiArsipFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            lokasiArsip
                ? {
                      kode: lokasiArsip.kode,
                      nama: lokasiArsip.nama,
                      gedung: lokasiArsip.gedung ?? '',
                      lantai: lokasiArsip.lantai ?? '',
                      ruangan: lokasiArsip.ruangan ?? '',
                      rak: lokasiArsip.rak ?? '',
                      box: lokasiArsip.box ?? '',
                      keterangan: lokasiArsip.keterangan ?? '',
                      status: lokasiArsip.status,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, lokasiArsip]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && lokasiArsip) {
            form.put(update({ lokasiArsip: lokasiArsip.id }).url, {
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
            <DialogContent className="border-border/60 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create'
                            ? 'Tambah Lokasi Arsip'
                            : 'Edit Lokasi Arsip'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data lokasi penyimpanan fisik arsip.
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
                                placeholder="Contoh: LOC-001"
                                maxLength={50}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: LokasiArsipFormData['status'],
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
                            placeholder="Nama lokasi arsip"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="gedung">Gedung</Label>
                            <Input
                                id="gedung"
                                value={form.data.gedung}
                                onChange={(event) =>
                                    form.setData('gedung', event.target.value)
                                }
                                placeholder="Contoh: Gedung A"
                                maxLength={100}
                            />
                            <InputError message={form.errors.gedung} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lantai">Lantai</Label>
                            <Input
                                id="lantai"
                                value={form.data.lantai}
                                onChange={(event) =>
                                    form.setData('lantai', event.target.value)
                                }
                                placeholder="Contoh: 1"
                                maxLength={50}
                            />
                            <InputError message={form.errors.lantai} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ruangan">Ruangan</Label>
                            <Input
                                id="ruangan"
                                value={form.data.ruangan}
                                onChange={(event) =>
                                    form.setData('ruangan', event.target.value)
                                }
                                placeholder="Contoh: Ruang 101"
                                maxLength={100}
                            />
                            <InputError message={form.errors.ruangan} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="rak">Rak</Label>
                            <Input
                                id="rak"
                                value={form.data.rak}
                                onChange={(event) =>
                                    form.setData('rak', event.target.value)
                                }
                                placeholder="Contoh: Rak A-01"
                                maxLength={50}
                            />
                            <InputError message={form.errors.rak} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="box">Box</Label>
                            <Input
                                id="box"
                                value={form.data.box}
                                onChange={(event) =>
                                    form.setData('box', event.target.value)
                                }
                                placeholder="Contoh: BOX-001"
                                maxLength={50}
                            />
                            <InputError message={form.errors.box} />
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
                            placeholder="Keterangan lokasi arsip"
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
    lokasiArsip,
    onOpenChange,
}: {
    lokasiArsip: LokasiArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={lokasiArsip !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Lokasi Arsip
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap lokasi arsip.
                    </DialogDescription>
                </DialogHeader>

                {lokasiArsip && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={lokasiArsip.kode} mono />
                        <DetailRow label="Nama" value={lokasiArsip.nama} />
                        <DetailRow
                            label="Gedung"
                            value={lokasiArsip.gedung || '-'}
                        />
                        <DetailRow
                            label="Lantai"
                            value={lokasiArsip.lantai || '-'}
                        />
                        <DetailRow
                            label="Ruangan"
                            value={lokasiArsip.ruangan || '-'}
                        />
                        <DetailRow label="Rak" value={lokasiArsip.rak || '-'} />
                        <DetailRow label="Box" value={lokasiArsip.box || '-'} />
                        <DetailRow
                            label="Keterangan"
                            value={lokasiArsip.keterangan || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={lokasiArsip.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={lokasiArsip.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(lokasiArsip.status)}
                            >
                                {statusLabel(lokasiArsip.status)}
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

export default function LokasiArsipIndex({
    lokasiArsips,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedLokasiArsip, setSelectedLokasiArsip] =
        useState<LokasiArsip | null>(null);
    const [detailLokasiArsip, setDetailLokasiArsip] =
        useState<LokasiArsip | null>(null);
    const [deleteLokasiArsip, setDeleteLokasiArsip] =
        useState<LokasiArsip | null>(null);
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
        setSelectedLokasiArsip(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (lokasiArsip: LokasiArsip) => {
        setSelectedLokasiArsip(lokasiArsip);
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
        if (!deleteLokasiArsip) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        router.delete(destroy({ lokasiArsip: deleteLokasiArsip.id }).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteLokasiArsip(null),
            onError: (errors) => {
                setDeleteError(
                    errors.lokasi_arsip || 'Lokasi arsip gagal dihapus.',
                );
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Lokasi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Lokasi Arsip"
                    description="Manajemen data lokasi penyimpanan fisik dokumen arsip."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Lokasi Arsip', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Lokasi
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Lokasi Arsip">
                        <StatValue value={stats.total_lokasi_arsip} />
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
                    title="Daftar Lokasi Arsip"
                    description="Data lokasi penyimpanan arsip yang tersedia"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama, gedung, ruangan, rak, box..."
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

                        {lokasiArsips.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada lokasi arsip ditemukan"
                                description="Tidak ada data lokasi arsip yang cocok dengan pencarian Anda."
                                icon={MapPin}
                            />
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[120px] font-semibold">
                                                    Kode
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Nama
                                                </TableHead>
                                                <TableHead className="w-[120px] font-semibold">
                                                    Gedung
                                                </TableHead>
                                                <TableHead className="w-[80px] font-semibold">
                                                    Lantai
                                                </TableHead>
                                                <TableHead className="w-[130px] font-semibold">
                                                    Ruangan
                                                </TableHead>
                                                <TableHead className="w-[120px] font-semibold">
                                                    Rak
                                                </TableHead>
                                                <TableHead className="w-[100px] font-semibold">
                                                    Box
                                                </TableHead>
                                                <TableHead className="w-[100px] font-semibold">
                                                    Status
                                                </TableHead>
                                                <TableHead className="w-[80px] text-right font-semibold">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {lokasiArsips.data.map(
                                                (lokasiArsip) => (
                                                    <TableRow
                                                        key={lokasiArsip.id}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                                                            {lokasiArsip.kode}
                                                        </TableCell>
                                                        <TableCell className="font-medium whitespace-nowrap">
                                                            {lokasiArsip.nama}
                                                        </TableCell>
                                                        <TableCell className="text-sm whitespace-nowrap">
                                                            {lokasiArsip.gedung ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-sm whitespace-nowrap">
                                                            {lokasiArsip.lantai ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-sm whitespace-nowrap">
                                                            {lokasiArsip.ruangan ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-sm whitespace-nowrap">
                                                            {lokasiArsip.rak ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                                                            {lokasiArsip.box ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge
                                                                variant={statusVariant(
                                                                    lokasiArsip.status,
                                                                )}
                                                                className="w-fit"
                                                            >
                                                                {statusLabel(
                                                                    lokasiArsip.status,
                                                                )}
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
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-40"
                                                                >
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            setDetailLokasiArsip(
                                                                                lokasiArsip,
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
                                                                                lokasiArsip,
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
                                                                            setDeleteLokasiArsip(
                                                                                lokasiArsip,
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
                                        Menampilkan {lokasiArsips.from || 0}{' '}
                                        hingga {lokasiArsips.to || 0} dari{' '}
                                        {lokasiArsips.total} lokasi
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                !lokasiArsips.prev_page_url
                                            }
                                            asChild={Boolean(
                                                lokasiArsips.prev_page_url,
                                            )}
                                        >
                                            {lokasiArsips.prev_page_url ? (
                                                <Link
                                                    href={
                                                        lokasiArsips.prev_page_url
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
                                                !lokasiArsips.next_page_url
                                            }
                                            asChild={Boolean(
                                                lokasiArsips.next_page_url,
                                            )}
                                        >
                                            {lokasiArsips.next_page_url ? (
                                                <Link
                                                    href={
                                                        lokasiArsips.next_page_url
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

            <LokasiArsipFormDialog
                open={formOpen}
                mode={formMode}
                lokasiArsip={selectedLokasiArsip}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                lokasiArsip={detailLokasiArsip}
                onOpenChange={(open) => !open && setDetailLokasiArsip(null)}
            />
            <ConfirmDialog
                isOpen={deleteLokasiArsip !== null}
                onClose={() => {
                    setDeleteError(null);
                    setDeleteLokasiArsip(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Lokasi Arsip"
                description={
                    deleteError ||
                    `Hapus lokasi arsip "${deleteLokasiArsip?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`
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

LokasiArsipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Lokasi Arsip', href: '/master/lokasi-arsip' },
    ],
};
