import { Head, Link, router, useForm } from '@inertiajs/react';
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
import { destroy, index, store, update } from '@/routes/master/jabatan';

type Jabatan = {
    id: number;
    kode: string;
    nama: string;
    singkatan: string | null;
    level: number;
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
    level: string;
    status: 'active' | 'inactive';
};

const emptyForm: JabatanFormData = {
    kode: '',
    nama: '',
    singkatan: '',
    level: '',
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

        form.setData(jabatan ? {
            kode: jabatan.kode,
            nama: jabatan.nama,
            singkatan: jabatan.singkatan ?? '',
            level: jabatan.level.toString(),
            status: jabatan.status,
        } : emptyForm);
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, jabatan]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && jabatan) {
            form.put(update({ jabatan: jabatan.id }).url, {
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
                        {mode === 'create' ? 'Tambah Jabatan' : 'Edit Jabatan'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data jabatan sesuai struktur organisasi.
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
                                placeholder="Contoh: JB-001"
                                maxLength={50}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value: JabatanFormData['status']) => form.setData('status', value)}
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
                        <Label htmlFor="nama">Nama Jabatan</Label>
                        <Input
                            id="nama"
                            value={form.data.nama}
                            onChange={(event) => form.setData('nama', event.target.value)}
                            placeholder="Nama jabatan"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                   <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="singkatan">Singkatan</Label>
                            <Input
                                id="singkatan"
                                value={form.data.singkatan}
                                onChange={(e) => form.setData('singkatan', e.target.value)}
                                placeholder="Contoh: KABID"
                                maxLength={50}
                            />
                            <InputError message={form.errors.singkatan} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="level">Level</Label>
                            <Input
                                id="level"
                                type="number"
                                min={0}
                                value={form.data.level}
                                onChange={(e) => form.setData('level', e.target.value)}
                                placeholder="0"
                            />
                            <InputError message={form.errors.level} />
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
                    <DialogTitle className="text-base font-semibold">Detail Jabatan</DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap jabatan dan pemakaian arsip.
                    </DialogDescription>
                </DialogHeader>

                {jabatan && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={jabatan.kode} mono />
                        <DetailRow label="Nama Jabatan" value={jabatan.nama} />
                        <DetailRow label="Singkatan" value={jabatan.singkatan || '-'} />
                        <DetailRow label="Level" value={jabatan.level.toString()} />
                        <DetailRow label="Dibuat Pada" value={jabatan.created_at || '-'} />
                        <DetailRow label="Diperbarui Pada" value={jabatan.updated_at || '-'} />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">Status</span>
                            <StatusBadge variant={statusVariant(jabatan.status)}>
                                {statusLabel(jabatan.status)}
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

export default function JabatanIndex({
    jabatans,
    stats,
    filters = {},
}: IndexProps){
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedJabatan, setSelectedJabatan] = useState<Jabatan | null>(null);
    const [detailJabatan, setDetailJabatan] = useState<Jabatan | null>(null);
    const [deleteJabatan, setDeleteJabatan] = useState<Jabatan | null>(null);
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
        router.get(index().url, {}, {
            preserveState: true,
            replace: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteJabatan) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        router.delete(destroy({ jabatan: deleteJabatan.id }).url, {
            preserveScroll: true,
            onError: (errors) => {
                setDeleteError(errors.jabatan || 'Jabatan gagal dihapus.');
            },
            onSuccess: () => setDeleteJabatan(null),
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search);

    return (
        <>
            <Head title="Jabatan" />

            <PageContainer>
                <PageHeader
                    title="Jabatan"
                    description="Manajemen data jabatan dalam struktur organisasi."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Master Data', href: '#' },
                        { title: 'Jabatan', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Jabatan
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Jabatan">
                        <StatValue value={stats.total_jabatan} />
                    </ContentCard>
                    <ContentCard title="Jabatan Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>

                    <ContentCard title="Jabatan Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>

                    <ContentCard title="Dibuat Bulan Ini">
                        <StatValue value={stats.bulan_ini} />
                    </ContentCard>
                    </div>

                <ContentCard title="Daftar Jabatan" description="Data jabatan yang tersedia dalam struktur organisasi">
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode, nama jabatan, atau singkatan..."
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

                        {jabatans.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada jabatan ditemukan"
                                description="Tidak ada data jabatan yang cocok dengan pencarian Anda."
                                icon={BriefcaseBusiness}
                            />
                        ) : (
                            <>
                                <div className="overflow-hidden rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[130px] font-semibold">Kode</TableHead>
                                                <TableHead className="font-semibold">Nama Jabatan</TableHead>
                                                <TableHead className="font-semibold">Singkatan</TableHead>
                                                <TableHead className="w-[120px] font-semibold">Level</TableHead>
                                                <TableHead className="w-[110px] font-semibold">Status</TableHead>
                                                <TableHead className="w-[170px] font-semibold">Dibuat Pada</TableHead>
                                                <TableHead className="w-[80px] text-right font-semibold">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {jabatans.data.map((jabatan) => (
                                                <TableRow key={jabatan.id} className="transition-colors hover:bg-muted/30">
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {jabatan.kode}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {jabatan.nama}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {jabatan.singkatan || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">{jabatan.level}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge variant={statusVariant(jabatan.status)} className="w-fit">
                                                            {statusLabel(jabatan.status)}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {jabatan.created_at || '-'}
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
                                                                    onClick={() => setDetailJabatan(jabatan)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    Detail
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => openEditDialog(jabatan)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setDeleteError(null);
                                                                        setDeleteJabatan(jabatan);
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
                                        Menampilkan {jabatans.from || 0} hingga {jabatans.to || 0} dari {jabatans.total} jabatan
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!jabatans.prev_page_url}
                                            asChild={Boolean(jabatans.prev_page_url)}
                                        >
                                            {jabatans.prev_page_url ? (
                                                <Link href={jabatans.prev_page_url} preserveState>
                                                    Sebelumnya
                                                </Link>
                                            ) : (
                                                <span>Sebelumnya</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!jabatans.next_page_url}
                                            asChild={Boolean(jabatans.next_page_url)}
                                        >
                                            {jabatans.next_page_url ? (
                                                <Link href={jabatans.next_page_url} preserveState>
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

            <JabatanFormDialog
                open={formOpen}
                mode={formMode}
                jabatan={selectedJabatan}
                onOpenChange={setFormOpen}
            />
            <DetailDialog jabatan={detailJabatan} onOpenChange={(open) => !open && setDetailJabatan(null)} />
            <ConfirmDialog
                isOpen={deleteJabatan !== null}
                onClose={() => {
                    setDeleteJabatan(null);
                    setDeleteError(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Jabatan"
                description={deleteError || `Hapus jabatan "${deleteJabatan?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.`}
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

JabatanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Jabatan', href: '/master/jabatan' },
    ],
};
