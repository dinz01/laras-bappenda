import { Head, router, usePage } from '@inertiajs/react';
import { format, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    Eye,
    FileSignature,
    MoreHorizontal,
    Pencil,
    RotateCcw,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ContentCard } from '@/components/Cards/content-card';
import type { KlasifikasiArsipOption } from '@/components/klasifikasi-arsip-select';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import type { LokasiArsipOption } from '@/components/lokasi-arsip-select';
import { RouteGuard } from '@/components/RouteGuard';
import { DataTablePagination } from '@/components/Tables/data-table-pagination';
import { EmptyTable } from '@/components/Tables/empty-table';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { UnitOrganisasiOption } from '@/components/unit-organisasi-select';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import { ArsipDetailDialog } from '@/pages/arsip/detail-dialog';
import { ArsipEditDialog } from '@/pages/arsip/edit-dialog';
import { index } from '@/routes/kelola-tte';

type MasterItem = { id: number; kode: string; nama: string };

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    tanggal_arsip: string;
    kategori_arsip?: MasterItem | null;
    klasifikasi_arsip?: MasterItem | null;
    unit_organisasi?: MasterItem | null;
    creator?: { id: number; name: string } | null;
    dokumen?: { mime_type: string } | null;
};

type PaginatedArsips = {
    data: Arsip[];
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
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
        unit_organisasi_id?: number | null;
        pengunggah?: string;
        per_page?: number | null;
    };
    pengunggahList?: { id: number; name: string }[];
    klasifikasis?: KlasifikasiArsipOption[];
    kategoriArsips?: MasterItem[];
    jenisArsips?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    unitOrganisasis?: UnitOrganisasiOption[];
    filterKlasifikasis?: KlasifikasiArsipOption[];
    filterUnitOrganisasis?: UnitOrganisasiOption[];
    filterKategoriArsips?: MasterItem[];
    lokasiArsips?: LokasiArsipOption[];
    kondisiArsips?: MasterItem[];
    tingkatAksesArsips?: MasterItem[];
};

