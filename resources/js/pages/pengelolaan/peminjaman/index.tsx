import { Head, router, useForm } from '@inertiajs/react';
import { format, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Archive,
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    Eye,
    FileText,
    RotateCcw,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { DataTablePagination } from '@/components/Tables/data-table-pagination';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import {
    workflowStatusLabel,
    workflowStatusVariant,
} from '@/lib/workflow-status';
import type { WorkflowStatus } from '@/lib/workflow-status';
import { ArsipDetailDialog } from '@/pages/arsip/detail-dialog';
import type { DetailArsip } from '@/pages/arsip/detail-dialog';
import {
    approve,
    bulkApprove,
    bulkReject,
    index,
    reject,
    store,
} from '@/routes/peminjaman';

type MasterItem = { id: number; kode: string; nama: string };

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    tanggal_arsip: string;
    created_at: string;
    workflow_status: WorkflowStatus;
    klasifikasi_arsip?: MasterItem | null;
    unit_organisasi?: MasterItem | null;
    creator?: { id: number; name: string } | null;
    peminjamans?: Peminjaman[];
};

type Peminjaman = {
    id: number;
    arsip_id: number;
    pemohon_id: number;
    alasan: string;
    status: 'pending' | 'approved' | 'rejected';
    catatan_peninjau: string | null;
    reviewed_at: string | null;
    created_at: string;
    arsip?: {
        id: number;
        nomor_arsip: string;
        judul: string;
        unit_organisasi?: MasterItem | null;
    };
    pemohon?: { id: number; name: string };
    reviewer?: { id: number; name: string } | null;
};

