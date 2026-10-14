import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    Eye,
    MapPin,
    MoreHorizontal,
    Pencil,
    Plus,
    PlusCircle,
    Trash2,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
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
import { destroy, index, store, update } from '@/routes/master/lokasi-arsip';

type LokasiArsipItem = {
    id: number;
    parent_id: number | null;
    kode: string;
    nama: string;
    gedung: string | null;
    lantai: string | null;
    ruangan: string | null;
    rak: string | null;
    box: string | null;
    keterangan: string | null;
    status: 'active' | 'inactive';
    depth: number;
    has_children: boolean;
    created_at: string | null;
    updated_at: string | null;
};

type ParentOption = {
    id: number;
    kode: string;
    nama: string;
    parent_id: number | null;
    gedung?: string | null;
    lantai?: string | null;
    ruangan?: string | null;
    rak?: string | null;
    box?: string | null;
};

type Stats = {
    total_lokasi_arsip: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type IndexProps = {
    lokasis: LokasiArsipItem[];
    parentOptions: ParentOption[];
    stats: Stats;
    filters: {
        search?: string;
    };
};

type LokasiArsipFormData = {
    parent_id: string;
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
    parent_id: '',
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

const INDENT_PX = 24;

function getLevelInfo(depth: number): {
    typeName: string;
    subTypeName: string | null;
    placeholder: string;
    badgeVariant: 'default' | 'secondary' | 'outline';
} {
    switch (depth) {
        case 0:
            return {
                typeName: 'Gedung',
                subTypeName: 'Lantai',
                placeholder: 'Contoh: GEDUNG UTAMA BAPPENDA',
                badgeVariant: 'default',
            };
        case 1:
            return {
                typeName: 'Lantai',
                subTypeName: 'Ruangan',
                placeholder: 'Contoh: LANTAI 1',
                badgeVariant: 'secondary',
            };
        case 2:
            return {
                typeName: 'Ruangan',
                subTypeName: 'Rak',
                placeholder: 'Contoh: RUANG ARSIP INAKTIF 101',
                badgeVariant: 'outline',
            };
        case 3:
            return {
                typeName: 'Rak',
                subTypeName: 'Box',
                placeholder: 'Contoh: RAK A-01',
                badgeVariant: 'outline',
            };
        case 4:
        default:
            return {
                typeName: 'Box',
                subTypeName: null,
                placeholder: 'Contoh: BOX 001',
                badgeVariant: 'outline',
            };
    }
}

function statusVariant(status: LokasiArsipItem['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: LokasiArsipItem['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function StatValue({ value }: { value: number }) {
    return (
        <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
        </span>
    );
}

function LokasiArsipFormDialog({
    open,
    mode,
    lokasiArsip,
    defaultParentId,
    allLokasis,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    lokasiArsip: LokasiArsipItem | null;
    defaultParentId: number | null;
    allLokasis: LokasiArsipItem[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<LokasiArsipFormData>(emptyForm);

    const parentNode = useMemo(() => {
        const pId = mode === 'edit' ? lokasiArsip?.parent_id : defaultParentId;

        return pId ? allLokasis.find((l) => l.id === pId) : null;
    }, [mode, lokasiArsip, defaultParentId, allLokasis]);

    const targetDepth = useMemo(() => {
        if (mode === 'edit' && lokasiArsip) {
            return lokasiArsip.depth;
        }

        return parentNode ? parentNode.depth + 1 : 0;
    }, [mode, lokasiArsip, parentNode]);

    const levelInfo = getLevelInfo(targetDepth);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (mode === 'edit' && lokasiArsip) {
            form.setData({
                parent_id: lokasiArsip.parent_id
                    ? lokasiArsip.parent_id.toString()
                    : '',
                kode: lokasiArsip.kode,
                nama: lokasiArsip.nama,
                gedung: lokasiArsip.gedung ?? '',
                lantai: lokasiArsip.lantai ?? '',
                ruangan: lokasiArsip.ruangan ?? '',
                rak: lokasiArsip.rak ?? '',
                box: lokasiArsip.box ?? '',
                keterangan: lokasiArsip.keterangan ?? '',
                status: lokasiArsip.status,
            });
        } else {
            form.setData({
                ...emptyForm,
                parent_id: defaultParentId ? defaultParentId.toString() : '',
            });
        }

        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, lokasiArsip, mode, defaultParentId]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        let gedungVal = form.data.gedung;
        let lantaiVal = form.data.lantai;
        let ruanganVal = form.data.ruangan;
        let rakVal = form.data.rak;
        let boxVal = form.data.box;

        if (targetDepth === 0) {
            gedungVal = form.data.nama;
        } else if (targetDepth === 1) {
            lantaiVal = form.data.nama;

            if (parentNode) {
                gedungVal = parentNode.gedung || parentNode.nama;
            }
        } else if (targetDepth === 2) {
            ruanganVal = form.data.nama;

            if (parentNode) {
                lantaiVal = parentNode.lantai || parentNode.nama;
                gedungVal = parentNode.gedung || '';
            }
        } else if (targetDepth === 3) {
            rakVal = form.data.nama;

            if (parentNode) {
                ruanganVal = parentNode.ruangan || parentNode.nama;
                lantaiVal = parentNode.lantai || '';
                gedungVal = parentNode.gedung || '';
            }
        } else if (targetDepth >= 4) {
            boxVal = form.data.nama;

            if (parentNode) {
                rakVal = parentNode.rak || parentNode.nama;
                ruanganVal = parentNode.ruangan || '';
                lantaiVal = parentNode.lantai || '';
                gedungVal = parentNode.gedung || '';
            }
        }

        const payload = {
            ...form.data,
            gedung: gedungVal,
            lantai: lantaiVal,
            ruangan: ruanganVal,
            rak: rakVal,
            box: boxVal,
        };

        if (mode === 'edit' && lokasiArsip) {
            router.put(update({ lokasiArsip: lokasiArsip.id }).url, payload, {
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

        router.post(store().url, payload, {
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
                            ? `Tambah ${levelInfo.typeName}`
                            : `Edit ${levelInfo.typeName}`}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Lengkapi data lokasi penyimpanan fisik (
                        {levelInfo.typeName}).
                    </DialogDescription>
                </DialogHeader>

                {parentNode && (
                    <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                            Lokasi Utama:
                        </span>{' '}
                        <span className="font-mono text-muted-foreground">
                            {parentNode.kode}
                        </span>{' '}
                        — {parentNode.nama}
                    </div>
                )}

                <form onSubmit={submit} noValidate className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="kode">Kode Lokasi</Label>
                            <div>
                                <Input
                                    id="kode"
                                    value="[Otomatis dibuat oleh sistem]"
                                    disabled
                                    className="cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground"
                                />
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {mode === 'edit'
                                        ? 'Kode lokasi bersifat tetap dan tidak dapat diubah.'
                                        : 'Nomor unik akan digenerate otomatis saat disimpan.'}
                                </p>
                            </div>
                            <InputError message={form.errors.kode} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Status{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: LokasiArsipFormData['status'],
                                ) => form.setData('status', value)}
                            >
                                <SelectTrigger
                                    id="status"
                                    className="w-full border-border/60"
                                >
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
                        <Label htmlFor="nama">
                            Nama {levelInfo.typeName}{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="nama"
                            value={form.data.nama}
                            onChange={(event) =>
                                form.setData('nama', event.target.value)
                            }
                            placeholder={levelInfo.placeholder}
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
                            placeholder="Keterangan tambahan lokasi (opsional)"
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
    lokasiArsip: LokasiArsipItem | null;
    onOpenChange: (open: boolean) => void;
}) {
    const levelInfo = lokasiArsip ? getLevelInfo(lokasiArsip.depth) : null;

    return (
        <Dialog open={lokasiArsip !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Lokasi Arsip
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap lokasi penyimpanan arsip.
                    </DialogDescription>
                </DialogHeader>

                {lokasiArsip && levelInfo && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow
                            label="Tipe Lokasi"
                            value={levelInfo.typeName}
                        />
                        <DetailRow label="Kode" value={lokasiArsip.kode} mono />
                        <DetailRow
                            label="Nama Lokasi"
                            value={lokasiArsip.nama}
                        />
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
    lokasis,
    stats,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedLokasiArsip, setSelectedLokasiArsip] =
        useState<LokasiArsipItem | null>(null);
    const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
    const [detailLokasiArsip, setDetailLokasiArsip] =
        useState<LokasiArsipItem | null>(null);
    const [deleteLokasiArsip, setDeleteLokasiArsip] =
        useState<LokasiArsipItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Tree hierarchy collapse/expand map
    const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

    // Map children for tree expansion
    const childrenMap = useMemo(() => {
        const map = new Map<number | null, LokasiArsipItem[]>();

        for (const item of lokasis) {
            const pId = item.parent_id;

            if (!map.has(pId)) {
                map.set(pId, []);
            }

            map.get(pId)!.push(item);
        }

        return map;
    }, [lokasis]);

    const toggleExpand = (id: number) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    // Calculate ordered visible tree list (matching KlasifikasiArsip)
    const visibleLokasis = useMemo(() => {
        if (search.trim() !== '') {
            return lokasis;
        }

        const result: LokasiArsipItem[] = [];

        const walk = (parentId: number | null) => {
            const children = childrenMap.get(parentId) ?? [];

            for (const item of children) {
                result.push(item);

                if (!collapsedIds.has(item.id)) {
                    walk(item.id);
                }
            }
        };

        walk(null);

        return result;
    }, [lokasis, childrenMap, collapsedIds, search]);

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

    const openCreateDialog = (parentId: number | null = null) => {
        setSelectedLokasiArsip(null);
        setDefaultParentId(parentId);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (lokasiArsip: LokasiArsipItem) => {
        setSelectedLokasiArsip(lokasiArsip);
        setDefaultParentId(null);
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

        router.delete(destroy({ lokasiArsip: deleteLokasiArsip.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteLokasiArsip(null);
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
        <RouteGuard permission="master-lokasi-arsip.view">
            <Head title="Lokasi Arsip" />

            <PageContainer>
                <PageHeader
                    title="Lokasi Arsip"
                    description="Manajemen struktur hierarki lokasi penyimpanan fisik dokumen arsip."
                    breadcrumb={[
                        { title: 'MASTER DATA' },
                        { title: 'Lokasi Arsip' },
                    ]}
                    actions={
                        <Can permission="master.create">
                            <Button
                                size="sm"
                                onClick={() => openCreateDialog(null)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Gedung
                            </Button>
                        </Can>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <ContentCard title="Total Lokasi Arsip">
                        <StatValue value={stats.total_lokasi_arsip} />
                    </ContentCard>
                    <ContentCard title="Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>
                    <ContentCard title="Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Struktur Lokasi Arsip"
                    description="Hirarki fisik: Gedung → Lantai → Ruangan → Rak → Box"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari kode atau nama lokasi..."
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

                        {lokasis.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada lokasi arsip ditemukan"
                                description="Tidak ada data lokasi arsip yang cocok dengan pencarian Anda."
                                icon={MapPin}
                            />
                        ) : (
                            <div className="overflow-x-auto rounded-md border border-border/60">
                                <div className="min-w-[800px] divide-y divide-border/50">
                                    <div className="flex items-center gap-2 bg-muted/40 py-2.5 pr-4 pl-2 text-xs font-semibold">
                                        <span className="w-4 shrink-0" />
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span className="w-[110px] shrink-0 text-sm font-semibold">
                                                Kode
                                            </span>
                                            <span className="text-sm font-semibold">
                                                Nama Lokasi
                                            </span>
                                        </div>
                                        <span className="w-[100px] shrink-0 text-sm font-semibold">
                                            Tipe
                                        </span>
                                        <span className="w-[180px] shrink-0 text-sm font-semibold">
                                            Keterangan
                                        </span>
                                        <span className="w-[90px] shrink-0 text-sm font-semibold">
                                            Status
                                        </span>
                                        <span className="w-7 shrink-0 text-right text-sm font-semibold">
                                            Aksi
                                        </span>
                                    </div>
                                    {visibleLokasis.map((item) => {
                                        const children =
                                            childrenMap.get(item.id) ?? [];
                                        const hasChildren = children.length > 0;
                                        const isExpanded = !collapsedIds.has(
                                            item.id,
                                        );
                                        const levelInfo = getLevelInfo(
                                            item.depth,
                                        );

                                        return (
                                            <div
                                                key={item.id}
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
                                                                    item.id,
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
                                                    <span className="w-[110px] shrink-0 font-mono text-xs text-muted-foreground">
                                                        {item.kode}
                                                    </span>
                                                    <span className="truncate text-sm font-medium">
                                                        {item.nama}
                                                    </span>
                                                </div>

                                                <div className="w-[100px] shrink-0">
                                                    <Badge
                                                        variant={
                                                            levelInfo.badgeVariant
                                                        }
                                                        className="text-xs font-medium"
                                                    >
                                                        {levelInfo.typeName}
                                                    </Badge>
                                                </div>

                                                <div
                                                    className="w-[180px] shrink-0 truncate text-sm text-muted-foreground"
                                                    title={
                                                        item.keterangan || ''
                                                    }
                                                >
                                                    {item.keterangan || '-'}
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

                                                <div className="w-7 shrink-0 text-right">
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
                                                                    Menu aksi
                                                                </span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-48"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setDetailLokasiArsip(
                                                                        item,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center gap-2"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                Detail
                                                            </DropdownMenuItem>

                                                            {levelInfo.subTypeName !==
                                                                null && (
                                                                <Can permission="master.create">
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openCreateDialog(
                                                                                item.id,
                                                                            )
                                                                        }
                                                                        className="flex cursor-pointer items-center gap-2"
                                                                    >
                                                                        <PlusCircle className="h-4 w-4" />
                                                                        Tambah{' '}
                                                                        {
                                                                            levelInfo.subTypeName
                                                                        }
                                                                    </DropdownMenuItem>
                                                                </Can>
                                                            )}

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

                                                            <Can permission="master.delete">
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setDeleteLokasiArsip(
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
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </ContentCard>

                <LokasiArsipFormDialog
                    open={formOpen}
                    mode={formMode}
                    lokasiArsip={selectedLokasiArsip}
                    defaultParentId={defaultParentId}
                    allLokasis={lokasis}
                    onOpenChange={setFormOpen}
                />

                <DetailDialog
                    lokasiArsip={detailLokasiArsip}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDetailLokasiArsip(null);
                        }
                    }}
                />

                <ConfirmDialog
                    isOpen={deleteLokasiArsip !== null}
                    onClose={() => {
                        setDeleteLokasiArsip(null);
                    }}
                    title="Hapus Lokasi Arsip"
                    description={
                        deleteLokasiArsip
                            ? `Apakah Anda yakin ingin menghapus lokasi "${deleteLokasiArsip.nama}"?`
                            : ''
                    }
                    confirmLabel="Hapus"
                    destructive
                    loading={deleting}
                    onConfirm={confirmDelete}
                />
            </PageContainer>
        </RouteGuard>
    );
}