export default function KelolaTteIndex({
    arsips,
    filters = {},
    pengunggahList = [],
    klasifikasis = [],
    kategoriArsips = [],
    jenisArsips = [],
    sifatArsips = [],
    tingkatPerkembanganArsips = [],
    unitOrganisasis = [],
    filterKlasifikasis,
    filterUnitOrganisasis,
    filterKategoriArsips,
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
    const { auth } = usePage<any>().props;
    const [columnFilters, setColumnFilters] = useState({
        tanggal_arsip: filters.tanggal_arsip || '',
        nomor_arsip: filters.nomor_arsip || '',
        judul: filters.judul || '',
        pengunggah: filters.pengunggah || '',
    });
    const [dateFilterOpen, setDateFilterOpen] = useState(false);

    const [signingArsip, setSigningArsip] = useState<Arsip | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkSignOpen, setIsBulkSignOpen] = useState(false);
    const [bulkPassphrase, setBulkPassphrase] = useState('');
    const [bulkCatatan, setBulkCatatan] = useState('');
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const [nikPimpinan, setNikPimpinan] = useState(auth.user?.nik || '');
    const [passphrase, setPassphrase] = useState('');
    const [catatan, setCatatan] = useState('');
    const [processing, setProcessing] = useState(false);

    const [detailArsip, setDetailArsip] = useState<any>(null);
    const [detailHistory, setDetailHistory] = useState<any[]>([]);
    const [detailTransitions, setDetailTransitions] = useState<any[]>([]);
    const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

    // Edit modal states
    const [editingArsip, setEditingArsip] = useState<any>(null);
    const [loadingEditId, setLoadingEditId] = useState<number | null>(null);

    const { can } = usePermission();
    const canSign = can('kelola-tte.sign');
    const canUpdate = can('kelola-tte.update');

    const isAllSelected =
        arsips.data.length > 0 && selectedIds.length === arsips.data.length;
    const isSomeSelected =
        selectedIds.length > 0 && selectedIds.length < arsips.data.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(arsips.data.map((a) => a.id));
        }
    };

    const toggleSelectOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const updateFilters = (
        newParams: Record<string, string | number | null | undefined>,
    ) => {
        const params = { ...filters, ...newParams };
        Object.keys(params).forEach((key) => {
            if (
                params[key as keyof typeof params] === '' ||
                params[key as keyof typeof params] == null ||
                params[key as keyof typeof params] === 'all'
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

            (['tanggal_arsip', 'nomor_arsip', 'judul'] as const).forEach(
                (key) => {
                    if (columnFilters[key] !== (filters[key] || '')) {
                        changed[key] = columnFilters[key] || null;
                        hasChange = true;
                    }
                },
            );

            if (hasChange) {
                updateFilters(changed);
            }
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnFilters]);

    const handleTextChange = (field: string, value: string) => {
        setColumnFilters((prev) => ({ ...prev, [field]: value }));
    };

    const clearAllFilters = () => {
        setColumnFilters({
            tanggal_arsip: '',
            nomor_arsip: '',
            judul: '',
            pengunggah: '',
        });
        setDateFilterOpen(false);
        router.get(
            index().url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const hasAnyFilter =
        !!filters.search ||
        !!filters.tanggal_arsip ||
        !!filters.nomor_arsip ||
        !!filters.judul ||
        !!filters.kategori_arsip_id ||
        !!filters.klasifikasi_arsip_id ||
        !!filters.unit_organisasi_id ||
        !!filters.pengunggah;

    const openDetail = async (id: number) => {
        setLoadingDetailId(id);

        try {
            const response = await fetch(`/arsip/${id}/detail-json`, {
                headers: { Accept: 'application/json' },
            });
            const data = await response.json();
            setDetailArsip(data.arsip);
            setDetailHistory(data.workflowHistory || []);
            setDetailTransitions(data.allowedTransitions || []);
        } catch {
            toast.error('Gagal memuat detail arsip.');
        } finally {
            setLoadingDetailId(null);
        }
    };

    const openEdit = async (arsip: Arsip) => {
        setLoadingEditId(arsip.id);

        try {
            const response = await fetch(`/arsip/${arsip.id}/detail-json`, {
                headers: { Accept: 'application/json' },
            });
            const data = await response.json();
            setEditingArsip(data.arsip);
        } catch {
            toast.error('Gagal memuat data arsip untuk diedit.');
        } finally {
            setLoadingEditId(null);
        }
    };

    const handleSign = (e: React.FormEvent) => {
        e.preventDefault();

        if (!signingArsip) {
            return;
        }

        setProcessing(true);
        router.post(
            `/arsip/${signingArsip.id}/ajukan-tte`,
            {
                nik_pimpinan: auth.user?.nik || nikPimpinan,
                passphrase,
                catatan,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSigningArsip(null);
                    setPassphrase('');
                    setCatatan('');
                },
                onError: (errors: any) => {
                    toast.error(
                        errors.message ||
                            errors.passphrase ||
                            'Gagal menandatangani arsip.',
                    );
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const handleBulkSign = (e: React.FormEvent) => {
        e.preventDefault();
        setBulkProcessing(true);
        router.post(
            '/arsip/bulk-ajukan-tte',
            {
                ids: selectedIds,
                nik_pimpinan: auth.user?.nik || nikPimpinan,
                passphrase: bulkPassphrase,
                catatan: bulkCatatan,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsBulkSignOpen(false);
                    setSelectedIds([]);
                    setIsSelectionMode(false);
                    setBulkPassphrase('');
                    setBulkCatatan('');
                },
                onError: (errors: any) => {
                    toast.error(
                        errors.message ||
                            errors.passphrase ||
                            'Gagal menandatangani arsip massal.',
                    );
                },
                onFinish: () => {
                    setBulkProcessing(false);
                },
            },
        );
    };

    return (
        <RouteGuard permission="kelola-tte.view">
            <Head title="Kelola TTE" />
            <PageContainer>
                <PageHeader
                    title="Kelola TTE"
                    description="Daftar berkas arsip yang telah disetujui dan menunggu proses tanda tangan elektronik."
                    breadcrumb={[
                        { title: 'PENGELOLAAN' },
                        { title: 'Kelola TTE' },
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
                            {canSign &&
                                arsips.data.length > 0 &&
                                (isSelectionMode ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setIsSelectionMode(false);
                                            setSelectedIds([]);
                                        }}
                                        className="h-9"
                                    >
                                        Batal Pilih
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsSelectionMode(true)}
                                        className="h-9 gap-1.5"
                                    >
                                        Pilih Arsip
                                    </Button>
                                ))}
                        </div>
                    }
                />

                <ContentCard
                    title="Antrian Tanda Tangan Elektronik"
                    description="Gunakan baris filter per kolom di bawah judul tabel untuk menyaring antrian TTE."
                >
                    <div className="space-y-4">
                        {isSelectionMode && (
                            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
                                <span className="font-medium text-foreground">
                                    {selectedIds.length} arsip dipilih untuk TTE
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedIds([])}
                                        disabled={selectedIds.length === 0}
                                        className="h-8 text-xs"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setBulkPassphrase('');
                                            setBulkCatatan('');
                                            setNikPimpinan(
                                                auth.user?.nik || '',
                                            );
                                            setIsBulkSignOpen(true);
                                        }}
                                        disabled={selectedIds.length === 0}
                                        className="h-8 text-xs"
                                    >
                                        Tandatangani ({selectedIds.length})
                                    </Button>
                                </div>
                            </div>
                        )}

                        {arsips.data.length === 0 && !hasAnyFilter ? (
                            <EmptyTable
                                title="Tidak ada arsip menunggu TTE"
                                description="Semua berkas yang disetujui telah ditandatangani."
                                icon={FileSignature}
                            />
                        ) : (
                            <>
                                <div className="relative w-full overflow-x-auto rounded-lg border border-border/70 shadow-xs">
                                    <Table className="w-full min-w-[1800px] border-collapse text-xs">
                                        <TableHeader className="bg-muted/60">
                                            {/* Baris 1: Judul Kolom Header */}
                                            <TableRow className="border-b border-border/60 hover:bg-transparent">
                                                {isSelectionMode && (
                                                    <TableHead className="w-[45px] px-2 py-3 text-center font-bold">
                                                        <div className="flex justify-center">
                                                            <Checkbox
                                                                checked={
                                                                    isAllSelected
                                                                        ? true
                                                                        : isSomeSelected
                                                                          ? 'indeterminate'
                                                                          : false
                                                                }
                                                                onCheckedChange={
                                                                    toggleSelectAll
                                                                }
                                                                aria-label="Pilih semua arsip pada halaman ini"
                                                                className="h-4 w-4"
                                                            />
                                                        </div>
                                                    </TableHead>
                                                )}
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
                                                <TableHead className="w-[210px] min-w-[200px] px-2 py-3 font-bold text-foreground">
                                                    UNIT PENGOLAH
                                                </TableHead>
                                                <TableHead className="w-[180px] min-w-[170px] px-2 py-3 font-bold text-foreground">
                                                    PENGUNGGAH
                                                </TableHead>
                                                <TableHead className="w-[130px] min-w-[125px] px-2 py-3 text-center font-bold text-foreground">
                                                    AKSI
                                                </TableHead>
                                            </TableRow>

                                            {/* Baris 2: Input & Dropdown Filter Per Kolom */}
                                            <TableRow className="border-b border-border/70 bg-muted/30 hover:bg-muted/30">
                                                {isSelectionMode && (
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
                                                <TableHead className="p-2">
                                                    <Popover
                                                        open={unitFilterOpen}
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
                                                        <PopoverTrigger asChild>
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
                                                <TableHead className="p-2">
                                                    <Select
                                                        value={
                                                            filters.pengunggah ||
                                                            'all'
                                                        }
                                                        onValueChange={(val) =>
                                                            updateFilters({
                                                                pengunggah:
                                                                    val ===
                                                                    'all'
                                                                        ? null
                                                                        : val,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="!h-auto min-h-8 w-full border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal *:data-[slot=select-value]:!line-clamp-none *:data-[slot=select-value]:!break-words *:data-[slot=select-value]:!whitespace-normal [&>span]:line-clamp-none [&>span]:font-sans [&>span]:text-sm [&>span]:font-normal [&>span]:break-words [&>span]:whitespace-normal">
                                                            <SelectValue placeholder="Semua Pengunggah" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            align="start"
                                                            className="max-h-[300px] text-sm"
                                                        >
                                                            <SelectItem value="all">
                                                                Semua Pengunggah
                                                            </SelectItem>
                                                            {pengunggahList.map(
                                                                (u) => (
                                                                    <SelectItem
                                                                        key={
                                                                            u.id
                                                                        }
                                                                        value={
                                                                            u.name
                                                                        }
                                                                    >
                                                                        {u.name}
                                                                    </SelectItem>
                                                                ),
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
                                            {arsips.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={
                                                            isSelectionMode
                                                                ? 10
                                                                : 9
                                                        }
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        Tidak ada antrian arsip
                                                        yang cocok dengan
                                                        kriteria filter.
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
                                                                data-state={
                                                                    selectedIds.includes(
                                                                        arsip.id,
                                                                    )
                                                                        ? 'selected'
                                                                        : undefined
                                                                }
                                                                className="cursor-pointer transition-colors hover:bg-muted/40"
                                                                onClick={() =>
                                                                    openDetail(
                                                                        arsip.id,
                                                                    )
                                                                }
                                                            >
                                                                {/* Checkbox massal */}
                                                                {isSelectionMode && (
                                                                    <TableCell
                                                                        className="w-[45px] px-2 text-center align-middle"
                                                                        onClick={(
                                                                            e,
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        <Checkbox
                                                                            checked={selectedIds.includes(
                                                                                arsip.id,
                                                                            )}
                                                                            onCheckedChange={() =>
                                                                                toggleSelectOne(
                                                                                    arsip.id,
                                                                                )
                                                                            }
                                                                            aria-label={`Pilih arsip ${arsip.nomor_arsip}`}
                                                                            className="h-4 w-4"
                                                                        />
                                                                    </TableCell>
                                                                )}

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
                                                                <TableCell className="w-[210px] min-w-[200px] px-2 align-middle leading-tight break-words whitespace-normal text-muted-foreground">
                                                                    {arsip
                                                                        .unit_organisasi
                                                                        ?.nama ||
                                                                        '-'}
                                                                </TableCell>

                                                                {/* Pengunggah */}
                                                                <TableCell className="w-[180px] min-w-[170px] px-2 align-middle leading-tight break-words whitespace-normal text-muted-foreground">
                                                                    {arsip
                                                                        .creator
                                                                        ?.name ||
                                                                        '-'}
                                                                </TableCell>

                                                                {/* Aksi */}
                                                                <TableCell
                                                                    className="w-[130px] min-w-[125px] px-2 text-center align-middle whitespace-nowrap"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        {!isSelectionMode &&
                                                                            canSign && (
                                                                                <Button
                                                                                    variant="default"
                                                                                    size="sm"
                                                                                    className="h-7 px-2 text-xs"
                                                                                    onClick={() => {
                                                                                        setNikPimpinan(
                                                                                            auth
                                                                                                .user
                                                                                                ?.nik ||
                                                                                                '',
                                                                                        );
                                                                                        setPassphrase(
                                                                                            '',
                                                                                        );
                                                                                        setCatatan(
                                                                                            '',
                                                                                        );
                                                                                        setSigningArsip(
                                                                                            arsip,
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    Tandatangani
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
                                                                                {canUpdate && (
                                                                                    <DropdownMenuItem
                                                                                        disabled={
                                                                                            loadingEditId ===
                                                                                            arsip.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            openEdit(
                                                                                                arsip,
                                                                                            )
                                                                                        }
                                                                                        className="flex cursor-pointer items-center gap-2"
                                                                                    >
                                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                                        Edit
                                                                                        Arsip
                                                                                    </DropdownMenuItem>
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

                {/* Dialog Single Sign */}
                {signingArsip && (
                    <Dialog
                        open={!!signingArsip}
                        onOpenChange={(open) =>
                            !open && !processing && setSigningArsip(null)
                        }
                    >
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Tanda Tangan Elektronik
                                </DialogTitle>
                                <DialogDescription>
                                    Terapkan TTE digital resmi pada berkas arsip{' '}
                                    <strong>{signingArsip.nomor_arsip}</strong>.
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                onSubmit={handleSign}
                                className="space-y-3 py-2"
                            >
                                <div className="space-y-1">
                                    <Label htmlFor="nik" className="text-xs">
                                        NIK Pimpinan
                                    </Label>
                                    <Input
                                        id="nik"
                                        value={
                                            auth.user?.nik || nikPimpinan || '-'
                                        }
                                        disabled
                                        readOnly
                                        className="cursor-not-allowed bg-muted text-xs"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        NIK otomatis diambil dari data akun
                                        pimpinan yang terdaftar.
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <Label
                                        htmlFor="passphrase"
                                        className="text-xs"
                                    >
                                        Passphrase TTE
                                    </Label>
                                    <Input
                                        id="passphrase"
                                        type="text"
                                        value={passphrase}
                                        onChange={(e) =>
                                            setPassphrase(e.target.value)
                                        }
                                        placeholder="Masukkan Passphrase sertifikat TTE..."
                                        required
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label
                                        htmlFor="catatan-tte"
                                        className="text-xs"
                                    >
                                        Catatan / Keterangan (Opsional)
                                    </Label>
                                    <Input
                                        id="catatan-tte"
                                        value={catatan}
                                        onChange={(e) =>
                                            setCatatan(e.target.value)
                                        }
                                        placeholder="Catatan persetujuan..."
                                        className="text-xs"
                                    />
                                </div>

                                <DialogFooter className="mt-4 flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSigningArsip(null)}
                                        disabled={processing}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            processing || !passphrase.trim()
                                        }
                                    >
                                        {processing
                                            ? 'Menandatangani...'
                                            : 'Tandatangani'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Dialog Bulk Sign */}
                <Dialog
                    open={isBulkSignOpen}
                    onOpenChange={(open) =>
                        !open && !bulkProcessing && setIsBulkSignOpen(false)
                    }
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                Tanda Tangan Elektronik ({selectedIds.length}{' '}
                                Arsip)
                            </DialogTitle>
                            <DialogDescription>
                                Anda akan membubuhkan TTE pada{' '}
                                <strong>{selectedIds.length} arsip</strong>{' '}
                                sekaligus.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleBulkSign}
                            className="space-y-3 py-2"
                        >
                            <div className="space-y-1">
                                <Label htmlFor="bulk-nik" className="text-xs">
                                    NIK Pimpinan
                                </Label>
                                <Input
                                    id="bulk-nik"
                                    value={auth.user?.nik || nikPimpinan || '-'}
                                    disabled
                                    readOnly
                                    className="cursor-not-allowed bg-muted text-xs"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    NIK otomatis diambil dari data akun pimpinan
                                    yang terdaftar.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="bulk-passphrase"
                                    className="text-xs"
                                >
                                    Passphrase TTE
                                </Label>
                                <Input
                                    id="bulk-passphrase"
                                    type="text"
                                    value={bulkPassphrase}
                                    onChange={(e) =>
                                        setBulkPassphrase(e.target.value)
                                    }
                                    placeholder="Masukkan Passphrase sertifikat TTE..."
                                    required
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="bulk-catatan"
                                    className="text-xs"
                                >
                                    Catatan / Keterangan (Opsional)
                                </Label>
                                <Input
                                    id="bulk-catatan"
                                    value={bulkCatatan}
                                    onChange={(e) =>
                                        setBulkCatatan(e.target.value)
                                    }
                                    placeholder="Catatan persetujuan..."
                                    className="text-xs"
                                />
                            </div>

                            <DialogFooter className="mt-4 flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsBulkSignOpen(false)}
                                    disabled={bulkProcessing}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        bulkProcessing || !bulkPassphrase.trim()
                                    }
                                >
                                    {bulkProcessing
                                        ? 'Memproses...'
                                        : `Tandatangani Semua (${selectedIds.length})`}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

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
            </PageContainer>
        </RouteGuard>
    );
}

KelolaTteIndex.layout = {
    breadcrumbs: [
        { title: 'PENGELOLAAN' },
        { title: 'Kelola TTE', href: '/kelola-tte' },
    ],
};
