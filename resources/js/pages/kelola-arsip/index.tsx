import { Head, router, usePage } from '@inertiajs/react';
import { format, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Archive,
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import type { KlasifikasiArsipOption } from '@/components/klasifikasi-arsip-select';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import type { LokasiArsipOption } from '@/components/lokasi-arsip-select';
import { RouteGuard } from '@/components/RouteGuard';
import { DataTablePagination } from '@/components/Tables/data-table-pagination';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import type { UnitOrganisasiOption } from '@/components/unit-organisasi-select';
import { cn } from '@/lib/utils';
import {
    workflowStatusLabel,
    workflowStatusVariant,
} from '@/lib/workflow-status';
import type { WorkflowStatus } from '@/lib/workflow-status';
import { usePermission } from '@/hooks/use-permission';
import { index } from '@/routes/kelola-arsip';
import { ArsipCreateDialog } from '../arsip/create-dialog';
import type { MasterItem } from '../arsip/create-dialog';
import { ArsipDetailDialog } from '../arsip/detail-dialog';
import type { DetailArsip } from '../arsip/detail-dialog';
import { ArsipEditDialog } from '../arsip/edit-dialog';

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    kategori_arsip_id?: number | null;
    no_register?: string | null;
    nop?: string | null;
    npwpd?: string | null;
    nama_wajib_pajak?: string | null;
    kategori_arsip?: MasterItem | null;
    klasifikasi_arsip_id: number;
    lokasi_arsip_id: number | null;
    jenis_arsip_id: number | null;
    sifat_arsip_id: number | null;
    tingkat_perkembangan_arsip_id: number | null;
    media_arsip_id: number | null;
    kondisi_arsip_id: number | null;
    tingkat_akses_arsip_id: number | null;
    retensi_arsip_id: number | null;
    unit_organisasi_id: number | null;
    created_by: number | null;
    workflow_status: WorkflowStatus;
    catatan_revisi: string | null;
    klasifikasi_arsip?: MasterItem | null;
    lokasi_arsip?: MasterItem | null;
    unit_organisasi?: MasterItem | null;
    creator?: { id: number; name: string } | null;
    dokumen?: {
        id: number;
        nama_original: string;
        nama_generated: string;
        ukuran: number;
        mime_type: string;
        path_penyimpanan: string;
        uploaded_at: string | null;
    } | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type PaginatedArsips = {
    data: Arsip[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: PaginationLink[];
};

type IndexProps = {
    arsips: PaginatedArsips;
    filters?: {
        search?: string;
        tanggal_arsip?: string;
        nomor_arsip?: string;
        judul?: string;
        kategori_arsip_id?: number | null;
        klasifikasi_arsip_id?: number | null;
        catatan_revisi?: string;
        unit_organisasi_id?: number | null;
        workflow_status?: string | null;
        per_page?: number | null;
    };
    showUnitFilter?: boolean;
    klasifikasis?: KlasifikasiArsipOption[];
    kategoriArsips?: MasterItem[];
    unitOrganisasis?: UnitOrganisasiOption[];
    filterKlasifikasis?: KlasifikasiArsipOption[];
    filterUnitOrganisasis?: UnitOrganisasiOption[];
    filterKategoriArsips?: MasterItem[];
    filterWorkflowStatuses?: string[];
    jenisArsips?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    lokasiArsips?: LokasiArsipOption[];
    kondisiArsips?: MasterItem[];
    tingkatAksesArsips?: MasterItem[];
};

export default function KelolaArsipIndex({
    arsips,
    filters = {},
    showUnitFilter = true,
    klasifikasis = [],
    kategoriArsips = [],
    unitOrganisasis = [],
    filterKlasifikasis,
    filterUnitOrganisasis,
    filterKategoriArsips,
    filterWorkflowStatuses,
    jenisArsips = [],
    sifatArsips = [],
    tingkatPerkembanganArsips = [],
    lokasiArsips = [],
    kondisiArsips = [],
    tingkatAksesArsips = [],
}: IndexProps) {
    const activeKlasifikasis = filterKlasifikasis ?? klasifikasis;
    const activeUnitOrganisasis = filterUnitOrganisasis ?? unitOrganisasis;
    const activeKategoriArsips = filterKategoriArsips ?? kategoriArsips;

    const [klasifikasiFilterOpen, setKlasifikasiFilterOpen] = useState(false);
    const [klasifikasiSearch, setKlasifikasiSearch] = useState('');

    const hierarchicalKlasifikasiOptions = useMemo(() => {
        const map = new Map<number, KlasifikasiArsipOption>();
        activeKlasifikasis.forEach((k) => map.set(k.id, k));

        const childrenMap = new Map<number | null, KlasifikasiArsipOption[]>();
        activeKlasifikasis.forEach((k) => {
            const pId = k.parent_id ?? null;

            if (!childrenMap.has(pId)) {
                childrenMap.set(pId, []);
            }

            childrenMap.get(pId)!.push(k);
        });

        const getAncestors = (
            item: KlasifikasiArsipOption,
        ): KlasifikasiArsipOption[] => {
            const ancestors: KlasifikasiArsipOption[] = [];
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
            KlasifikasiArsipOption & {
                depth: number;
                path: string;
                breadcrumb: string;
            }
        > = [];

        const traverse = (parentId: number | null, depth: number) => {
            const children = childrenMap.get(parentId) ?? [];

            for (const child of children) {
                const ancestors = getAncestors(child);
                const path = [
                    ...ancestors.map((a) => `${a.kode} - ${a.nama}`),
                    `${child.kode} - ${child.nama}`,
                ].join(' › ');
                const breadcrumb = ancestors
                    .map((a) => `${a.kode} - ${a.nama}`)
                    .join(' › ');

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

        if (result.length < activeKlasifikasis.length) {
            const addedIds = new Set(result.map((r) => r.id));
            activeKlasifikasis.forEach((k) => {
                if (!addedIds.has(k.id)) {
                    result.push({
                        ...k,
                        depth: 0,
                        path: `${k.kode} - ${k.nama}`,
                        breadcrumb: '',
                    });
                }
            });
        }

        return result;
    }, [activeKlasifikasis]);

    const filteredKlasifikasis = useMemo(() => {
        if (!klasifikasiSearch.trim()) {
            return hierarchicalKlasifikasiOptions;
        }

        const q = klasifikasiSearch.toLowerCase();

        return hierarchicalKlasifikasiOptions.filter(
            (item) =>
                item.nama.toLowerCase().includes(q) ||
                item.kode.toLowerCase().includes(q) ||
                item.path.toLowerCase().includes(q),
        );
    }, [hierarchicalKlasifikasiOptions, klasifikasiSearch]);

    const selectedKlasifikasi = useMemo(() => {
        if (!filters.klasifikasi_arsip_id) {
            return null;
        }

        return (
            hierarchicalKlasifikasiOptions.find(
                (item) =>
                    item.id.toString() ===
                    filters.klasifikasi_arsip_id?.toString(),
            ) || null
        );
    }, [hierarchicalKlasifikasiOptions, filters.klasifikasi_arsip_id]);

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
        catatan_revisi: filters.catatan_revisi || '',
    });
    const [dateFilterOpen, setDateFilterOpen] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingArsip, setEditingArsip] = useState<Arsip | null>(null);
    const [detailArsip, setDetailArsip] = useState<DetailArsip | null>(null);
    const [detailHistory, setDetailHistory] = useState([]);
    const [detailTransitions, setDetailTransitions] = useState([]);
    const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
    const [deleteArsipId, setDeleteArsipId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const { auth } = usePage<{
        auth: {
            user: {
                roles?: string[];
                unit_organisasi_id?: number | null;
            } | null;
        };
    }>().props;
    const { can } = usePermission();
    const canCreate = can('kelola-arsip.create');
    const canUpdate = can('kelola-arsip.update');
    const canDelete = can('kelola-arsip.delete');

    const isSuperAdmin =
        auth.user?.roles?.includes('Super Administrator') ?? false;

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
                [
                    'tanggal_arsip',
                    'nomor_arsip',
                    'judul',
                    'catatan_revisi',
                ] as const
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
            catatan_revisi: '',
        });
        setDateFilterOpen(false);
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

    const handleDelete = (id: number) => {
        setDeleteArsipId(id);
    };

    const confirmDelete = () => {
        if (!deleteArsipId) {
            return;
        }

        setDeleting(true);
        router.delete(`/arsip/${deleteArsipId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteArsipId(null);
            },
            onError: () => {
                toast.error('Gagal menghapus arsip.');
            },
            onFinish: () => {
                setDeleting(false);
            },
        });
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

    return (
        <RouteGuard permission="kelola-arsip.view">
            <Head title="Kelola Arsip" />
            <PageContainer>
                <PageHeader
                    title="Kelola Arsip"
                    description="Kelola draf, revisi, dan arsip yang perlu tindakan"
                    breadcrumb={[
                        { title: 'PENGELOLAAN' },
                        { title: 'Kelola Arsip' },
                    ]}
                    actions={
                        <div className="flex items-center gap-2">
                            {hasAnyFilter && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset Filter
                                </Button>
                            )}
                            {canCreate && (
                                <Button
                                    size="sm"
                                    onClick={() => setIsCreateOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Input Arsip
                                </Button>
                            )}
                        </div>
                    }
                />

                <ContentCard
                    title="Daftar Pengelolaan Arsip"
                    description="Gunakan baris filter per kolom di bawah judul tabel untuk menyaring antrian arsip."
                >
                    <div className="space-y-4">
                        {arsips.data.length === 0 && !hasAnyFilter ? (
                            <EmptyTable
                                title="Tidak ada arsip ditemukan"
                                description="Belum ada arsip yang memerlukan tindakan."
                                icon={Archive}
                            />
                        ) : (
                            <>
                                <div className="relative w-full overflow-x-auto rounded-lg border border-border/70 shadow-xs">
                                    <Table className="w-full min-w-[1800px] border-collapse text-xs">
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
                                                    KATEGORI
                                                </TableHead>
                                                <TableHead className="w-[210px] min-w-[200px] px-2 py-3 font-bold text-foreground">
                                                    KLASIFIKASI
                                                </TableHead>
                                                {showUnitFilter && (
                                                    <TableHead className="w-[210px] min-w-[200px] px-2 py-3 font-bold text-foreground">
                                                        UNIT PENGOLAH
                                                    </TableHead>
                                                )}
                                                <TableHead className="w-[120px] min-w-[110px] px-2 py-3 font-bold text-foreground">
                                                    STATUS
                                                </TableHead>
                                                <TableHead className="min-w-[180px] px-2 py-3 font-bold text-foreground">
                                                    CATATAN REVISI
                                                </TableHead>
                                                <TableHead className="w-[100px] px-2 py-3 text-center font-bold text-foreground">
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
                                                                e.target.value,
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
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                    />
                                                </TableHead>
                                                <TableHead className="p-2">
                                                    <Select
                                                        value={
                                                            filters.kategori_arsip_id
                                                                ? String(
                                                                      filters.kategori_arsip_id,
                                                                  )
                                                                : 'all'
                                                        }
                                                        onValueChange={(val) =>
                                                            updateFilters({
                                                                kategori_arsip_id:
                                                                    val ===
                                                                    'all'
                                                                        ? null
                                                                        : val,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="!h-auto min-h-8 w-full border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal *:data-[slot=select-value]:!line-clamp-none *:data-[slot=select-value]:!break-words *:data-[slot=select-value]:!whitespace-normal [&>span]:line-clamp-none [&>span]:font-sans [&>span]:text-sm [&>span]:font-normal [&>span]:break-words [&>span]:whitespace-normal">
                                                            <SelectValue placeholder="Semua Kategori" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            align="start"
                                                            className="max-h-[300px] text-sm"
                                                        >
                                                            <SelectItem value="all">
                                                                Semua Kategori
                                                            </SelectItem>
                                                            {activeKategoriArsips.map(
                                                                (opt) => (
                                                                    <SelectItem
                                                                        key={
                                                                            opt.id
                                                                        }
                                                                        value={opt.id.toString()}
                                                                    >
                                                                        {
                                                                            opt.nama
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableHead>
                                                <TableHead className="p-2">
                                                    <Popover
                                                        open={
                                                            klasifikasiFilterOpen
                                                        }
                                                        onOpenChange={(
                                                            open,
                                                        ) => {
                                                            setKlasifikasiFilterOpen(
                                                                open,
                                                            );

                                                            if (!open) {
                                                                setKlasifikasiSearch(
                                                                    '',
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={
                                                                    klasifikasiFilterOpen
                                                                }
                                                                className={cn(
                                                                    '!h-auto min-h-8 w-full justify-between gap-1 border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal hover:bg-background',
                                                                    !filters.klasifikasi_arsip_id &&
                                                                        'text-muted-foreground',
                                                                )}
                                                            >
                                                                <span className="line-clamp-2 font-sans text-sm font-normal break-words text-foreground">
                                                                    {selectedKlasifikasi
                                                                        ? `${selectedKlasifikasi.kode} - ${selectedKlasifikasi.nama}`
                                                                        : 'Semua Klasifikasi'}
                                                                </span>
                                                                <div className="ml-1 flex shrink-0 items-center gap-0.5">
                                                                    {selectedKlasifikasi && (
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
                                                                                        klasifikasi_arsip_id:
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
                                                                                            klasifikasi_arsip_id:
                                                                                                null,
                                                                                        },
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                            title="Hapus filter klasifikasi"
                                                                        >
                                                                            <X className="h-3.5 w-3.5" />
                                                                        </span>
                                                                    )}
                                                                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                                                                </div>
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-[480px] max-w-[90vw] p-0 text-sm shadow-lg"
                                                            align="start"
                                                        >
                                                            <div className="flex items-center border-b border-border/60 px-2 py-1.5">
                                                                <Search className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Cari klasifikasi arsip..."
                                                                    value={
                                                                        klasifikasiSearch
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setKlasifikasiSearch(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-7 w-full border-none bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-sm"
                                                                    autoFocus
                                                                />
                                                                {klasifikasiSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setKlasifikasiSearch(
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
                                                                                klasifikasi_arsip_id:
                                                                                    null,
                                                                            },
                                                                        );
                                                                        setKlasifikasiFilterOpen(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className={cn(
                                                                        'flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted/70',
                                                                        !filters.klasifikasi_arsip_id &&
                                                                            'bg-muted font-semibold text-primary',
                                                                    )}
                                                                >
                                                                    <span>
                                                                        Semua
                                                                        Klasifikasi
                                                                    </span>
                                                                    {!filters.klasifikasi_arsip_id && (
                                                                        <Check className="h-4 w-4" />
                                                                    )}
                                                                </button>

                                                                {filteredKlasifikasis.length ===
                                                                0 ? (
                                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                                        Klasifikasi
                                                                        tidak
                                                                        ditemukan
                                                                    </div>
                                                                ) : (
                                                                    filteredKlasifikasis.map(
                                                                        (
                                                                            opt,
                                                                        ) => {
                                                                            const isSelected =
                                                                                filters.klasifikasi_arsip_id?.toString() ===
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
                                                                                                klasifikasi_arsip_id:
                                                                                                    opt.id.toString(),
                                                                                            },
                                                                                        );
                                                                                        setKlasifikasiFilterOpen(
                                                                                            false,
                                                                                        );
                                                                                    }}
                                                                                    className={cn(
                                                                                        'flex w-full items-start justify-between rounded px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted/70',
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
                                                                                        <span className="leading-snug break-words whitespace-normal">
                                                                                            {opt.depth >
                                                                                                0 && (
                                                                                                <span className="mr-1.5 font-mono text-xs text-muted-foreground/80">
                                                                                                    {
                                                                                                        '↳'
                                                                                                    }
                                                                                                </span>
                                                                                            )}
                                                                                            <span className="font-mono font-medium">
                                                                                                {
                                                                                                    opt.kode
                                                                                                }
                                                                                            </span>{' '}
                                                                                            -{' '}
                                                                                            {
                                                                                                opt.nama
                                                                                            }
                                                                                        </span>
                                                                                        {klasifikasiSearch.trim() &&
                                                                                            opt.breadcrumb && (
                                                                                                <span className="text-[11px] leading-tight break-words whitespace-normal text-muted-foreground">
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
                                                {showUnitFilter && (
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
                                                )}
                                                <TableHead className="p-2">
                                                    <Select
                                                        value={
                                                            filters.workflow_status ||
                                                            'all'
                                                        }
                                                        onValueChange={(val) =>
                                                            updateFilters({
                                                                workflow_status:
                                                                    val ===
                                                                    'all'
                                                                        ? null
                                                                        : val,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="!h-auto min-h-8 w-full border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal *:data-[slot=select-value]:!line-clamp-none *:data-[slot=select-value]:!break-words *:data-[slot=select-value]:!whitespace-normal [&>span]:line-clamp-none [&>span]:font-sans [&>span]:text-sm [&>span]:font-normal [&>span]:break-words [&>span]:whitespace-normal">
                                                            <SelectValue placeholder="Semua Status" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            align="start"
                                                            className="max-h-[300px] text-sm"
                                                        >
                                                            <SelectItem value="all">
                                                                Semua Status
                                                            </SelectItem>
                                                            {(!filterWorkflowStatuses ||
                                                                filterWorkflowStatuses.includes(
                                                                    'review',
                                                                )) && (
                                                                <SelectItem value="review">
                                                                    Menunggu
                                                                    Review
                                                                </SelectItem>
                                                            )}
                                                            {(!filterWorkflowStatuses ||
                                                                filterWorkflowStatuses.includes(
                                                                    'revisi',
                                                                )) && (
                                                                <SelectItem value="revisi">
                                                                    Perlu Revisi
                                                                </SelectItem>
                                                            )}
                                                            {(!filterWorkflowStatuses ||
                                                                filterWorkflowStatuses.includes(
                                                                    'waiting_tte',
                                                                )) && (
                                                                <SelectItem value="waiting_tte">
                                                                    Menunggu TTE
                                                                </SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableHead>
                                                <TableHead className="p-2">
                                                    <Input
                                                        placeholder="Cari catatan..."
                                                        value={
                                                            columnFilters.catatan_revisi
                                                        }
                                                        onChange={(e) =>
                                                            handleTextChange(
                                                                'catatan_revisi',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                    />
                                                </TableHead>
                                                <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                    -
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {arsips.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={
                                                            showUnitFilter
                                                                ? 10
                                                                : 9
                                                        }
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        Tidak ada data yang
                                                        cocok dengan kriteria
                                                        filter.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                arsips.data.map(
                                                    (arsip, indexNum) => {
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
                                                                key={arsip.id}
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

                                                                {/* Kategori */}
                                                                <TableCell className="w-[210px] min-w-[200px] px-2 align-middle break-words whitespace-normal">
                                                                    {arsip.kategori_arsip ? (
                                                                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                                                            {
                                                                                arsip
                                                                                    .kategori_arsip
                                                                                    .nama
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>

                                                                {/* Klasifikasi */}
                                                                <TableCell className="w-[210px] min-w-[200px] px-2 align-middle break-words whitespace-normal">
                                                                    {arsip.klasifikasi_arsip ? (
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-mono font-semibold text-foreground">
                                                                                {
                                                                                    arsip
                                                                                        .klasifikasi_arsip
                                                                                        .kode
                                                                                }
                                                                            </span>
                                                                            <span className="text-[11px] leading-tight text-muted-foreground">
                                                                                {
                                                                                    arsip
                                                                                        .klasifikasi_arsip
                                                                                        .nama
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>

                                                                {/* Unit Pengolah */}
                                                                {showUnitFilter && (
                                                                    <TableCell className="w-[210px] min-w-[200px] px-2 align-middle leading-tight break-words whitespace-normal text-muted-foreground">
                                                                        {arsip
                                                                            .unit_organisasi
                                                                            ?.nama ||
                                                                            '-'}
                                                                    </TableCell>
                                                                )}

                                                                {/* Status Workflow */}
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

                                                                {/* Catatan Revisi */}
                                                                <TableCell className="min-w-[180px] px-2 align-middle leading-relaxed break-words whitespace-normal text-muted-foreground">
                                                                    {arsip.workflow_status ===
                                                                        'revisi' &&
                                                                    arsip.catatan_revisi ? (
                                                                        <span className="font-medium text-destructive">
                                                                            {
                                                                                arsip.catatan_revisi
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted-foreground/60">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>

                                                                {/* Aksi */}
                                                                <TableCell
                                                                    className="w-[100px] px-2 text-center align-middle whitespace-nowrap"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        {arsip.workflow_status ===
                                                                            'revisi' && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="default"
                                                                                className="h-7 px-2 text-xs"
                                                                                onClick={() =>
                                                                                    setEditingArsip(
                                                                                        arsip,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Pencil className="mr-1 h-3 w-3" />
                                                                                Revisi
                                                                            </Button>
                                                                        )}
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger
                                                                                asChild
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-7 w-7 text-muted-foreground"
                                                                                >
                                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent
                                                                                align="end"
                                                                                className="w-36 text-xs"
                                                                            >
                                                                                <DropdownMenuItem
                                                                                    disabled={
                                                                                        loadingDetailId ===
                                                                                        arsip.id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        openDetail(
                                                                                            arsip.id,
                                                                                        )
                                                                                    }
                                                                                    className="flex cursor-pointer items-center gap-2"
                                                                                >
                                                                                    <Eye className="h-3.5 w-3.5" />
                                                                                    Detail
                                                                                </DropdownMenuItem>
                                                                                {canUpdate &&
                                                                                    arsip.workflow_status !==
                                                                                        'revisi' && (
                                                                                        <DropdownMenuItem
                                                                                            onClick={() =>
                                                                                                setEditingArsip(
                                                                                                    arsip,
                                                                                                )
                                                                                            }
                                                                                            className="flex cursor-pointer items-center gap-2"
                                                                                        >
                                                                                            <Pencil className="h-3.5 w-3.5" />
                                                                                            Edit
                                                                                        </DropdownMenuItem>
                                                                                    )}
                                                                                {canDelete && (
                                                                                    <>
                                                                                        <DropdownMenuSeparator />
                                                                                        <DropdownMenuItem
                                                                                            onClick={() =>
                                                                                                handleDelete(
                                                                                                    arsip.id,
                                                                                                )
                                                                                            }
                                                                                            className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                                                                        >
                                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                                            Hapus
                                                                                        </DropdownMenuItem>
                                                                                    </>
                                                                                )}
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
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

                                {/* Pagination */}
                                <DataTablePagination
                                    data={arsips}
                                    itemName="arsip"
                                    perPage={filters.per_page}
                                    onPerPageChange={(val) =>
                                        updateFilters({ per_page: val })
                                    }
                                />
                            </>
                        )}
                    </div>
                </ContentCard>

                <ArsipCreateDialog
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    klasifikasis={klasifikasis}
                    kategoriArsips={kategoriArsips}
                    unitOrganisasis={unitOrganisasis}
                    jenisArsips={jenisArsips}
                    sifatArsips={sifatArsips}
                    tingkatPerkembanganArsips={tingkatPerkembanganArsips}
                    lokasiArsips={lokasiArsips}
                    kondisiArsips={kondisiArsips}
                    tingkatAksesArsips={tingkatAksesArsips}
                />

                {editingArsip && (
                    <ArsipEditDialog
                        key={editingArsip.id}
                        open={!!editingArsip}
                        onClose={() => setEditingArsip(null)}
                        arsip={editingArsip}
                        klasifikasis={klasifikasis}
                        kategoriArsips={kategoriArsips}
                        unitOrganisasis={unitOrganisasis}
                        jenisArsips={jenisArsips}
                        sifatArsips={sifatArsips}
                        tingkatPerkembanganArsips={tingkatPerkembanganArsips}
                        lokasiArsips={lokasiArsips}
                        kondisiArsips={kondisiArsips}
                        tingkatAksesArsips={tingkatAksesArsips}
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

                <ConfirmDialog
                    isOpen={deleteArsipId !== null}
                    onClose={() => setDeleteArsipId(null)}
                    onConfirm={confirmDelete}
                    title="Hapus Arsip"
                    description="Apakah Anda yakin ingin menghapus arsip ini? Data yang sudah dihapus tidak dapat dipulihkan."
                    confirmLabel="Hapus"
                    loading={deleting}
                    destructive
                />
            </PageContainer>
        </RouteGuard>
    );
}

KelolaArsipIndex.layout = {
    breadcrumbs: [
        { title: 'PENGELOLAAN' },
        { title: 'Kelola Arsip', href: '/kelola-arsip' },
    ],
};
