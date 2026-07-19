import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Building2,
    Eye,
    FileArchive,
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
import { destroy, index, store, update } from '@/routes/master/unit-organisasi';

type UnitOrganisasi = {
    id: number;
    kode: string;
    nama: string;
    singkatan: string | null;
    status: 'active' | 'inactive';
    jumlah_arsip: number;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedUnits = {
    data: UnitOrganisasi[];
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
    total_unit_organisasi: number;
    unit_memiliki_arsip: number;
    unit_tanpa_arsip: number;
    total_arsip: number;
};

type IndexProps = {
    unitOrganisasis: PaginatedUnits;
    stats: Stats;
    filters: {
        search?: string;
    };
};

type UnitFormData = {
    kode: string;
    nama: string;
    singkatan: string;
    status: 'active' | 'inactive';
};

const emptyForm: UnitFormData = {
    kode: '',
    nama: '',
    singkatan: '',
    status: 'active',
};

function statusVariant(status: UnitOrganisasi['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: UnitOrganisasi['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function UnitFormDialog({
    open,
    mode,
    unit,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    unit: UnitOrganisasi | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<UnitFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(unit ? {
            kode: unit.kode,
            nama: unit.nama,
            singkatan: unit.singkatan ?? '',
            status: unit.status,
        } : emptyForm);
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, unit]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && unit) {
            form.put(update({ unitOrganisasi: unit.id }).url, {
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
                        {mode === 'create' ? 'Tambah Unit Organisasi' : 'Edit Unit Organisasi'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data unit organisasi sesuai struktur instansi.
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
                                placeholder="Contoh: UO-001"
                                maxLength={30}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value: UnitFormData['status']) => form.setData('status', value)}
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
                        <Label htmlFor="nama">Nama Unit Organisasi</Label>
                        <Input
                            id="nama"
                            value={form.data.nama}
                            onChange={(event) => form.setData('nama', event.target.value)}
                            placeholder="Nama unit organisasi"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="singkatan">Singkatan</Label>
                        <Input
                            id="singkatan"
                            value={form.data.singkatan}
                            onChange={(event) => form.setData('singkatan', event.target.value)}
                            placeholder="Singkatan unit organisasi"
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
    unit,
    onOpenChange,
}: {
    unit: UnitOrganisasi | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={unit !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Detail Unit Organisasi</DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap unit organisasi dan pemakaian arsip.
                    </DialogDescription>
                </DialogHeader>

                {unit && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={unit.kode} mono />
                        <DetailRow label="Nama Unit Organisasi" value={unit.nama} />
                        <DetailRow label="Singkatan" value={unit.singkatan || '-'} />
                        <DetailRow label="Jumlah Arsip" value={`${unit.jumlah_arsip} arsip`} />
                        <DetailRow label="Dibuat Pada" value={unit.created_at || '-'} />
                        <DetailRow label="Diperbarui Pada" value={unit.updated_at || '-'} />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">Status</span>
                            <StatusBadge variant={statusVariant(unit.status)}>
                                {statusLabel(unit.status)}
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

export default function UnitOrganisasiIndex({
    unitOrganisasis,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedUnit, setSelectedUnit] = useState<UnitOrganisasi | null>(null);
    const [detailUnit, setDetailUnit] = useState<UnitOrganisasi | null>(null);
    const [deleteUnit, setDeleteUnit] = useState<UnitOrganisasi | null>(null);
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
        setSelectedUnit(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (unit: UnitOrganisasi) => {
        setSelectedUnit(unit);
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
        if (!deleteUnit) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        router.delete(destroy({ unitOrganisasi: deleteUnit.id }).url, {
            preserveScroll: true,
            onError: (errors) => {
                setDeleteError(errors.unit_organisasi || 'Unit organisasi gagal dihapus.');
            },
            onSuccess: () => setDeleteUnit(null),
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Unit Organisasi" />

            <PageContainer>
                <PageHeader
                    title="Unit Organisasi"
                    description="Manajemen data unit organisasi dalam struktur instansi."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Unit Organisasi', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Unit
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Unit Organisasi">
                        <StatValue value={stats.total_unit_organisasi} />
                    </ContentCard>
                    <ContentCard title="Unit yang Memiliki Arsip">
                        <StatValue value={stats.unit_memiliki_arsip} />
                    </ContentCard>
                    <ContentCard title="Unit Tanpa Arsip">
                        <StatValue value={stats.unit_tanpa_arsip} />
                    </ContentCard>
                    <ContentCard title="Total Arsip">
                        <StatValue value={stats.total_arsip} />
                    </ContentCard>
                </div>

                <ContentCard title="Daftar Unit Organisasi" description="Data unit organisasi yang tersedia untuk arsip">
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama, atau singkatan..."
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

                        {unitOrganisasis.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada unit organisasi ditemukan"
                                description="Tidak ada data unit organisasi yang cocok dengan pencarian Anda."
                                icon={Building2}
                            />
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[130px] font-semibold">Kode</TableHead>
                                                <TableHead className="font-semibold">Nama Unit Organisasi</TableHead>
                                                <TableHead className="font-semibold">Singkatan</TableHead>
                                                <TableHead className="w-[120px] font-semibold">Jumlah Arsip</TableHead>
                                                <TableHead className="w-[170px] font-semibold">Dibuat Pada</TableHead>
                                                <TableHead className="w-[80px] text-right font-semibold">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {unitOrganisasis.data.map((unit) => (
                                                <TableRow key={unit.id} className="transition-colors hover:bg-muted/30">
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {unit.kode}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium">{unit.nama}</span>
                                                            <StatusBadge variant={statusVariant(unit.status)} className="w-fit">
                                                                {statusLabel(unit.status)}
                                                            </StatusBadge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                                                        {unit.singkatan || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 text-xs font-medium">
                                                            <FileArchive className="h-3.5 w-3.5" />
                                                            {unit.jumlah_arsip}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {unit.created_at || '-'}
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
                                                                    onClick={() => setDetailUnit(unit)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    Detail
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => openEditDialog(unit)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setDeleteError(null);
                                                                        setDeleteUnit(unit);
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
                                        Menampilkan {unitOrganisasis.from || 0} hingga {unitOrganisasis.to || 0} dari {unitOrganisasis.total} unit
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!unitOrganisasis.prev_page_url}
                                            asChild={Boolean(unitOrganisasis.prev_page_url)}
                                        >
                                            {unitOrganisasis.prev_page_url ? (
                                                <Link href={unitOrganisasis.prev_page_url} preserveState>
                                                    Sebelumnya
                                                </Link>
                                            ) : (
                                                <span>Sebelumnya</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!unitOrganisasis.next_page_url}
                                            asChild={Boolean(unitOrganisasis.next_page_url)}
                                        >
                                            {unitOrganisasis.next_page_url ? (
                                                <Link href={unitOrganisasis.next_page_url} preserveState>
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

            <UnitFormDialog
                open={formOpen}
                mode={formMode}
                unit={selectedUnit}
                onOpenChange={setFormOpen}
            />
            <DetailDialog unit={detailUnit} onOpenChange={(open) => !open && setDetailUnit(null)} />
            <ConfirmDialog
                isOpen={deleteUnit !== null}
                onClose={() => {
                    setDeleteUnit(null);
                    setDeleteError(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Unit Organisasi"
                description={deleteError || `Hapus unit organisasi "${deleteUnit?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
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

UnitOrganisasiIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Unit Organisasi', href: '/master/unit-organisasi' },
    ],
};