type PaginatedArsips = {
    data: Arsip[];
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type PaginatedPermohonan = {
    data: Peminjaman[];
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type UnitOrganisasiOption = {
    id: number;
    kode: string;
    nama: string;
    tipe: string;
    parent_id: number | null;
};

type PemohonOption = { id: number; name: string };

type IndexProps = {
    arsips: PaginatedArsips;
    permohonan: PaginatedPermohonan;
    filters?: {
        search?: string;
        tanggal_arsip?: string;
        nomor_arsip?: string;
        judul?: string;
        pemohon?: string;
        pemohon_id?: number | null;
        alasan?: string;
        unit_organisasi_id?: number | null;
        status?: string | null;
        per_page?: number | null;
    };
    unitOrganisasis?: UnitOrganisasiOption[];
    filterUnitOrganisasis?: UnitOrganisasiOption[];
    pemohonOptions?: PemohonOption[];
    filterStatuses?: string[];
    isOperator: boolean;
};

function peminjamanStatusBadge(status: Peminjaman['status']) {
    if (status === 'approved') {
        return <StatusBadge variant="success">Disetujui</StatusBadge>;
    }

    if (status === 'rejected') {
        return <StatusBadge variant="danger">Ditolak</StatusBadge>;
    }

    return <StatusBadge variant="warning">Menunggu</StatusBadge>;
}

// ── Dialog Ajukan Peminjaman ───────────────────────────────────────────────
function AjukanDialog({
    arsip,
    onClose,
}: {
    arsip: Arsip;
    onClose: () => void;
}) {
    const form = useForm<{ alasan: string; arsip?: string }>({ alasan: '' });

    function submit() {
        form.post(store(arsip.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Permohonan peminjaman berhasil diajukan.');
                onClose();
            },
            onError: (errors) => {
                if (errors.arsip) {
                    toast.error(errors.arsip);
                } else if (errors.alasan) {
                    toast.error(errors.alasan);
                } else {
                    toast.error('Gagal mengajukan peminjaman.');
                }
            },
        });
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajukan Peminjaman Arsip</DialogTitle>
                    <DialogDescription>
                        <span className="font-medium">{arsip.nomor_arsip}</span>{' '}
                        — {arsip.judul}
                    </DialogDescription>
                </DialogHeader>

                {form.errors.arsip && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                        {form.errors.arsip}
                    </div>
                )}

                <div className="space-y-3">
                    <Label htmlFor="alasan-peminjaman">
                        Tujuan Peminjaman{' '}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="alasan-peminjaman"
                        placeholder="Jelaskan tujuan peminjaman arsip ini..."
                        rows={4}
                        value={form.data.alasan}
                        onChange={(e) => form.setData('alasan', e.target.value)}
                    />
                    {form.errors.alasan && (
                        <p className="text-sm text-destructive">
                            {form.errors.alasan}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={form.processing || !form.data.alasan.trim()}
                    >
                        {form.processing ? 'Menyimpan...' : 'Ajukan Peminjaman'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Dialog Review (Approve / Reject) ──────────────────────────────────────
function ReviewDialog({
    peminjaman,
    action,
    onClose,
}: {
    peminjaman: Peminjaman;
    action: 'approve' | 'reject';
    onClose: () => void;
}) {
    const form = useForm({ catatan_peninjau: '' });
    const isReject = action === 'reject';

    function submit() {
        const url = isReject
            ? reject(peminjaman.id).url
            : approve(peminjaman.id).url;
        form.post(url, {
            onSuccess: () => {
                onClose();
            },
        });
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isReject ? 'Tolak' : 'Setujui'} Permohonan Peminjaman
                    </DialogTitle>
                    <DialogDescription>
                        Pemohon:{' '}
                        <span className="font-medium">
                            {peminjaman.pemohon?.name}
                        </span>{' '}
                        — {peminjaman.arsip?.nomor_arsip}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                        <p className="mb-1 font-medium text-muted-foreground">
                            Tujuan Peminjaman:
                        </p>
                        <p className="text-foreground">{peminjaman.alasan}</p>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="catatan-peninjau">
                            Catatan Peninjau{' '}
                            {isReject && (
                                <span className="text-destructive">*</span>
                            )}
                        </Label>
                        <Textarea
                            id="catatan-peninjau"
                            placeholder={
                                isReject
                                    ? 'Wajib diisi: alasan penolakan...'
                                    : 'Opsional: catatan persetujuan...'
                            }
                            rows={3}
                            value={form.data.catatan_peninjau}
                            onChange={(e) =>
                                form.setData('catatan_peninjau', e.target.value)
                            }
                        />
                        {form.errors.catatan_peninjau && (
                            <p className="text-sm text-destructive">
                                {form.errors.catatan_peninjau}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        variant={isReject ? 'destructive' : 'default'}
                        onClick={submit}
                        disabled={
                            form.processing ||
                            (isReject && !form.data.catatan_peninjau.trim())
                        }
                    >
                        {isReject ? 'Tolak Permohonan' : 'Setujui Permohonan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Dialog Bulk Review ────────────────────────────────────────────────────
function BulkReviewDialog({
    ids,
    action,
    onClose,
    onSuccess,
}: {
    ids: number[];
    action: 'approve' | 'reject';
    onClose: () => void;
    onSuccess: () => void;
}) {
    const form = useForm({ catatan_peninjau: '', ids });
    const isReject = action === 'reject';

    function submit() {
        const url = isReject ? bulkReject().url : bulkApprove().url;
        form.post(url, {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
        });
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isReject ? 'Tolak' : 'Setujui'} {ids.length} Permohonan
                    </DialogTitle>
                    <DialogDescription>
                        Anda akan memproses {ids.length} permohonan peminjaman
                        terpilih.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1">
                    <Label htmlFor="bulk-catatan-peninjau">
                        Catatan Peninjau{' '}
                        {isReject && (
                            <span className="text-destructive">*</span>
                        )}
                    </Label>
                    <Textarea
                        id="bulk-catatan-peninjau"
                        placeholder={
                            isReject
                                ? 'Wajib diisi: alasan penolakan...'
                                : 'Opsional: catatan persetujuan...'
                        }
                        rows={3}
                        value={form.data.catatan_peninjau}
                        onChange={(e) =>
                            form.setData('catatan_peninjau', e.target.value)
                        }
                    />
                    {form.errors.catatan_peninjau && (
                        <p className="text-sm text-destructive">
                            {form.errors.catatan_peninjau}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        variant={isReject ? 'destructive' : 'default'}
                        onClick={submit}
                        disabled={
                            form.processing ||
                            (isReject && !form.data.catatan_peninjau.trim())
                        }
                    >
                        {isReject ? 'Tolak' : 'Setujui'} {ids.length} Permohonan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PeminjamanIndex({
    arsips,
    permohonan,
    filters = {},
    unitOrganisasis = [],
    filterUnitOrganisasis,
    pemohonOptions = [],
    filterStatuses,
    isOperator,
}: IndexProps) {
    const activeUnitOrganisasis = filterUnitOrganisasis ?? unitOrganisasis;

    const [unitFilterOpen, setUnitFilterOpen] = useState(false);
    const [unitSearch, setUnitSearch] = useState('');

    const hierarchicalUnitOptions = useMemo(() => {
        const map = new Map<number, UnitOrganisasiOption>();
        activeUnitOrganisasis.forEach((u) => map.set(u.id, u));

        const childrenMap = new Map<number | null, UnitOrganisasiOption[]>();
        activeUnitOrganisasis.forEach((u) => {
            const pId = u.parent_id ?? null;

            if (!childrenMap.has(pId)) {
                childrenMap.set(pId, []);
            }

            childrenMap.get(pId)!.push(u);
        });

        const getAncestors = (
            item: UnitOrganisasiOption,
        ): UnitOrganisasiOption[] => {
            const ancestors: UnitOrganisasiOption[] = [];
            let curr =
                item.parent_id != null ? map.get(item.parent_id) : undefined;
            const visited = new Set<number>([item.id]);

            while (curr && !visited.has(curr.id)) {
                visited.add(curr.id);
                ancestors.unshift(curr);
                curr =
                    curr.parent_id != null
                        ? map.get(curr.parent_id)
                        : undefined;
            }

            return ancestors;
        };

        const result: Array<
            UnitOrganisasiOption & {
                depth: number;
                path: string;
                breadcrumb: string;
            }
        > = [];

        const traverse = (parentId: number | null, depth: number) => {
            const children = childrenMap.get(parentId) ?? [];

            for (const child of children) {
                const ancestors = getAncestors(child);
                const path = [...ancestors.map((a) => a.nama), child.nama].join(
                    ' › ',
                );
                const breadcrumb = ancestors.map((a) => a.nama).join(' › ');

                result.push({
                    ...child,
                    depth,
                    path,
                    breadcrumb,
                });
                traverse(child.id, depth + 1);
            }
        };

        traverse(null, 0);

        if (result.length < activeUnitOrganisasis.length) {
            const addedIds = new Set(result.map((r) => r.id));
            activeUnitOrganisasis.forEach((u) => {
                if (!addedIds.has(u.id)) {
                    result.push({
                        ...u,
                        depth: 0,
                        path: u.nama,
                        breadcrumb: '',
                    });
                }
            });
        }

        return result;
    }, [activeUnitOrganisasis]);

    const filteredUnits = useMemo(() => {
        if (!unitSearch.trim()) {
            return hierarchicalUnitOptions;
        }

        const q = unitSearch.toLowerCase();

        return hierarchicalUnitOptions.filter(
            (item) =>
                item.nama.toLowerCase().includes(q) ||
                (item.kode && item.kode.toLowerCase().includes(q)) ||
                item.path.toLowerCase().includes(q),
        );
    }, [hierarchicalUnitOptions, unitSearch]);

    const selectedUnit = useMemo(() => {
        if (!filters.unit_organisasi_id) {
            return null;
        }

        return (
            hierarchicalUnitOptions.find(
                (item) =>
                    item.id.toString() ===
                    filters.unit_organisasi_id?.toString(),
            ) || null
        );
    }, [hierarchicalUnitOptions, filters.unit_organisasi_id]);

    const [columnFilters, setColumnFilters] = useState({
        tanggal_arsip: filters.tanggal_arsip || '',
        nomor_arsip: filters.nomor_arsip || '',
        judul: filters.judul || '',
        alasan: filters.alasan || '',
    });
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [permohonanDateFilterOpen, setPermohonanDateFilterOpen] =
        useState(false);

    const [detailArsip, setDetailArsip] = useState<DetailArsip | null>(null);
    const [detailHistory, setDetailHistory] = useState<any[]>([]);
    const [detailTransitions, setDetailTransitions] = useState<any[]>([]);
    const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
    const [ajukanArsip, setAjukanArsip] = useState<Arsip | null>(null);
    const [reviewItem, setReviewItem] = useState<{
        peminjaman: Peminjaman;
        action: 'approve' | 'reject';
    } | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(
        null,
    );

    const { can } = usePermission();
    const canApprove = can('peminjaman.approve');

    const pendingItems = permohonan.data.filter((p) => p.status === 'pending');
    const allPendingIds = pendingItems.map((p) => p.id);
    const validSelectedIds = selectedIds.filter((id) =>
        allPendingIds.includes(id),
    );
    const isSelectionModeActive = isSelectionMode && allPendingIds.length > 0;
    const allSelected =
        allPendingIds.length > 0 &&
        allPendingIds.every((id) => validSelectedIds.includes(id));

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allPendingIds);
        }
    }

    function toggleSelectOne(id: number) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }

    const updateFilters = (
        newParams: Record<string, string | number | null | undefined>,
    ) => {
        const params = { ...filters, ...newParams };
        Object.keys(params).forEach((key) => {
            if (
                params[key as keyof typeof params] === '' ||
                params[key as keyof typeof params] == null
            ) {
                delete params[key as keyof typeof params];
            }
        });
        router.get(index().url, params as Record<string, string>, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Debounce text filters
    useEffect(() => {
        const timer = setTimeout(() => {
            const changed: Record<string, string | null> = {};
            let hasChange = false;

            (
                ['tanggal_arsip', 'nomor_arsip', 'judul', 'alasan'] as const
            ).forEach((key) => {
                if (columnFilters[key] !== (filters[key] || '')) {
                    changed[key] = columnFilters[key] || null;
                    hasChange = true;
                }
            });

            if (hasChange) {
                updateFilters(changed);
            }
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnFilters]);

    const handleTextChange = (key: keyof typeof columnFilters, val: string) => {
        setColumnFilters((prev) => ({ ...prev, [key]: val }));
    };

    const hasAnyFilter = Object.keys(filters).some(
        (k) => k !== 'per_page' && filters[k as keyof typeof filters],
    );

    const clearAllFilters = () => {
        setColumnFilters({
            tanggal_arsip: '',
            nomor_arsip: '',
            judul: '',
            alasan: '',
        });
        setDateFilterOpen(false);
        setPermohonanDateFilterOpen(false);
        router.get(
            index().url,
            filters.per_page ? { per_page: filters.per_page } : {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const openDetail = async (id: number) => {
        setLoadingDetailId(id);

        try {
            const res = await fetch(`/arsip/${id}/detail-json`, {
                headers: { Accept: 'application/json' },
            });
            const data = await res.json();
            setDetailArsip(data.arsip);
            setDetailHistory(data.workflowHistory);
            setDetailTransitions(data.allowedTransitions);
        } finally {
            setLoadingDetailId(null);
        }
    };

    const pendingCount = permohonan.data.filter(
        (p) => p.status === 'pending',
    ).length;

    return (
        <RouteGuard permission="peminjaman.view">
            <Head title="Peminjaman Arsip" />
            <PageContainer>
                <PageHeader
                    title="Peminjaman Arsip"
                    description="Kelola pengajuan peminjaman arsip inaktif beserta status persetujuan"
                    breadcrumb={[
                        { title: 'PENGELOLAAN' },
                        { title: 'Peminjaman Arsip' },
                    ]}
                    actions={
                        hasAnyFilter && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset Filter
                            </Button>
                        )
                    }
                />

                <Tabs defaultValue="arsip" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="arsip">
                            <Archive className="mr-2 h-4 w-4" />
                            Arsip Inaktif
                        </TabsTrigger>
                        <TabsTrigger value="permohonan">
                            <FileText className="mr-2 h-4 w-4" />
                            {isOperator
                                ? 'Permohonan Saya'
                                : 'Semua Permohonan'}
                            {!isOperator && pendingCount > 0 && (
                                <Badge className="ml-2 h-5 min-w-5 rounded-full bg-amber-500 px-1.5 text-[10px] text-white">
                                    {pendingCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab: Arsip Inaktif ── */}
                    <TabsContent value="arsip">
                        <ContentCard
                            title="Daftar Arsip Inaktif"
                            description="Gunakan baris filter per kolom di bawah judul tabel untuk menyaring arsip inaktif."
                        >
                            <div className="space-y-4">
                                {arsips.data.length === 0 && !hasAnyFilter ? (
                                    <EmptyTable
                                        title="Tidak ada arsip inaktif"
                                        description="Belum ada arsip yang berstatus Inaktif."
                                        icon={Archive}
                                    />
                                ) : (
                                    <>
                                        <div className="relative w-full overflow-x-auto rounded-lg border border-border/70 shadow-xs">
                                            <Table className="w-full min-w-[1400px] border-collapse text-xs">
                                                <TableHeader className="bg-muted/60">
                                                    {/* Baris 1: Judul Kolom Header */}
                                                    <TableRow className="border-b border-border/60 hover:bg-transparent">
                                                        <TableHead className="w-[50px] px-2 py-3 text-center font-bold text-foreground">
                                                            NO
                                                        </TableHead>
                                                        <TableHead className="w-[190px] min-w-[180px] px-2 py-3 font-bold text-foreground">
                                                            TANGGAL ARSIP
                                                        </TableHead>
                                                        <TableHead className="w-[170px] min-w-[165px] px-2 py-3 font-bold text-foreground">
                                                            NOMOR ARSIP
                                                        </TableHead>
                                                        <TableHead className="min-w-[220px] px-2 py-3 font-bold text-foreground">
                                                            HAL
                                                        </TableHead>
                                                        <TableHead className="w-[210px] min-w-[200px] px-2 py-3 font-bold text-foreground">
                                                            UNIT PENGOLAH
                                                        </TableHead>
                                                        {isOperator && (
                                                            <TableHead className="w-[150px] min-w-[140px] px-2 py-3 font-bold text-foreground">
                                                                STATUS PINJAM
                                                            </TableHead>
                                                        )}
                                                        <TableHead className="w-[120px] min-w-[110px] px-2 py-3 font-bold text-foreground">
                                                            STATUS ARSIP
                                                        </TableHead>
                                                        <TableHead className="w-[110px] px-2 py-3 text-center font-bold text-foreground">
                                                            AKSI
                                                        </TableHead>
                                                    </TableRow>

                                                    {/* Baris 2: Input & Dropdown Filter Per Kolom */}
                                                    <TableRow className="border-b border-border/70 bg-muted/30 hover:bg-muted/30">
                                                        <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                            -
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <div className="relative flex items-center">
                                                                <Popover
                                                                    open={
                                                                        dateFilterOpen
                                                                    }
                                                                    onOpenChange={
                                                                        setDateFilterOpen
                                                                    }
                                                                >
                                                                    <PopoverTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                'h-8 w-full justify-start gap-2 border-border/70 bg-background pr-8 pl-2.5 font-sans text-sm font-normal',
                                                                                !columnFilters.tanggal_arsip &&
                                                                                    'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                            {columnFilters.tanggal_arsip &&
                                                                            isValid(
                                                                                new Date(
                                                                                    columnFilters.tanggal_arsip +
                                                                                        'T00:00:00',
                                                                                ),
                                                                            ) ? (
                                                                                <span className="truncate pr-1 text-left font-sans text-sm font-normal">
                                                                                    {format(
                                                                                        new Date(
                                                                                            columnFilters.tanggal_arsip +
                                                                                                'T00:00:00',
                                                                                        ),
                                                                                        'dd/MM/yyyy',
                                                                                    )}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="truncate font-sans text-sm font-normal">
                                                                                    Pilih
                                                                                    Tanggal
                                                                                </span>
                                                                            )}
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent
                                                                        className="w-auto p-0"
                                                                        align="start"
                                                                    >
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={
                                                                                columnFilters.tanggal_arsip
                                                                                    ? new Date(
                                                                                          columnFilters.tanggal_arsip +
                                                                                              'T00:00:00',
                                                                                      )
                                                                                    : undefined
                                                                            }
                                                                            onSelect={(
                                                                                date,
                                                                            ) => {
                                                                                handleTextChange(
                                                                                    'tanggal_arsip',
                                                                                    date
                                                                                        ? format(
                                                                                              date,
                                                                                              'yyyy-MM-dd',
                                                                                          )
                                                                                        : '',
                                                                                );
                                                                                setDateFilterOpen(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            locale={
                                                                                idLocale
                                                                            }
                                                                            captionLayout="dropdown"
                                                                            startMonth={
                                                                                new Date(
                                                                                    1970,
                                                                                    0,
                                                                                )
                                                                            }
                                                                            endMonth={
                                                                                new Date(
                                                                                    new Date().getFullYear() +
                                                                                        10,
                                                                                    11,
                                                                                )
                                                                            }
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                                {columnFilters.tanggal_arsip && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleTextChange(
                                                                                'tanggal_arsip',
                                                                                '',
                                                                            );
                                                                            setDateFilterOpen(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="absolute top-1/2 right-2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                        aria-label="Hapus filter tanggal"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <Input
                                                                placeholder="Cari nomor..."
                                                                value={
                                                                    columnFilters.nomor_arsip
                                                                }
                                                                onChange={(e) =>
                                                                    handleTextChange(
                                                                        'nomor_arsip',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                            />
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <Input
                                                                placeholder="Cari judul..."
                                                                value={
                                                                    columnFilters.judul
                                                                }
                                                                onChange={(e) =>
                                                                    handleTextChange(
                                                                        'judul',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                            />
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <Popover
                                                                open={
                                                                    unitFilterOpen
                                                                }
                                                                onOpenChange={(
                                                                    open,
                                                                ) => {
                                                                    setUnitFilterOpen(
                                                                        open,
                                                                    );

                                                                    if (!open) {
                                                                        setUnitSearch(
                                                                            '',
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <PopoverTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        aria-expanded={
                                                                            unitFilterOpen
                                                                        }
                                                                        className={cn(
                                                                            '!h-auto min-h-8 w-full justify-between gap-1 border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal hover:bg-background',
                                                                            !filters.unit_organisasi_id &&
                                                                                'text-muted-foreground',
                                                                        )}
                                                                    >
                                                                        <span className="line-clamp-2 font-sans text-sm font-normal break-words text-foreground">
                                                                            {selectedUnit
                                                                                ? selectedUnit.nama
                                                                                : 'Semua Unit'}
                                                                        </span>
                                                                        <div className="ml-1 flex shrink-0 items-center gap-0.5">
                                                                            {selectedUnit && (
                                                                                <span
                                                                                    role="button"
                                                                                    tabIndex={
                                                                                        0
                                                                                    }
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        updateFilters(
                                                                                            {
                                                                                                unit_organisasi_id:
                                                                                                    null,
                                                                                            },
                                                                                        );
                                                                                    }}
                                                                                    onKeyDown={(
                                                                                        e,
                                                                                    ) => {
                                                                                        if (
                                                                                            e.key ===
                                                                                                'Enter' ||
                                                                                            e.key ===
                                                                                                ' '
                                                                                        ) {
                                                                                            e.stopPropagation();
                                                                                            updateFilters(
                                                                                                {
                                                                                                    unit_organisasi_id:
                                                                                                        null,
                                                                                                },
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                                    title="Hapus filter unit"
                                                                                >
                                                                                    <X className="h-3.5 w-3.5" />
                                                                                </span>
                                                                            )}
                                                                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                                                                        </div>
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent
                                                                    className="w-[420px] max-w-[90vw] p-0 text-sm shadow-lg"
                                                                    align="start"
                                                                >
                                                                    <div className="flex items-center border-b border-border/60 px-2 py-1.5">
                                                                        <Search className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                        <Input
                                                                            placeholder="Cari unit pengolah..."
                                                                            value={
                                                                                unitSearch
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setUnitSearch(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="h-7 w-full border-none bg-transparent p-0 font-sans text-sm font-normal shadow-none placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-0"
                                                                            autoFocus
                                                                        />
                                                                        {unitSearch && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setUnitSearch(
                                                                                        '',
                                                                                    )
                                                                                }
                                                                                className="p-0.5 text-muted-foreground hover:text-foreground"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="max-h-[340px] space-y-0.5 overflow-y-auto p-1.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                updateFilters(
                                                                                    {
                                                                                        unit_organisasi_id:
                                                                                            null,
                                                                                    },
                                                                                );
                                                                                setUnitFilterOpen(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            className={cn(
                                                                                'flex w-full items-center justify-between rounded px-2.5 py-2 text-left font-sans text-sm font-normal transition-colors hover:bg-muted/70',
                                                                                !filters.unit_organisasi_id &&
                                                                                    'bg-muted font-semibold text-primary',
                                                                            )}
                                                                        >
                                                                            <span>
                                                                                Semua
                                                                                Unit
                                                                            </span>
                                                                            {!filters.unit_organisasi_id && (
                                                                                <Check className="h-4 w-4" />
                                                                            )}
                                                                        </button>

                                                                        {filteredUnits.length ===
                                                                        0 ? (
                                                                            <div className="py-6 text-center font-sans text-sm text-muted-foreground">
                                                                                Unit
                                                                                pengolah
                                                                                tidak
                                                                                ditemukan
                                                                            </div>
                                                                        ) : (
                                                                            filteredUnits.map(
                                                                                (
                                                                                    opt,
                                                                                ) => {
                                                                                    const isSelected =
                                                                                        filters.unit_organisasi_id?.toString() ===
                                                                                        opt.id.toString();

                                                                                    return (
                                                                                        <button
                                                                                            key={
                                                                                                opt.id
                                                                                            }
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                updateFilters(
                                                                                                    {
                                                                                                        unit_organisasi_id:
                                                                                                            opt.id.toString(),
                                                                                                    },
                                                                                                );
                                                                                                setUnitFilterOpen(
                                                                                                    false,
                                                                                                );
                                                                                            }}
                                                                                            className={cn(
                                                                                                'flex w-full items-start justify-between rounded px-2.5 py-2 text-left font-sans text-sm font-normal transition-colors hover:bg-muted/70',
                                                                                                isSelected &&
                                                                                                    'bg-muted font-semibold text-primary',
                                                                                            )}
                                                                                            style={{
                                                                                                paddingLeft: `${Math.min(opt.depth, 4) * 14 + 10}px`,
                                                                                            }}
                                                                                            title={
                                                                                                opt.path
                                                                                            }
                                                                                        >
                                                                                            <div className="flex min-w-0 flex-col gap-0.5 pr-2">
                                                                                                <span className="font-sans text-sm leading-snug font-normal break-words whitespace-normal">
                                                                                                    {opt.depth >
                                                                                                        0 && (
                                                                                                        <span className="mr-1.5 font-mono text-xs text-muted-foreground/80">
                                                                                                            {
                                                                                                                '↳'
                                                                                                            }
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {
                                                                                                        opt.nama
                                                                                                    }
                                                                                                </span>
                                                                                                {unitSearch.trim() &&
                                                                                                    opt.breadcrumb && (
                                                                                                        <span className="font-sans text-[11px] leading-tight font-normal break-words whitespace-normal text-muted-foreground">
                                                                                                            {
                                                                                                                opt.breadcrumb
                                                                                                            }
                                                                                                        </span>
                                                                                                    )}
                                                                                            </div>
                                                                                            {isSelected && (
                                                                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                                                            )}
                                                                                        </button>
                                                                                    );
                                                                                },
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </TableHead>
                                                        {isOperator && (
                                                            <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                                -
                                                            </TableHead>
                                                        )}
                                                        <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                            -
                                                        </TableHead>
                                                        <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                            -
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {arsips.data.length ===
                                                    0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={
                                                                    isOperator
                                                                        ? 8
                                                                        : 7
                                                                }
                                                                className="py-8 text-center text-muted-foreground"
                                                            >
                                                                Tidak ada arsip
                                                                inaktif yang
                                                                cocok dengan
                                                                kriteria filter.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        arsips.data.map(
                                                            (
                                                                arsip,
                                                                indexNum,
                                                            ) => {
                                                                const myPeminjaman =
                                                                    arsip
                                                                        .peminjamans?.[0];
                                                                const hasPending =
                                                                    myPeminjaman?.status ===
                                                                    'pending';
                                                                const dateObj =
                                                                    arsip.tanggal_arsip
                                                                        ? new Date(
                                                                              arsip.tanggal_arsip,
                                                                          )
                                                                        : null;
                                                                const formattedDate =
                                                                    dateObj
                                                                        ? dateObj.toLocaleDateString(
                                                                              'id-ID',
                                                                              {
                                                                                  weekday:
                                                                                      'long',
                                                                                  day: 'numeric',
                                                                                  month: 'long',
                                                                                  year: 'numeric',
                                                                              },
                                                                          )
                                                                        : '-';

                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            arsip.id
                                                                        }
                                                                        className="cursor-pointer transition-colors hover:bg-muted/40"
                                                                        onClick={() =>
                                                                            openDetail(
                                                                                arsip.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        {/* # (No Urutan) */}
                                                                        <TableCell className="w-[50px] px-2 text-center align-middle font-mono text-muted-foreground">
                                                                            {(arsips.from ||
                                                                                1) +
                                                                                indexNum}
                                                                        </TableCell>

                                                                        {/* Tanggal Arsip */}
                                                                        <TableCell className="w-[190px] min-w-[180px] px-2 align-middle leading-snug break-words whitespace-normal text-foreground">
                                                                            {
                                                                                formattedDate
                                                                            }
                                                                        </TableCell>

                                                                        {/* Nomor Arsip */}
                                                                        <TableCell className="w-[170px] min-w-[165px] px-2 align-middle font-mono font-medium whitespace-nowrap text-primary">
                                                                            {
                                                                                arsip.nomor_arsip
                                                                            }
                                                                        </TableCell>

                                                                        {/* Judul / Hal */}
                                                                        <TableCell className="min-w-[220px] px-2 align-middle leading-snug font-medium break-words whitespace-normal text-foreground uppercase">
                                                                            {
                                                                                arsip.judul
                                                                            }
                                                                        </TableCell>

                                                                        {/* Unit Pengolah */}
                                                                        <TableCell className="w-[210px] min-w-[200px] px-2 align-middle leading-tight break-words whitespace-normal text-muted-foreground">
                                                                            {arsip
                                                                                .unit_organisasi
                                                                                ?.nama ||
                                                                                '-'}
                                                                        </TableCell>

                                                                        {/* Status Peminjaman (Operator) */}
                                                                        {isOperator && (
                                                                            <TableCell className="w-[150px] min-w-[140px] px-2 align-middle whitespace-nowrap">
                                                                                {myPeminjaman ? (
                                                                                    peminjamanStatusBadge(
                                                                                        myPeminjaman.status,
                                                                                    )
                                                                                ) : (
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        -
                                                                                    </span>
                                                                                )}
                                                                            </TableCell>
                                                                        )}

                                                                        {/* Status Arsip */}
                                                                        <TableCell className="w-[120px] min-w-[110px] px-2 align-middle whitespace-nowrap">
                                                                            <StatusBadge
                                                                                variant={workflowStatusVariant(
                                                                                    arsip.workflow_status,
                                                                                )}
                                                                            >
                                                                                {workflowStatusLabel(
                                                                                    arsip.workflow_status,
                                                                                )}
                                                                            </StatusBadge>
                                                                        </TableCell>

                                                                        {/* Aksi */}
                                                                        <TableCell
                                                                            className="w-[110px] px-2 text-center align-middle whitespace-nowrap"
                                                                            onClick={(
                                                                                e,
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        >
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7 text-muted-foreground"
                                                                                    disabled={
                                                                                        loadingDetailId ===
                                                                                        arsip.id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        openDetail(
                                                                                            arsip.id,
                                                                                        )
                                                                                    }
                                                                                    title="Lihat Detail"
                                                                                >
                                                                                    <Eye className="h-4 w-4" />
                                                                                </Button>
                                                                                {isOperator &&
                                                                                    !hasPending &&
                                                                                    myPeminjaman?.status !==
                                                                                        'approved' && (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            className="h-7 px-2 text-xs"
                                                                                            onClick={() =>
                                                                                                setAjukanArsip(
                                                                                                    arsip,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Ajukan
                                                                                        </Button>
                                                                                    )}
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            },
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <DataTablePagination
                                            data={arsips}
                                            itemName="arsip"
                                            perPage={
                                                filters.per_page ?? undefined
                                            }
                                            onPerPageChange={(val) =>
                                                updateFilters({ per_page: val })
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        </ContentCard>
                    </TabsContent>

                    {/* ── Tab: Permohonan ── */}
                    <TabsContent value="permohonan">
                        <ContentCard
                            title={
                                isOperator
                                    ? 'Riwayat Permohonan Saya'
                                    : 'Semua Permohonan Peminjaman'
                            }
                            description="Gunakan baris filter per kolom di bawah judul tabel untuk menyaring permohonan."
                        >
                            <div className="space-y-4">
                                {!isOperator && (
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div />
                                        {allPendingIds.length > 0 &&
                                            (isSelectionMode ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsSelectionMode(
                                                            false,
                                                        );
                                                        setSelectedIds([]);
                                                    }}
                                                    className="h-8 text-xs"
                                                >
                                                    Batal Pilih
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setIsSelectionMode(true)
                                                    }
                                                    className="h-8 gap-1.5 text-xs"
                                                >
                                                    Pilih Permohonan
                                                </Button>
                                            ))}
                                    </div>
                                )}

                                {isSelectionModeActive && (
                                    <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
                                        <span className="font-medium text-foreground">
                                            {validSelectedIds.length} permohonan
                                            dipilih
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedIds([]);
                                                    setIsSelectionMode(false);
                                                }}
                                                disabled={
                                                    validSelectedIds.length ===
                                                    0
                                                }
                                                className="h-8 text-xs"
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 border-emerald-600/30 bg-emerald-50/50 px-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                                                onClick={() =>
                                                    setBulkAction('approve')
                                                }
                                                disabled={
                                                    validSelectedIds.length ===
                                                    0
                                                }
                                            >
                                                Setujui (
                                                {validSelectedIds.length})
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 border-destructive/30 bg-destructive/5 px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() =>
                                                    setBulkAction('reject')
                                                }
                                                disabled={
                                                    validSelectedIds.length ===
                                                    0
                                                }
                                            >
                                                Tolak ({validSelectedIds.length}
                                                )
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {permohonan.data.length === 0 &&
                                !hasAnyFilter ? (
                                    <EmptyTable
                                        title="Tidak ada permohonan"
                                        description={
                                            isOperator
                                                ? 'Belum ada permohonan peminjaman yang Anda ajukan.'
                                                : 'Belum ada permohonan peminjaman masuk.'
                                        }
                                        icon={FileText}
                                    />
                                ) : (
                                    <>
                                        <div className="relative w-full overflow-x-auto rounded-lg border border-border/70 shadow-xs">
                                            <Table className="w-full min-w-[1500px] border-collapse text-xs">
                                                <TableHeader className="bg-muted/60">
                                                    {/* Baris 1: Judul Kolom Header */}
                                                    <TableRow className="border-b border-border/60 hover:bg-transparent">
                                                        {isSelectionModeActive && (
                                                            <TableHead className="w-[45px] px-2 py-3 text-center font-bold">
                                                                <div className="flex justify-center">
                                                                    <Checkbox
                                                                        checked={
                                                                            allSelected
                                                                        }
                                                                        onCheckedChange={
                                                                            toggleSelectAll
                                                                        }
                                                                        aria-label="Pilih semua pending"
                                                                        className="h-4 w-4"
                                                                    />
                                                                </div>
                                                            </TableHead>
                                                        )}
                                                        <TableHead className="w-[50px] px-2 py-3 text-center font-bold text-foreground">
                                                            NO
                                                        </TableHead>
                                                        <TableHead className="w-[190px] min-w-[180px] px-2 py-3 font-bold text-foreground">
                                                            TGL PENGAJUAN
                                                        </TableHead>
                                                        <TableHead className="w-[170px] min-w-[165px] px-2 py-3 font-bold text-foreground">
                                                            NOMOR ARSIP
                                                        </TableHead>
                                                        <TableHead className="min-w-[220px] px-2 py-3 font-bold text-foreground">
                                                            HAL
                                                        </TableHead>
                                                        {!isOperator && (
                                                            <TableHead className="w-[210px] min-w-[200px] px-2 py-3 font-bold text-foreground">
                                                                PEMOHON & UNIT
                                                            </TableHead>
                                                        )}
                                                        <TableHead className="min-w-[200px] px-2 py-3 font-bold text-foreground">
                                                            TUJUAN PEMINJAMAN
                                                        </TableHead>
                                                        <TableHead className="w-[150px] min-w-[140px] px-2 py-3 font-bold text-foreground">
                                                            STATUS
                                                        </TableHead>
                                                        <TableHead className="w-[140px] px-2 py-3 text-center font-bold text-foreground">
                                                            AKSI
                                                        </TableHead>
                                                    </TableRow>

                                                    {/* Baris 2: Input & Dropdown Filter Per Kolom */}
                                                    <TableRow className="border-b border-border/70 bg-muted/30 hover:bg-muted/30">
                                                        {isSelectionModeActive && (
                                                            <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                                -
                                                            </TableHead>
                                                        )}
                                                        <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                            -
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <div className="relative flex items-center">
                                                                <Popover
                                                                    open={
                                                                        permohonanDateFilterOpen
                                                                    }
                                                                    onOpenChange={
                                                                        setPermohonanDateFilterOpen
                                                                    }
                                                                >
                                                                    <PopoverTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                'h-8 w-full justify-start gap-2 border-border/70 bg-background pr-8 pl-2.5 font-sans text-sm font-normal',
                                                                                !columnFilters.tanggal_arsip &&
                                                                                    'text-muted-foreground',
                                                                            )}
                                                                        >
                                                                            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                            {columnFilters.tanggal_arsip &&
                                                                            isValid(
                                                                                new Date(
                                                                                    columnFilters.tanggal_arsip +
                                                                                        'T00:00:00',
                                                                                ),
                                                                            ) ? (
                                                                                <span className="truncate pr-1 text-left font-sans text-sm font-normal">
                                                                                    {format(
                                                                                        new Date(
                                                                                            columnFilters.tanggal_arsip +
                                                                                                'T00:00:00',
                                                                                        ),
                                                                                        'dd/MM/yyyy',
                                                                                    )}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="truncate font-sans text-sm font-normal">
                                                                                    Pilih
                                                                                    Tanggal
                                                                                </span>
                                                                            )}
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent
                                                                        className="w-auto p-0"
                                                                        align="start"
                                                                    >
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={
                                                                                columnFilters.tanggal_arsip
                                                                                    ? new Date(
                                                                                          columnFilters.tanggal_arsip +
                                                                                              'T00:00:00',
                                                                                      )
                                                                                    : undefined
                                                                            }
                                                                            onSelect={(
                                                                                date,
                                                                            ) => {
                                                                                handleTextChange(
                                                                                    'tanggal_arsip',
                                                                                    date
                                                                                        ? format(
                                                                                              date,
                                                                                              'yyyy-MM-dd',
                                                                                          )
                                                                                        : '',
                                                                                );
                                                                                setPermohonanDateFilterOpen(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            locale={
                                                                                idLocale
                                                                            }
                                                                            captionLayout="dropdown"
                                                                            startMonth={
                                                                                new Date(
                                                                                    1970,
                                                                                    0,
                                                                                )
                                                                            }
                                                                            endMonth={
                                                                                new Date(
                                                                                    new Date().getFullYear() +
                                                                                        10,
                                                                                    11,
                                                                                )
                                                                            }
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                                {columnFilters.tanggal_arsip && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleTextChange(
                                                                                'tanggal_arsip',
                                                                                '',
                                                                            );
                                                                            setPermohonanDateFilterOpen(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="absolute top-1/2 right-2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                        aria-label="Hapus filter tanggal"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <Input
                                                                placeholder="Cari nomor..."
                                                                value={
                                                                    columnFilters.nomor_arsip
                                                                }
                                                                onChange={(e) =>
                                                                    handleTextChange(
                                                                        'nomor_arsip',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                            />
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <Input
                                                                placeholder="Cari judul..."
                                                                value={
                                                                    columnFilters.judul
                                                                }
                                                                onChange={(e) =>
                                                                    handleTextChange(
                                                                        'judul',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                            />
                                                        </TableHead>
                                                        {!isOperator && (
                                                            <TableHead className="p-2">
                                                                <Select
                                                                    value={
                                                                        filters.pemohon_id
                                                                            ? String(
                                                                                  filters.pemohon_id,
                                                                              )
                                                                            : 'all'
                                                                    }
                                                                    onValueChange={(
                                                                        val,
                                                                    ) =>
                                                                        updateFilters(
                                                                            {
                                                                                pemohon_id:
                                                                                    val ===
                                                                                    'all'
                                                                                        ? null
                                                                                        : val,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger className="!h-auto min-h-8 w-full border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal *:data-[slot=select-value]:!line-clamp-none *:data-[slot=select-value]:!break-words *:data-[slot=select-value]:!whitespace-normal [&>span]:line-clamp-none [&>span]:font-sans [&>span]:text-sm [&>span]:font-normal [&>span]:break-words [&>span]:whitespace-normal">
                                                                        <SelectValue placeholder="Semua Pemohon" />
                                                                    </SelectTrigger>
                                                                    <SelectContent
                                                                        align="start"
                                                                        className="max-h-[300px] text-sm"
                                                                    >
                                                                        <SelectItem value="all">
                                                                            Semua
                                                                            Pemohon
                                                                        </SelectItem>
                                                                        {pemohonOptions.map(
                                                                            (
                                                                                opt,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        opt.id
                                                                                    }
                                                                                    value={opt.id.toString()}
                                                                                >
                                                                                    {
                                                                                        opt.name
                                                                                    }
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableHead>
                                                        )}
                                                        <TableHead className="p-2">
                                                            <Input
                                                                placeholder="Cari tujuan..."
                                                                value={
                                                                    columnFilters.alasan
                                                                }
                                                                onChange={(e) =>
                                                                    handleTextChange(
                                                                        'alasan',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                            />
                                                        </TableHead>
                                                        <TableHead className="p-2">
                                                            <Select
                                                                value={
                                                                    filters.status ??
                                                                    'all'
                                                                }
                                                                onValueChange={(
                                                                    val,
                                                                ) => {
                                                                    setSelectedIds(
                                                                        [],
                                                                    );
                                                                    setIsSelectionMode(
                                                                        false,
                                                                    );
                                                                    updateFilters(
                                                                        {
                                                                            status:
                                                                                val ===
                                                                                'all'
                                                                                    ? null
                                                                                    : val,
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                <SelectTrigger className="!h-auto min-h-8 w-full border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal *:data-[slot=select-value]:!line-clamp-none *:data-[slot=select-value]:!break-words *:data-[slot=select-value]:!whitespace-normal [&>span]:line-clamp-none [&>span]:font-sans [&>span]:text-sm [&>span]:font-normal [&>span]:break-words [&>span]:whitespace-normal">
                                                                    <SelectValue placeholder="Semua Status" />
                                                                </SelectTrigger>
                                                                <SelectContent
                                                                    align="start"
                                                                    className="max-h-[300px] text-sm"
                                                                >
                                                                    <SelectItem value="all">
                                                                        Semua
                                                                        Status
                                                                    </SelectItem>
                                                                    {(!filterStatuses ||
                                                                        filterStatuses.includes(
                                                                            'pending',
                                                                        )) && (
                                                                        <SelectItem value="pending">
                                                                            Menunggu
                                                                        </SelectItem>
                                                                    )}
                                                                    {(!filterStatuses ||
                                                                        filterStatuses.includes(
                                                                            'approved',
                                                                        )) && (
                                                                        <SelectItem value="approved">
                                                                            Disetujui
                                                                        </SelectItem>
                                                                    )}
                                                                    {(!filterStatuses ||
                                                                        filterStatuses.includes(
                                                                            'rejected',
                                                                        )) && (
                                                                        <SelectItem value="rejected">
                                                                            Ditolak
                                                                        </SelectItem>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableHead>
                                                        <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                            -
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {permohonan.data.length ===
                                                    0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={
                                                                    (isSelectionModeActive
                                                                        ? 1
                                                                        : 0) +
                                                                    (isOperator
                                                                        ? 7
                                                                        : 8)
                                                                }
                                                                className="py-8 text-center text-muted-foreground"
                                                            >
                                                                Tidak ada
                                                                permohonan yang
                                                                cocok dengan
                                                                kriteria filter.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        permohonan.data.map(
                                                            (
                                                                item,
                                                                indexNum,
                                                            ) => (
                                                                <TableRow
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    data-state={
                                                                        validSelectedIds.includes(
                                                                            item.id,
                                                                        )
                                                                            ? 'selected'
                                                                            : undefined
                                                                    }
                                                                    className="transition-colors hover:bg-muted/40"
                                                                >
                                                                    {/* Checkbox Massal */}
                                                                    {isSelectionModeActive && (
                                                                        <TableCell
                                                                            className="w-[45px] px-2 text-center align-middle"
                                                                            onClick={(
                                                                                e,
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        >
                                                                            {item.status ===
                                                                                'pending' && (
                                                                                <Checkbox
                                                                                    checked={validSelectedIds.includes(
                                                                                        item.id,
                                                                                    )}
                                                                                    onCheckedChange={() =>
                                                                                        toggleSelectOne(
                                                                                            item.id,
                                                                                        )
                                                                                    }
                                                                                    aria-label={`Pilih permohonan ${item.id}`}
                                                                                    className="h-4 w-4"
                                                                                />
                                                                            )}
                                                                        </TableCell>
                                                                    )}

                                                                    {/* # (No Urutan) */}
                                                                    <TableCell className="w-[50px] px-2 text-center align-middle font-mono text-muted-foreground">
                                                                        {(permohonan.from ||
                                                                            1) +
                                                                            indexNum}
                                                                    </TableCell>

                                                                    {/* Tanggal Pengajuan */}
                                                                    <TableCell className="w-[190px] min-w-[180px] px-2 align-middle leading-snug break-words whitespace-normal text-foreground">
                                                                        {item.created_at
                                                                            ? new Date(
                                                                                  item.created_at,
                                                                              ).toLocaleDateString(
                                                                                  'id-ID',
                                                                                  {
                                                                                      weekday:
                                                                                          'long',
                                                                                      day: 'numeric',
                                                                                      month: 'long',
                                                                                      year: 'numeric',
                                                                                  },
                                                                              )
                                                                            : '-'}
                                                                    </TableCell>

                                                                    {/* Nomor Arsip */}
                                                                    <TableCell className="w-[170px] min-w-[165px] px-2 align-middle font-mono font-medium whitespace-nowrap text-primary">
                                                                        {item
                                                                            .arsip
                                                                            ?.nomor_arsip ||
                                                                            '-'}
                                                                    </TableCell>

                                                                    {/* Judul Arsip */}
                                                                    <TableCell className="min-w-[220px] px-2 align-middle leading-snug font-medium break-words whitespace-normal text-foreground uppercase">
                                                                        {item
                                                                            .arsip
                                                                            ?.judul ||
                                                                            '-'}
                                                                    </TableCell>

                                                                    {/* Pemohon & Unit */}
                                                                    {!isOperator && (
                                                                        <TableCell className="w-[210px] min-w-[200px] px-2 align-middle leading-tight break-words whitespace-normal text-muted-foreground">
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="font-medium text-foreground">
                                                                                    {item
                                                                                        .pemohon
                                                                                        ?.name ||
                                                                                        '-'}
                                                                                </span>
                                                                                <span className="text-[11px] text-muted-foreground">
                                                                                    {item
                                                                                        .arsip
                                                                                        ?.unit_organisasi
                                                                                        ?.nama ||
                                                                                        '-'}
                                                                                </span>
                                                                            </div>
                                                                        </TableCell>
                                                                    )}

                                                                    {/* Tujuan Peminjaman */}
                                                                    <TableCell className="min-w-[200px] px-2 align-middle leading-relaxed break-words whitespace-normal text-muted-foreground">
                                                                        {
                                                                            item.alasan
                                                                        }
                                                                    </TableCell>

                                                                    {/* Status Peminjaman */}
                                                                    <TableCell className="w-[150px] min-w-[140px] px-2 align-middle whitespace-nowrap">
                                                                        {peminjamanStatusBadge(
                                                                            item.status,
                                                                        )}
                                                                    </TableCell>

                                                                    {/* Aksi */}
                                                                    <TableCell className="w-[140px] px-2 text-center align-middle whitespace-nowrap">
                                                                        {isOperator ? (
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                {item.status ===
                                                                                    'approved' &&
                                                                                    item
                                                                                        .arsip
                                                                                        ?.id && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-7 w-7 text-muted-foreground"
                                                                                            title="Lihat Detail Arsip"
                                                                                            onClick={() =>
                                                                                                openDetail(
                                                                                                    item
                                                                                                        .arsip!
                                                                                                        .id,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Eye className="h-4 w-4" />
                                                                                        </Button>
                                                                                    )}
                                                                                {item.status ===
                                                                                    'rejected' &&
                                                                                    item.arsip && (
                                                                                        <Button
                                                                                            variant="secondary"
                                                                                            size="sm"
                                                                                            className="h-7 px-2 text-xs"
                                                                                            title="Ajukan Kembali"
                                                                                            onClick={() =>
                                                                                                setAjukanArsip(
                                                                                                    item.arsip as Arsip,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Ajukan
                                                                                            Lagi
                                                                                        </Button>
                                                                                    )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                {item.status ===
                                                                                    'pending' &&
                                                                                    canApprove && (
                                                                                        <>
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                className="h-7 border-emerald-600/30 bg-emerald-50/50 px-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                                                                                                onClick={() =>
                                                                                                    setReviewItem(
                                                                                                        {
                                                                                                            peminjaman:
                                                                                                                item,
                                                                                                            action: 'approve',
                                                                                                        },
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <Check className="mr-1 h-3 w-3" />
                                                                                                Setujui
                                                                                            </Button>
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                className="h-7 border-destructive/30 bg-destructive/5 px-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                                                                                                onClick={() =>
                                                                                                    setReviewItem(
                                                                                                        {
                                                                                                            peminjaman:
                                                                                                                item,
                                                                                                            action: 'reject',
                                                                                                        },
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <X className="mr-1 h-3 w-3" />
                                                                                                Tolak
                                                                                            </Button>
                                                                                        </>
                                                                                    )}
                                                                                {item.status ===
                                                                                    'approved' &&
                                                                                    item
                                                                                        .arsip
                                                                                        ?.id && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-7 w-7 text-muted-foreground"
                                                                                            title="Lihat Detail Arsip"
                                                                                            onClick={() =>
                                                                                                openDetail(
                                                                                                    item
                                                                                                        .arsip!
                                                                                                        .id,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Eye className="h-4 w-4" />
                                                                                        </Button>
                                                                                    )}
                                                                            </div>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <DataTablePagination
                                            data={permohonan}
                                            itemName="permohonan"
                                            perPage={
                                                filters.per_page ?? undefined
                                            }
                                            onPerPageChange={(val) =>
                                                updateFilters({ per_page: val })
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        </ContentCard>
                    </TabsContent>
                </Tabs>

                {/* Dialogs */}
                {ajukanArsip && (
                    <AjukanDialog
                        arsip={ajukanArsip}
                        onClose={() => setAjukanArsip(null)}
                    />
                )}
                {reviewItem && (
                    <ReviewDialog
                        peminjaman={reviewItem.peminjaman}
                        action={reviewItem.action}
                        onClose={() => setReviewItem(null)}
                    />
                )}
                {bulkAction && validSelectedIds.length > 0 && (
                    <BulkReviewDialog
                        ids={validSelectedIds}
                        action={bulkAction}
                        onClose={() => setBulkAction(null)}
                        onSuccess={() => {
                            setSelectedIds([]);
                            setIsSelectionMode(false);
                        }}
                    />
                )}

                {detailArsip && (
                    <ArsipDetailDialog
                        open={!!detailArsip}
                        onClose={() => setDetailArsip(null)}
                        arsip={detailArsip}
                        workflowHistory={detailHistory}
                        allowedTransitions={detailTransitions}
                    />
                )}
            </PageContainer>
        </RouteGuard>
    );
}

PeminjamanIndex.layout = {
    breadcrumbs: [
        { title: 'PENGELOLAAN' },
        { title: 'Peminjaman Arsip', href: '/peminjaman' },
    ],
};
