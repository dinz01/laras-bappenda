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
import { destroy, index, store, update } from '@/routes/master/klasifikasi-arsip';

type KlasifikasiArsip = {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string | null;
    retensi_aktif: number;
    retensi_inaktif: number;
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedKlasifikasiArsips = {
    data: KlasifikasiArsip[];
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
    total_klasifikasi_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    klasifikasiArsips: PaginatedKlasifikasiArsips;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type KlasifikasiArsipFormData = {
    kode: string;
    nama: string;
    deskripsi: string;
    retensi_aktif: number;
    retensi_inaktif: number;
    status: 'active' | 'inactive';
};

const emptyForm: KlasifikasiArsipFormData = {
    kode: '',
    nama: '',
    deskripsi: '',
    retensi_aktif: 0,
    retensi_inaktif: 0,
    status: 'active',
};

function statusVariant(status: KlasifikasiArsip['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: KlasifikasiArsip['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function KlasifikasiArsipFormDialog({
    open,
    mode,
    klasifikasiArsip,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    klasifikasiArsip: KlasifikasiArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<KlasifikasiArsipFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(klasifikasiArsip ? {
            kode: klasifikasiArsip.kode,
            nama: klasifikasiArsip.nama,
            deskripsi: klasifikasiArsip.deskripsi ?? '',
            retensi_aktif: klasifikasiArsip.retensi_aktif,
            retensi_inaktif: klasifikasiArsip.retensi_inaktif,
            status: klasifikasiArsip.status,
        } : emptyForm);
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, klasifikasiArsip]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && klasifikasiArsip) {
            form.put(update({ klasifikasiArsip: klasifikasiArsip.id }).url, {
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
                        {mode === 'create' ? 'Tambah Klasifikasi Arsip' : 'Edit Klasifikasi Arsip'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data klasifikasi arsip sesuai standar kearsipan yang berlaku.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode</Label>
                            <Input
                                id="kode"
                                value={form.data.kode}
                                onChange={(event) => form.setData('kode', event.target.value)}
                                placeholder="Contoh: KA-001"
                                maxLength={50}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value: KlasifikasiArsipFormData['status']) => form.setData('status', value)}
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Nonaktif</SelectItem>
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
                            onChange={(event) => form.setData('nama', event.target.value)}
                            placeholder="Nama klasifikasi arsip"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Input
                            id="deskripsi"
                            value={form.data.deskripsi}
                            onChange={(event) => form.setData('deskripsi', event.target.value)}
                            placeholder="Deskripsi klasifikasi arsip"
                        />
                        <InputError message={form.errors.deskripsi} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="retensi_aktif">Retensi Aktif (tahun)</Label>
                            <Input
                                id="retensi_aktif"
                                type="number"
                                min={0}
                                value={form.data.retensi_aktif}
                                onChange={(event) => form.setData('retensi_aktif', parseInt(event.target.value, 10) || 0)}
                                placeholder="0"
                            />
                            <InputError message={form.errors.retensi_aktif} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="retensi_inaktif">Retensi Inaktif (tahun)</Label>
                            <Input
                                id="retensi_inaktif"
                                type="number"
                                min={0}
                                value={form.data.retensi_inaktif}
                                onChange={(event) => form.setData('retensi_inaktif', parseInt(event.target.value, 10) || 0)}
                                placeholder="0"
                            />
                            <InputError message={form.errors.retensi_inaktif} />
                        </div>
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
    klasifikasiArsip,
    onOpenChange,
}: {
    klasifikasiArsip: KlasifikasiArsip | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={klasifikasiArsip !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Detail Klasifikasi Arsip</DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap klasifikasi arsip.
                    </DialogDescription>
                </DialogHeader>

                {klasifikasiArsip && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={klasifikasiArsip.kode} mono />
                        <DetailRow label="Nama" value={klasifikasiArsip.nama} />
                        <DetailRow label="Deskripsi" value={klasifikasiArsip.deskripsi || '-'} />
                        <DetailRow label="Retensi Aktif" value={`${klasifikasiArsip.retensi_aktif} tahun`} />
                        <DetailRow label="Retensi Inaktif" value={`${klasifikasiArsip.retensi_inaktif} tahun`} />
                        <DetailRow label="Dibuat Pada" value={klasifikasiArsip.created_at || '-'} />
                        <DetailRow label="Diperbarui Pada" value={klasifikasiArsip.updated_at || '-'} />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">Status</span>
                            <StatusBadge variant={statusVariant(klasifikasiArsip.status)}>
                                {statusLabel(klasifikasiArsip.status)}
                            </StatusBadge>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className={mono ? 'font-mono text-xs text-right' : 'font-medium text-right'}>
                {value}
            </span>
        </div>
    );
}

export default function KlasifikasiArsipIndex({
    klasifikasiArsips,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedKlasifikasiArsip, setSelectedKlasifikasiArsip] = useState<KlasifikasiArsip | null>(null);
    const [detailKlasifikasiArsip, setDetailKlasifikasiArsip] = useState<KlasifikasiArsip | null>(null);
    const [deleteKlasifikasiArsip, setDeleteKlasifikasiArsip] = useState<KlasifikasiArsip | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const updateFilters = (newParams: Record<string, string | null | undefined>) => {
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
        setSelectedKlasifikasiArsip(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (klasifikasiArsip: KlasifikasiArsip) => {
        setSelectedKlasifikasiArsip(klasifikasiArsip);
        setFormMode('edit');
        setFormOpen(true);
    };

    const clearFilters = () => {
        setSearch('');
        router.get(index().url, {}, {
            preserveState: true,
            replace: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteKlasifikasiArsip) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        router.delete(destroy({ klasifikasiArsip: deleteKlasifikasiArsip.id }).url, {
            preserveScroll: true,
            onSuccess: () => setDeleteKlasifikasiArsip(null),
            onError: (errors) => {
                setDeleteError(errors.klasifikasi_arsip || 'Klasifikasi arsip gagal dihapus.');
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Klasifikasi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Klasifikasi Arsip"
                    description="Manajemen kode klasifikasi arsip sesuai standar kearsipan."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Klasifikasi Arsip', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Klasifikasi
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Klasifikasi">
                        <StatValue value={stats.total_klasifikasi_arsip} />
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

                <ContentCard title="Daftar Klasifikasi Arsip" description="Data klasifikasi arsip berdasarkan standar kearsipan nasional">
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama, atau deskripsi..."
                            filters={hasFilters && (
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
                        />

                        {klasifikasiArsips.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada klasifikasi arsip ditemukan"
                                description="Tidak ada data klasifikasi arsip yang cocok dengan pencarian Anda."
                                icon={Archive}
                            />
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[130px] font-semibold">Kode</TableHead>
                                                <TableHead className="font-semibold">Nama</TableHead>
                                                <TableHead className="font-semibold">Deskripsi</TableHead>
                                                <TableHead className="w-[110px] text-center font-semibold">R. Aktif</TableHead>
                                                <TableHead className="w-[120px] text-center font-semibold">R. Inaktif</TableHead>
                                                <TableHead className="w-[110px] font-semibold">Status</TableHead>
                                                <TableHead className="w-[170px] font-semibold">Dibuat Pada</TableHead>
                                                <TableHead className="w-[80px] text-right font-semibold">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {klasifikasiArsips.data.map((klasifikasiArsip) => (
                                                <TableRow key={klasifikasiArsip.id} className="transition-colors hover:bg-muted/30">
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {klasifikasiArsip.kode}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {klasifikasiArsip.nama}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                        {klasifikasiArsip.deskripsi || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        {klasifikasiArsip.retensi_aktif} thn
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        {klasifikasiArsip.retensi_inaktif} thn
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge variant={statusVariant(klasifikasiArsip.status)} className="w-fit">
                                                            {statusLabel(klasifikasiArsip.status)}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {klasifikasiArsip.created_at || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <span className="sr-only">Menu aksi</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem
                                                                    onClick={() => setDetailKlasifikasiArsip(klasifikasiArsip)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    Detail
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => openEditDialog(klasifikasiArsip)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setDeleteError(null);
                                                                        setDeleteKlasifikasiArsip(klasifikasiArsip);
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
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Menampilkan {klasifikasiArsips.from || 0} hingga {klasifikasiArsips.to || 0} dari {klasifikasiArsips.total} klasifikasi
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!klasifikasiArsips.prev_page_url}
                                            asChild={Boolean(klasifikasiArsips.prev_page_url)}
                                        >
                                            {klasifikasiArsips.prev_page_url ? (
                                                <Link href={klasifikasiArsips.prev_page_url} preserveState>
                                                    Sebelumnya
                                                </Link>
                                            ) : (
                                                <span>Sebelumnya</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!klasifikasiArsips.next_page_url}
                                            asChild={Boolean(klasifikasiArsips.next_page_url)}
                                        >
                                            {klasifikasiArsips.next_page_url ? (
                                                <Link href={klasifikasiArsips.next_page_url} preserveState>
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

            <KlasifikasiArsipFormDialog
                open={formOpen}
                mode={formMode}
                klasifikasiArsip={selectedKlasifikasiArsip}
                onOpenChange={setFormOpen}
            />
            <DetailDialog klasifikasiArsip={detailKlasifikasiArsip} onOpenChange={(open) => !open && setDetailKlasifikasiArsip(null)} />
            <ConfirmDialog
                isOpen={deleteKlasifikasiArsip !== null}
                onClose={() => {
                    setDeleteError(null);
                    setDeleteKlasifikasiArsip(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Klasifikasi Arsip"
                description={deleteError || `Hapus klasifikasi arsip "${deleteKlasifikasiArsip?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
                confirmLabel="Hapus"
                loading={deleting}
                destructive
            />
        </>
    );
}

function StatValue({ value }: { value: number }) {
    return <div className="text-2xl font-semibold tracking-normal text-foreground">{value.toLocaleString('id-ID')}</div>;
}

KlasifikasiArsipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Klasifikasi Arsip', href: '/master/klasifikasi-arsip' },
    ],
};
