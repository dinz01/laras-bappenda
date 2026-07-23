import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    ChevronRight,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    PlusCircle,
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
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/master/unit-organisasi';

type Unit = {
    id: number;
    kode: string;
    nama: string;
    singkatan: string | null;
    parent_id: number | null;
    status: 'active' | 'inactive';
    depth: number;
    children_count: number;
    created_at: string | null;
    updated_at: string | null;
};

type Stats = {
    total_unit_organisasi: number;
    aktif: number;
    nonaktif: number;
    dibuat_bulan_ini: number;
};

type ParentOption = {
    id: number;
    nama: string;
};

type IndexProps = {
    units: Unit[];
    stats: Stats;
    filters: {
        search?: string;
    };
    parentOptions: ParentOption[];
};

type UnitFormData = {
    kode: string;
    nama: string;
    singkatan: string;
    parent_id: string;
    status: 'active' | 'inactive';
};

const emptyForm: UnitFormData = {
    kode: '',
    nama: '',
    singkatan: '',
    parent_id: '',
    status: 'active',
};

const INDENT_PX = 28;

function statusVariant(status: Unit['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: Unit['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function UnitFormDialog({
    open,
    mode,
    unit,
    parentOptions = [],
    prefilledParentId,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    unit: Unit | null;
    parentOptions: ParentOption[];
    prefilledParentId?: string;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<UnitFormData>(emptyForm);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (unit) {
            form.setData({
                kode: unit.kode,
                nama: unit.nama,
                singkatan: unit.singkatan ?? '',
                parent_id: unit.parent_id !== null ? String(unit.parent_id) : '',
                status: unit.status,
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
    }, [open, unit, prefilledParentId]);

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
                            placeholder="Singkatan unit"
                            maxLength={50}
                        />
                        <InputError message={form.errors.singkatan} />
                    </div>

                    {mode === 'create' && !prefilledParentId && (
                        <div className="space-y-2">
                            <Label htmlFor="parent_id">Parent Unit</Label>
                            <Select
                                value={form.data.parent_id}
                                onValueChange={(value) => form.setData('parent_id', value)}
                            >
                                <SelectTrigger id="parent_id" className="w-full">
                                    <SelectValue placeholder="Tidak Ada (Root)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tidak Ada (Root)</SelectItem>
                                    {parentOptions.map((opt) => (
                                        <SelectItem key={opt.id} value={String(opt.id)}>
                                            {opt.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.parent_id} />
                        </div>
                    )}

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
    parentOptions,
    onOpenChange,
}: {
    unit: Unit | null;
    parentOptions: ParentOption[];
    onOpenChange: (open: boolean) => void;
}) {
    const parentName =
        unit && unit.parent_id !== null
            ? parentOptions.find((o) => o.id === unit.parent_id)?.nama ?? `Unit #${unit.parent_id}`
            : '-';

    return (
        <Dialog open={unit !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Detail Unit Organisasi</DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap unit organisasi dan struktur hierarki.
                    </DialogDescription>
                </DialogHeader>

                {unit && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Kode" value={unit.kode} mono />
                        <DetailRow label="Nama Unit Organisasi" value={unit.nama} />
                        <DetailRow label="Singkatan" value={unit.singkatan || '-'} />
                        <DetailRow label="Parent Unit" value={parentName} />
                        <DetailRow label="Jumlah Turunan" value={`${unit.children_count} unit`} />
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

function getNodeKey(node: Unit): string {
    return String(node.id);
}

function getParentKey(node: Unit): string | null {
    return node.parent_id !== null ? String(node.parent_id) : null;
}

function buildTree(units: Unit[]): Unit[] {
    const nodeMap = new Map<string, Unit & { _childrenKeys: string[] }>();

    for (const u of units) {
        nodeMap.set(getNodeKey(u), { ...u, _childrenKeys: [] });
    }

    for (const node of nodeMap.values()) {
        const parentKey = getParentKey(node);

        if (parentKey !== null && nodeMap.has(parentKey)) {
            nodeMap.get(parentKey)!._childrenKeys.push(getNodeKey(node));
        }
    }

    return units;
}

export default function UnitOrganisasiIndex({
    units,
    stats,
    filters = {},
    parentOptions = [],
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [prefilledParentId, setPrefilledParentId] = useState<string>('');
    const [detailUnit, setDetailUnit] = useState<Unit | null>(null);
    const [deleteUnit, setDeleteUnit] = useState<Unit | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
        const set = new Set<string>();

        for (const u of units) {
            if (u.depth === 0) {
                set.add(getNodeKey(u));
            }
        }

        return set;
    });

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
        setPrefilledParentId('');
        setFormMode('create');
        setFormOpen(true);
    };

    const openCreateSubUnitDialog = (parentUnit: Unit) => {
        setSelectedUnit(null);
        setPrefilledParentId(String(parentUnit.id));
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (unit: Unit) => {
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

    buildTree(units);

    const nodeMap = new Map<string, Unit>();
    const childrenMap = new Map<string, string[]>();

    for (const u of units) {
        nodeMap.set(getNodeKey(u), u);

        const parentKey = getParentKey(u);

        if (parentKey !== null) {
            if (!childrenMap.has(parentKey)) {
                childrenMap.set(parentKey, []);
            }

            childrenMap.get(parentKey)!.push(getNodeKey(u));
        }
    }

    const visibleUnits: Unit[] = [];

    if (isSearching) {
        visibleUnits.push(...units);
    } else {
        const rootKeys = units
            .filter((u) => u.parent_id === null)
            .map((u) => getNodeKey(u));

        const walk = (keys: string[]): void => {
            for (const key of keys) {
                const node = nodeMap.get(key);

                if (!node) {
                    continue;
                }

                visibleUnits.push(node);

                if (expandedIds.has(key)) {
                    const childKeys = childrenMap.get(key) ?? [];

                    walk(childKeys);
                }
            }
        };

        walk(rootKeys);
    }

    return (
        <>
            <Head title="Unit Organisasi" />

            <PageContainer>
                <PageHeader
                    title="Unit Organisasi"
                    description="Manajemen struktur hierarki unit organisasi instansi."
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

                <ContentCard title="Struktur Unit Organisasi" description="Struktur hierarki unit organisasi instansi">
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

                        {visibleUnits.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada unit organisasi ditemukan"
                                description="Tidak ada data unit organisasi yang cocok dengan pencarian Anda."
                                icon={Building2}
                            />
                        ) : (
                            <div className="overflow-hidden rounded-md border border-border/60">
                                <div className="divide-y divide-border/50">
                                    <div className="flex items-center gap-2 bg-muted/40 pl-2 pr-4 py-2.5">
                                        <span className="w-4 shrink-0" />
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span className="w-[80px] shrink-0 text-sm font-semibold">Kode</span>
                                            <span className="text-sm font-semibold">Nama</span>
                                        </div>
                                        <span className="w-[100px] shrink-0 text-sm font-semibold">Status</span>
                                        <span className="w-7 shrink-0 text-right text-sm font-semibold">Aksi</span>
                                    </div>
                                    {visibleUnits.map((unit) => {
                                        const key = getNodeKey(unit);
                                        const hasChildren = childrenMap.get(key) !== undefined && childrenMap.get(key)!.length > 0;
                                        const isExpanded = expandedIds.has(key);

                                        return (
                                            <div
                                                key={key}
                                                className="flex items-center gap-2 pr-4 py-2.5 transition-colors hover:bg-muted/30"
                                                style={{ paddingLeft: `${8 + unit.depth * INDENT_PX}px` }}
                                            >
                                                <div className="flex w-4 shrink-0 items-center justify-center">
                                                    {hasChildren ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleExpand(key)}
                                                            className="flex cursor-pointer items-center justify-center rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            aria-label={isExpanded ? 'Ciutkan' : 'Perluas'}
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
                                                    <span className="font-mono text-xs text-muted-foreground shrink-0 w-[80px]">
                                                        {unit.kode}
                                                    </span>
                                                    <span className="truncate text-sm font-medium">
                                                        {unit.nama}
                                                    </span>
                                                    {unit.singkatan && (
                                                        <span className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                            {unit.singkatan}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="w-[100px] shrink-0">
                                                    <StatusBadge variant={statusVariant(unit.status)} className="w-fit">
                                                        {statusLabel(unit.status)}
                                                    </StatusBadge>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
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
                                                        {unit.depth === 0 && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => openCreateSubUnitDialog(unit)}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <PlusCircle className="h-4 w-4" />
                                                                    Tambah Sub Bidang
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
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
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <UnitFormDialog
                open={formOpen}
                mode={formMode}
                unit={selectedUnit}
                parentOptions={parentOptions}
                prefilledParentId={prefilledParentId}
                onOpenChange={setFormOpen}
            />
            <DetailDialog unit={detailUnit} parentOptions={parentOptions} onOpenChange={(open) => !open && setDetailUnit(null)} />
            <ConfirmDialog
                isOpen={deleteUnit !== null}
                onClose={() => {
                    setDeleteUnit(null);
                    setDeleteError(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Unit Organisasi"
                description={deleteError || `Hapus unit organisasi "${deleteUnit?.nama || ''}"? Data yang sudah dihapus tidak dapat dipulihkan.${deleteUnit && childrenMap.get(getNodeKey(deleteUnit))?.length ? ' Unit ini memiliki turunan yang juga akan ikut terhapus.' : ''}`}
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
