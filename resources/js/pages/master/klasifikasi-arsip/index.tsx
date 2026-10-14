import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    Eye,
    FolderTree,
    MoreHorizontal,
    Pencil,
    Plus,
    PlusCircle,
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
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Badge } from '@/components/ui/badge';
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
    destroy,
    index,
    store,
    update,
} from '@/routes/master/klasifikasi-arsip';

type NasibAkhirOption = {
    id: number;
    nama: string;
    status: 'active' | 'inactive';
};

type KlasifikasiArsip = {
    id: number;
    parent_id: number | null;
    parent?: {
        id: number;
        kode: string;
        nama: string;
    } | null;
    kode: string;
    nama: string;
    deskripsi: string | null;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    nasib_akhir_id: number | null;
    nasib_akhir?: {
        id: number;
        nama: string;
    } | null;
    depth: number;
    children_count: number;
    status: 'active' | 'inactive';
    created_at: string | null;
    updated_at: string | null;
};

type Stats = {
    total_klasifikasi_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type ParentOption = {
    id: number;
    kode: string;
    nama: string;
    parent_id: number | null;
};

type IndexProps = {
    klasifikasis: KlasifikasiArsip[];
    stats: Stats;
    filters: {
        search?: string;
    };
    nasibAkhirs: NasibAkhirOption[];
    parentOptions: ParentOption[];
};

type KlasifikasiArsipFormData = {
    parent_id: string;
    kode: string;
    nama: string;
    deskripsi: string;
    retensi_aktif: string;
    retensi_inaktif: string;
    nasib_akhir_id: string;
    status: 'active' | 'inactive';
};

const emptyForm: KlasifikasiArsipFormData = {
    parent_id: '',
    kode: '',
    nama: '',
    deskripsi: '',
    retensi_aktif: '',
    retensi_inaktif: '',
    nasib_akhir_id: '',
    status: 'active',
};

const INDENT_PX = 28;

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
    prefilledParentId,
    nasibAkhirs,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    klasifikasiArsip: KlasifikasiArsip | null;
    prefilledParentId?: string;
    nasibAkhirs: NasibAkhirOption[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<KlasifikasiArsipFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (klasifikasiArsip) {
            form.setData({
                parent_id: klasifikasiArsip.parent_id
                    ? String(klasifikasiArsip.parent_id)
                    : '',
                kode: klasifikasiArsip.kode,
                nama: klasifikasiArsip.nama,
                deskripsi: klasifikasiArsip.deskripsi ?? '',
                retensi_aktif:
                    klasifikasiArsip.retensi_aktif !== null
                        ? String(klasifikasiArsip.retensi_aktif)
                        : '',
                retensi_inaktif:
                    klasifikasiArsip.retensi_inaktif !== null
                        ? String(klasifikasiArsip.retensi_inaktif)
                        : '',
                nasib_akhir_id: klasifikasiArsip.nasib_akhir_id
                    ? String(klasifikasiArsip.nasib_akhir_id)
                    : '',
                status: klasifikasiArsip.status,
            });
        } else if (prefilledParentId) {
            form.setData({
                ...emptyForm,
                parent_id: prefilledParentId,
            });
        } else {
            form.setData(emptyForm);
        }

        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, klasifikasiArsip, prefilledParentId]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (form.data.nasib_akhir_id) {
            let hasError = false;
            if (!form.data.retensi_aktif.trim()) {
                form.setError(
                    'retensi_aktif',
                    'Retensi aktif wajib diisi jika nasib akhir dipilih.',
                );
                hasError = true;
            }
            if (!form.data.retensi_inaktif.trim()) {
                form.setError(
                    'retensi_inaktif',
                    'Retensi inaktif wajib diisi jika nasib akhir dipilih.',
                );
                hasError = true;
            }
            if (hasError) {
                toast.error('Kolom wajib belum lengkap.', {
                    description:
                        'Isi retensi aktif dan inaktif jika memilih nasib akhir.',
                });
                return;
            }
        }

        if (mode === 'edit' && klasifikasiArsip) {
            form.put(update({ klasifikasiArsip: klasifikasiArsip.id }).url, {
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
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create'
                            ? prefilledParentId
                                ? 'Tambah Sub Klasifikasi'
                                : 'Tambah Klasifikasi Arsip'
                            : 'Edit Klasifikasi Arsip'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {mode === 'create' && prefilledParentId
                            ? 'Lengkapi data sub-klasifikasi arsip.'
                            : 'Lengkapi data klasifikasi arsip daerah beserta aturan retensinya.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode Klasifikasi</Label>
                            <Input
                                id="kode"
                                value={form.data.kode}
                                onChange={(event) =>
                                    form.setData('kode', event.target.value)
                                }
                                placeholder="Contoh: 000.1.1"
                                maxLength={50}
                            />
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: KlasifikasiArsipFormData['status'],
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
                        <Label htmlFor="nama">Nama Klasifikasi</Label>
                        <Input
                            id="nama"
                            value={form.data.nama}
                            onChange={(event) =>
                                form.setData('nama', event.target.value)
                            }
                            placeholder="Nama klasifikasi arsip"
                            maxLength={255}
                        />
                        <InputError message={form.errors.nama} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <textarea
                            id="deskripsi"
                            value={form.data.deskripsi}
                            onChange={(event) =>
                                form.setData('deskripsi', event.target.value)
                            }
                            placeholder="Keterangan singkat klasifikasi..."
                            rows={2}
                            className="flex w-full resize-none rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        />
                        <InputError message={form.errors.deskripsi} />
                    </div>

                    <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3.5">
                        <h4 className="text-xs font-semibold tracking-wider text-foreground uppercase">
                            Aturan Retensi & Nasib Akhir Arsip
                        </h4>
                        <div className="space-y-1.5">
                            <Label htmlFor="nasib_akhir_id" className="text-xs">
                                Nasib Akhir
                            </Label>
                            <Select
                                value={form.data.nasib_akhir_id || '__none__'}
                                onValueChange={(val) => {
                                    const nextVal =
                                        val === '__none__' ? '' : val;
                                    form.setData((prev) => ({
                                        ...prev,
                                        nasib_akhir_id: nextVal,
                                        retensi_aktif: nextVal
                                            ? prev.retensi_aktif
                                            : '',
                                        retensi_inaktif: nextVal
                                            ? prev.retensi_inaktif
                                            : '',
                                    }));
                                }}
                            >
                                <SelectTrigger
                                    id="nasib_akhir_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih nasib akhir..." />
                                </SelectTrigger>
                                <SelectContent
                                    align="start"
                                    collisionPadding={16}
                                    className="max-h-[280px] w-[min(320px,calc(100vw-2rem))]"
                                >
                                    <SelectItem value="__none__">
                                        Pilih nasib akhir...
                                    </SelectItem>
                                    {nasibAkhirs.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                            className="whitespace-normal"
                                        >
                                            {item.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.nasib_akhir_id} />
                        </div>

                        {form.data.nasib_akhir_id && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="retensi_aktif"
                                        className="text-xs"
                                    >
                                        Retensi Aktif (Tahun){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="retensi_aktif"
                                        type="number"
                                        min={0}
                                        placeholder="Contoh: 2"
                                        value={form.data.retensi_aktif}
                                        onChange={(e) =>
                                            form.setData(
                                                'retensi_aktif',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.retensi_aktif}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="retensi_inaktif"
                                        className="text-xs"
                                    >
                                        Retensi Inaktif (Tahun){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="retensi_inaktif"
                                        type="number"
                                        min={0}
                                        placeholder="Contoh: 5"
                                        value={form.data.retensi_inaktif}
                                        onChange={(e) =>
                                            form.setData(
                                                'retensi_inaktif',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.retensi_inaktif}
                                    />
                                </div>
                            </div>
                        )}
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
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Klasifikasi Arsip
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap struktur klasifikasi dan aturan
                        retensi.
                    </DialogDescription>
                </DialogHeader>

                {klasifikasiArsip && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow
                            label="Kode Klasifikasi"
                            value={klasifikasiArsip.kode}
                            mono
                        />
                        <DetailRow
                            label="Nama Klasifikasi"
                            value={klasifikasiArsip.nama}
                        />
                        <DetailRow
                            label="Deskripsi"
                            value={klasifikasiArsip.deskripsi || '-'}
                        />
                        <DetailRow
                            label="Induk Klasifikasi"
                            value={
                                klasifikasiArsip.parent
                                    ? `${klasifikasiArsip.parent.kode} — ${klasifikasiArsip.parent.nama}`
                                    : '-'
                            }
                        />
                        <DetailRow
                            label="Retensi Aktif"
                            value={
                                klasifikasiArsip.retensi_aktif !== null
                                    ? `${klasifikasiArsip.retensi_aktif} Tahun`
                                    : '-'
                            }
                        />
                        <DetailRow
                            label="Retensi Inaktif"
                            value={
                                klasifikasiArsip.retensi_inaktif !== null
                                    ? `${klasifikasiArsip.retensi_inaktif} Tahun`
                                    : '-'
                            }
                        />
                        <DetailRow
                            label="Nasib Akhir"
                            value={
                                klasifikasiArsip.nasib_akhir
                                    ? klasifikasiArsip.nasib_akhir.nama
                                    : '-'
                            }
                        />
                        <DetailRow
                            label="Jumlah Turunan"
                            value={`${klasifikasiArsip.children_count} item`}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={klasifikasiArsip.created_at || '-'}
                        />
                        <DetailRow
                            label="Diperbarui Pada"
                            value={klasifikasiArsip.updated_at || '-'}
                        />
                        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(klasifikasiArsip.status)}
                            >
                                {statusLabel(klasifikasiArsip.status)}
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

function getNodeKey(node: KlasifikasiArsip): string {
    return String(node.id);
}

function getParentKey(node: KlasifikasiArsip): string | null {
    return node.parent_id !== null ? String(node.parent_id) : null;
}

export default function KlasifikasiArsipIndex({
    klasifikasis = [],
    stats,
    filters = {},
    nasibAkhirs = [],
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedKlasifikasi, setSelectedKlasifikasi] =
        useState<KlasifikasiArsip | null>(null);
    const [prefilledParentId, setPrefilledParentId] = useState<string>('');
    const [detailKlasifikasi, setDetailKlasifikasi] =
        useState<KlasifikasiArsip | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<KlasifikasiArsip | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(
        () => new Set<string>(),
    );

    const isSearching = (filters.search ?? '') !== '';

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const hasFilters = Boolean(filters.search);

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
        setSelectedKlasifikasi(null);
        setPrefilledParentId('');
        setFormMode('create');
        setFormOpen(true);
    };

    const openCreateSubKlasifikasiDialog = (parentItem: KlasifikasiArsip) => {
        setSelectedKlasifikasi(null);
        setPrefilledParentId(String(parentItem.id));
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (item: KlasifikasiArsip) => {
        setSelectedKlasifikasi(item);
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
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);

        router.delete(destroy({ klasifikasiArsip: deleteTarget.id }).url, {
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal menghapus data.', {
                    description: 'Terjadi kesalahan, silakan coba lagi.',
                });
            },
            onSuccess: () => {
                setDeleteTarget(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const nodeMap = new Map<string, KlasifikasiArsip>();
    const childrenMap = new Map<string, string[]>();

    for (const item of klasifikasis) {
        nodeMap.set(getNodeKey(item), item);

        const parentKey = getParentKey(item);

        if (parentKey !== null) {
            if (!childrenMap.has(parentKey)) {
                childrenMap.set(parentKey, []);
            }

            childrenMap.get(parentKey)!.push(getNodeKey(item));
        }
    }

    const visibleKlasifikasis: KlasifikasiArsip[] = [];

    if (isSearching) {
        visibleKlasifikasis.push(...klasifikasis);
    } else {
        const rootKeys = klasifikasis
            .filter((item) => item.parent_id === null)
            .map((item) => getNodeKey(item));

        const walk = (keys: string[]): void => {
            for (const key of keys) {
                const node = nodeMap.get(key);

                if (!node) {
                    continue;
                }

                visibleKlasifikasis.push(node);

                if (expandedIds.has(key)) {
                    const childKeys = childrenMap.get(key) ?? [];

                    walk(childKeys);
                }
            }
        };

        walk(rootKeys);
    }

    return (
        <RouteGuard permission="master-klasifikasi-arsip.view">
            <Head title="Klasifikasi & Retensi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Klasifikasi & Retensi Arsip"
                    description="Pengelolaan kode hirarki klasifikasi arsip daerah beserta aturan retensi aktif, inaktif, dan nasib akhirnya."
                    breadcrumb={[
                        { title: 'MASTER DATA' },
                        { title: 'Klasifikasi Arsip' },
                    ]}
                    actions={
                        <Can permission="master.create">
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Klasifikasi
                            </Button>
                        </Can>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <ContentCard title="Total Klasifikasi">
                        <StatValue value={stats.total_klasifikasi_arsip} />
                    </ContentCard>
                    <ContentCard title="Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>
                    <ContentCard title="Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Struktur Klasifikasi Arsip"
                    description="Kode hirarki klasifikasi arsip daerah beserta aturan retensi dan nasib akhirnya"
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

                        {visibleKlasifikasis.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada klasifikasi arsip ditemukan"
                                description="Tidak ada data klasifikasi arsip yang cocok dengan pencarian Anda."
                                icon={FolderTree}
                            />
                        ) : (
                            <div className="overflow-x-auto rounded-md border border-border/60">
                                <div className="min-w-[850px] divide-y divide-border/50">
                                    <div className="flex items-center gap-2 bg-muted/40 py-2.5 pr-4 pl-2">
                                        <span className="w-4 shrink-0" />
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span className="w-[100px] shrink-0 text-sm font-semibold">
                                                Kode
                                            </span>
                                            <span className="text-sm font-semibold">
                                                Nama Klasifikasi
                                            </span>
                                        </div>
                                        <span className="w-[110px] shrink-0 text-sm font-semibold">
                                            Retensi Aktif
                                        </span>
                                        <span className="w-[110px] shrink-0 text-sm font-semibold">
                                            Retensi Inaktif
                                        </span>
                                        <span className="w-[110px] shrink-0 text-sm font-semibold">
                                            Nasib Akhir
                                        </span>
                                        <span className="w-[90px] shrink-0 text-sm font-semibold">
                                            Status
                                        </span>
                                        <span className="w-7 shrink-0 text-right text-sm font-semibold">
                                            Aksi
                                        </span>
                                    </div>
                                    {visibleKlasifikasis.map((item) => {
                                        const key = getNodeKey(item);
                                        const hasChildren =
                                            childrenMap.get(key) !==
                                                undefined &&
                                            childrenMap.get(key)!.length > 0;
                                        const isExpanded = expandedIds.has(key);

                                        return (
                                            <div
                                                key={key}
                                                className="flex items-center gap-2 py-2.5 pr-4 transition-colors hover:bg-muted/30"
                                                style={{
                                                    paddingLeft: `${8 + item.depth * INDENT_PX}px`,
                                                }}
                                            >
                                                <div className="flex w-4 shrink-0 items-center justify-center">
                                                    {hasChildren ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleExpand(
                                                                    key,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center justify-center rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            aria-label={
                                                                isExpanded
                                                                    ? 'Ciutkan'
                                                                    : 'Perluas'
                                                            }
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="inline-block w-4" />
                                                    )}
                                                </div>

                                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                                    <span className="w-[100px] shrink-0 font-mono text-xs text-muted-foreground">
                                                        {item.kode}
                                                    </span>
                                                    <span className="truncate text-sm font-medium">
                                                        {item.nama}
                                                    </span>
                                                </div>

                                                <div className="w-[110px] shrink-0 text-xs">
                                                    {item.retensi_aktif !==
                                                    null ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono"
                                                        >
                                                            {item.retensi_aktif}{' '}
                                                            Thn
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground/60">
                                                            -
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="w-[110px] shrink-0 text-xs">
                                                    {item.retensi_inaktif !==
                                                    null ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono"
                                                        >
                                                            {
                                                                item.retensi_inaktif
                                                            }{' '}
                                                            Thn
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground/60">
                                                            -
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="w-[110px] shrink-0">
                                                    {item.nasib_akhir ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[11px] font-medium"
                                                        >
                                                            {
                                                                item.nasib_akhir
                                                                    .nama
                                                            }
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/60">
                                                            -
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="w-[90px] shrink-0">
                                                    <StatusBadge
                                                        variant={statusVariant(
                                                            item.status,
                                                        )}
                                                        className="w-fit"
                                                    >
                                                        {statusLabel(
                                                            item.status,
                                                        )}
                                                    </StatusBadge>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 shrink-0"
                                                        >
                                                            <span className="sr-only">
                                                                Menu aksi
                                                            </span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-44"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDetailKlasifikasi(
                                                                    item,
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
                                                                        item,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center gap-2"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </Can>
                                                        {item.depth < 2 && (
                                                            <Can permission="master.create">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        openCreateSubKlasifikasiDialog(
                                                                            item,
                                                                        )
                                                                    }
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <PlusCircle className="h-4 w-4" />
                                                                    Tambah Sub
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </Can>
                                                        )}
                                                        <Can permission="master.delete">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setDeleteTarget(
                                                                        item,
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
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <KlasifikasiArsipFormDialog
                open={formOpen}
                mode={formMode}
                klasifikasiArsip={selectedKlasifikasi}
                prefilledParentId={prefilledParentId}
                nasibAkhirs={nasibAkhirs}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                klasifikasiArsip={detailKlasifikasi}
                onOpenChange={(open) => !open && setDetailKlasifikasi(null)}
            />
            <ConfirmDialog
                isOpen={deleteTarget !== null}
                onClose={() => {
                    setDeleteTarget(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Klasifikasi Arsip"
                description={`Hapus klasifikasi arsip "${deleteTarget?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.${deleteTarget && childrenMap.get(getNodeKey(deleteTarget))?.length ? ' Klasifikasi ini memiliki turunan yang juga akan ikut terhapus.' : ''}`}
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

KlasifikasiArsipIndex.layout = {
    breadcrumbs: [
        { title: 'MASTER DATA' },
        { title: 'Klasifikasi Arsip', href: '/master/klasifikasi-arsip' },
    ],
};
