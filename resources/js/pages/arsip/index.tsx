import { Head, Link, router } from '@inertiajs/react';
import { format, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Archive,
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    Eye,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Can } from '@/components/Can';
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
    isArsipEditable,
    workflowStatusLabel,
    workflowStatusVariant,
} from '@/lib/workflow-status';
import { index } from '@/routes/arsip';
import { index as kelolaArsipIndex } from '@/routes/kelola-arsip';
import type { MasterItem } from './create-dialog';
import { ArsipCreateDialog } from './create-dialog';
import { ArsipDetailDialog } from './detail-dialog';
import type { DetailArsip } from './detail-dialog';
import { ArsipEditDialog } from './edit-dialog';

type DokumenArsip = {
    id: number;
    nama_original: string;
    nama_generated: string;
    ukuran: number;
    mime_type: string;
    path_penyimpanan: string;
    uploaded_at: string | null;
};

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    kategori_arsip_id: number | null;
    no_register?: string | null;
    nop?: string | null;
    npwpd?: string | null;
    nama_wajib_pajak?: string | null;
    file_path: string | null;
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
    kategori_arsip?: MasterItem | null;
    klasifikasi_arsip?:
        | (MasterItem & {
              retensi_aktif?: number;
              retensi_inaktif?: number;
              nasib_akhir?: { id: number; nama: string } | null;
              parent?: any;
          })
        | null;
    lokasi_arsip?: MasterItem | null;
    kondisi_arsip?: MasterItem | null;
    tingkat_akses_arsip?: MasterItem | null;
    unit_organisasi?: MasterItem | null;
    creator?: { id: number; name: string } | null;
    dokumen?: DokumenArsip | null;
    workflow_status:
        | 'review'
        | 'revisi'
        | 'approved'
        | 'waiting_tte'
        | 'active'
        | 'inactive'
        | 'musnah'
        | 'permanen'
        | 'dinilai_kembali'
        | (string & {});
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

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

function getLokasiHierarchyPath(
    lokasi?: { id: number; nama: string; kode?: string; parent?: any } | null,
): string {
    if (!lokasi) {
        return '-';
    }

    const chain: string[] = [];
    let curr: any = lokasi;
    const visited = new Set<number>();

    while (curr && !visited.has(curr.id)) {
        visited.add(curr.id);
        chain.unshift(curr.nama);
        curr = curr.parent;
    }

    return chain.join(' › ');
}

function getKlasifikasiRetention(klasifikasi?: any): {
    retensiAktif: number | null;
    retensiInaktif: number | null;
    nasibAkhir: string | null;
} {
    if (!klasifikasi) {
        return { retensiAktif: null, retensiInaktif: null, nasibAkhir: null };
    }

    let curr: any = klasifikasi;
    let retensiAktif: number | null = null;
    let retensiInaktif: number | null = null;
    let nasibAkhir: string | null = null;
    const visited = new Set<number>();

    while (curr && !visited.has(curr.id)) {
        visited.add(curr.id);

        if (retensiAktif === null && curr.retensi_aktif != null) {
            retensiAktif = Number(curr.retensi_aktif);
        }

        if (retensiInaktif === null && curr.retensi_inaktif != null) {
            retensiInaktif = Number(curr.retensi_inaktif);
        }

        if (nasibAkhir === null && curr.nasib_akhir) {
            nasibAkhir =
                typeof curr.nasib_akhir === 'object'
                    ? curr.nasib_akhir.nama
                    : String(curr.nasib_akhir);
        }

        curr = curr.parent;
    }

    return { retensiAktif, retensiInaktif, nasibAkhir };
}

type IndexProps = {
    arsips: PaginatedArsips;
    klasifikasis?: KlasifikasiArsipOption[];
    kategoriArsips?: MasterItem[];
    unitOrganisasis?: UnitOrganisasiOption[];
    tahuns?: number[];
    statusArsips?: MasterItem[];
    jenisArsips?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    lokasiArsips?: LokasiArsipOption[];
    kondisiArsips?: MasterItem[];
    tingkatAksesArsips?: MasterItem[];
    filterKlasifikasis?: KlasifikasiArsipOption[];
    filterUnitOrganisasis?: UnitOrganisasiOption[];
    filterLokasiArsips?: LokasiArsipOption[];
    filterKategoriArsips?: MasterItem[];
    filterKondisiArsips?: MasterItem[];
    filterTingkatAksesArsips?: MasterItem[];
    filters?: {
        search?: string;
        tanggal_arsip?: string;
        nomor_arsip?: string;
        judul?: string;
        pajak?: string;
        nop?: string;
        unit_organisasi_id?: string;
        klasifikasi_arsip_id?: string;
        kategori_arsip_id?: string;
        kondisi_arsip_id?: string;
        tingkat_akses_arsip_id?: string;
        lokasi_arsip_id?: string;
        deskripsi?: string;
        tahun?: string;
        workflow_status?: string;
        per_page?: string;
    };
};

export default function Index({
    arsips,
    unitOrganisasis = [],
    klasifikasis = [],
    kategoriArsips = [],
    jenisArsips = [],
    lokasiArsips = [],
    sifatArsips = [],
    kondisiArsips = [],
    tingkatAksesArsips = [],
    tingkatPerkembanganArsips = [],
    filterKlasifikasis,
    filterUnitOrganisasis,
    filterLokasiArsips,
    filterKategoriArsips,
    filterKondisiArsips,
    filterTingkatAksesArsips,
    filters = {},
}: IndexProps) {
    const activeKlasifikasis = filterKlasifikasis ?? klasifikasis;
    const activeUnitOrganisasis = filterUnitOrganisasis ?? unitOrganisasis;
    const activeLokasiArsips = filterLokasiArsips ?? lokasiArsips;
    const activeKategoriArsips = filterKategoriArsips ?? kategoriArsips;
    const activeKondisiArsips = filterKondisiArsips ?? kondisiArsips;
    const activeTingkatAksesArsips =
        filterTingkatAksesArsips ?? tingkatAksesArsips;

    const [columnFilters, setColumnFilters] = useState({
        tanggal_arsip: filters.tanggal_arsip || '',
        nomor_arsip: filters.nomor_arsip || '',
        judul: filters.judul || '',
        pajak: filters.pajak || '',
        deskripsi: filters.deskripsi || '',
    });
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [lokasiFilterOpen, setLokasiFilterOpen] = useState(false);
    const [lokasiSearch, setLokasiSearch] = useState('');

    const hierarchicalLokasiOptions = useMemo(() => {
        const map = new Map<number, LokasiArsipOption>();
        activeLokasiArsips.forEach((loc) => map.set(loc.id, loc));

        const childrenMap = new Map<number | null, LokasiArsipOption[]>();
        activeLokasiArsips.forEach((loc) => {
            const pId = loc.parent_id ?? null;

            if (!childrenMap.has(pId)) {
                childrenMap.set(pId, []);
            }

            childrenMap.get(pId)!.push(loc);
        });

        const getAncestors = (item: LokasiArsipOption): LokasiArsipOption[] => {
            const ancestors: LokasiArsipOption[] = [];
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
            LokasiArsipOption & {
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

        if (result.length < activeLokasiArsips.length) {
            const addedIds = new Set(result.map((r) => r.id));
            activeLokasiArsips.forEach((loc) => {
                if (!addedIds.has(loc.id)) {
                    result.push({
                        ...loc,
                        depth: 0,
                        path: loc.nama,
                        breadcrumb: '',
                    });
                }
            });
        }

        return result;
    }, [activeLokasiArsips]);

    const filteredLokasis = useMemo(() => {
        if (!lokasiSearch.trim()) {
            return hierarchicalLokasiOptions;
        }

        const q = lokasiSearch.toLowerCase();

        return hierarchicalLokasiOptions.filter(
            (item) =>
                item.nama.toLowerCase().includes(q) ||
                item.kode.toLowerCase().includes(q) ||
                item.path.toLowerCase().includes(q),
        );
    }, [hierarchicalLokasiOptions, lokasiSearch]);

    const selectedLokasi = useMemo(() => {
        if (!filters.lokasi_arsip_id) {
            return null;
        }

        return (
            hierarchicalLokasiOptions.find(
                (item) => item.id.toString() === filters.lokasi_arsip_id,
            ) || null
        );
    }, [hierarchicalLokasiOptions, filters.lokasi_arsip_id]);

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
                (item) => item.id.toString() === filters.klasifikasi_arsip_id,
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
                (item) => item.id.toString() === filters.unit_organisasi_id,
            ) || null
        );
    }, [hierarchicalUnitOptions, filters.unit_organisasi_id]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingArsip, setEditingArsip] = useState<Arsip | null>(null);

    const [detailArsip, setDetailArsip] = useState<DetailArsip | null>(null);
    const [detailHistory, setDetailHistory] = useState([]);
    const [detailTransitions, setDetailTransitions] = useState([]);
    const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
    const [deleteArsipId, setDeleteArsipId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Update filter with debounce for text inputs
    const updateFilters = (
        newParams: Record<string, string | null | undefined>,
    ) => {
        const params = {
            ...filters,
            ...newParams,
        };

        Object.keys(params).forEach((key) => {
            const val = params[key as keyof typeof params];

            if (val === undefined || val === '' || val === null) {
                delete params[key as keyof typeof params];
            }
        });

        router.get(index(), params, {
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
                    'pajak',
                    'deskripsi',
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
            pajak: '',
            deskripsi: '',
        });
        setDateFilterOpen(false);
        router.get(
            index(),
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
        <RouteGuard permission="repositori-arsip.view">
            <Head title="Repositori Arsip" />
            <PageContainer>
                <PageHeader
                    title="Repositori Arsip"
                    description="Daftar lengkap arsip aktif digital BAPPENDA"
                    breadcrumb={[
                        { title: 'UTAMA' },
                        { title: 'Repositori Arsip' },
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
                            <Can permission="kelola-arsip.create">
                                <Button size="sm" asChild>
                                    <Link href={kelolaArsipIndex.url()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Input Arsip Baru
                                    </Link>
                                </Button>
                            </Can>
                        </div>
                    }
                />

                <ContentCard
                    title="Daftar Repositori Arsip"
                    description="Gunakan baris filter per kolom di bawah judul tabel untuk menyaring arsip secara presisi."
                >
                    <div className="space-y-4">
                        {arsips.data.length === 0 && !hasAnyFilter ? (
                            <EmptyTable
                                title="Tidak ada arsip ditemukan"
                                description="Belum ada data arsip yang tersimpan di sistem."
                                icon={Archive}
                            />
                        ) : (
                            <>
                                <div className="relative w-full overflow-x-auto rounded-lg border border-border/70 shadow-xs">
                                    <Table className="w-full min-w-[2200px] border-collapse text-xs">
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
                                                <TableHead className="w-[190px] min-w-[180px] px-2 py-3 font-bold text-foreground">
                                                    PAJAK DAERAH
                                                </TableHead>
                                                <TableHead className="w-[150px] min-w-[140px] px-2 py-3 font-bold text-foreground">
                                                    KONDISI
                                                </TableHead>
                                                <TableHead className="w-[150px] min-w-[140px] px-2 py-3 font-bold text-foreground">
                                                    TINGKAT AKSES
                                                </TableHead>
                                                <TableHead className="w-[180px] min-w-[170px] px-2 py-3 font-bold text-foreground">
                                                    LOKASI FISIK
                                                </TableHead>
                                                <TableHead className="w-[150px] min-w-[140px] px-2 py-3 font-bold text-foreground">
                                                    RETENSI
                                                </TableHead>
                                                <TableHead className="min-w-[180px] px-2 py-3 font-bold text-foreground">
                                                    KETERANGAN
                                                </TableHead>
                                                <TableHead className="w-[210px] min-w-[200px] px-2 py-3 font-bold text-foreground">
                                                    UNIT PENGOLAH
                                                </TableHead>
                                                <TableHead className="w-[120px] min-w-[110px] px-2 py-3 font-bold text-foreground">
                                                    STATUS
                                                </TableHead>
                                                <TableHead className="w-[70px] px-2 py-3 text-center font-bold text-foreground">
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
                                                        placeholder="Cari hal..."
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
                                                            filters.kategori_arsip_id ||
                                                            'all'
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
                                                                                filters.klasifikasi_arsip_id ===
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
                                                    <Input
                                                        placeholder="Cari NOP/WP..."
                                                        value={
                                                            columnFilters.pajak
                                                        }
                                                        onChange={(e) =>
                                                            handleTextChange(
                                                                'pajak',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                    />
                                                </TableHead>
                                                <TableHead className="p-2">
                                                    <Select
                                                        value={
                                                            filters.kondisi_arsip_id ||
                                                            'all'
                                                        }
                                                        onValueChange={(val) =>
                                                            updateFilters({
                                                                kondisi_arsip_id:
                                                                    val ===
                                                                    'all'
                                                                        ? null
                                                                        : val,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="!h-auto min-h-8 w-full border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal *:data-[slot=select-value]:!line-clamp-none *:data-[slot=select-value]:!break-words *:data-[slot=select-value]:!whitespace-normal [&>span]:line-clamp-none [&>span]:font-sans [&>span]:text-sm [&>span]:font-normal [&>span]:break-words [&>span]:whitespace-normal">
                                                            <SelectValue placeholder="Semua Kondisi" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            align="start"
                                                            className="max-h-[300px] text-sm"
                                                        >
                                                            <SelectItem value="all">
                                                                Semua Kondisi
                                                            </SelectItem>
                                                            {activeKondisiArsips.map(
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
                                                    <Select
                                                        value={
                                                            filters.tingkat_akses_arsip_id ||
                                                            'all'
                                                        }
                                                        onValueChange={(val) =>
                                                            updateFilters({
                                                                tingkat_akses_arsip_id:
                                                                    val ===
                                                                    'all'
                                                                        ? null
                                                                        : val,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="!h-auto min-h-8 w-full border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal *:data-[slot=select-value]:!line-clamp-none *:data-[slot=select-value]:!break-words *:data-[slot=select-value]:!whitespace-normal [&>span]:line-clamp-none [&>span]:font-sans [&>span]:text-sm [&>span]:font-normal [&>span]:break-words [&>span]:whitespace-normal">
                                                            <SelectValue placeholder="Semua Akses" />
                                                        </SelectTrigger>
                                                        <SelectContent
                                                            align="start"
                                                            className="max-h-[300px] text-sm"
                                                        >
                                                            <SelectItem value="all">
                                                                Semua Akses
                                                            </SelectItem>
                                                            {activeTingkatAksesArsips.map(
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
                                                        open={lokasiFilterOpen}
                                                        onOpenChange={(
                                                            open,
                                                        ) => {
                                                            setLokasiFilterOpen(
                                                                open,
                                                            );

                                                            if (!open) {
                                                                setLokasiSearch(
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
                                                                    lokasiFilterOpen
                                                                }
                                                                className={cn(
                                                                    '!h-auto min-h-8 w-full justify-between gap-1 border-border/70 bg-background !px-2.5 !py-1.5 text-left font-sans text-sm leading-snug font-normal break-words whitespace-normal hover:bg-background',
                                                                    !filters.lokasi_arsip_id &&
                                                                        'text-muted-foreground',
                                                                )}
                                                            >
                                                                <span className="line-clamp-2 font-sans text-sm font-normal break-words text-foreground">
                                                                    {selectedLokasi
                                                                        ? selectedLokasi.nama
                                                                        : 'Semua Lokasi'}
                                                                </span>
                                                                <div className="ml-1 flex shrink-0 items-center gap-0.5">
                                                                    {selectedLokasi && (
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
                                                                                        lokasi_arsip_id:
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
                                                                                            lokasi_arsip_id:
                                                                                                null,
                                                                                        },
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                            title="Hapus filter lokasi"
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
                                                                    placeholder="Cari lokasi fisik..."
                                                                    value={
                                                                        lokasiSearch
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setLokasiSearch(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-7 w-full border-none bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-sm"
                                                                    autoFocus
                                                                />
                                                                {lokasiSearch && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setLokasiSearch(
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
                                                                                lokasi_arsip_id:
                                                                                    null,
                                                                            },
                                                                        );
                                                                        setLokasiFilterOpen(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className={cn(
                                                                        'flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted/70',
                                                                        !filters.lokasi_arsip_id &&
                                                                            'bg-muted font-semibold text-primary',
                                                                    )}
                                                                >
                                                                    <span>
                                                                        Semua
                                                                        Lokasi
                                                                    </span>
                                                                    {!filters.lokasi_arsip_id && (
                                                                        <Check className="h-4 w-4" />
                                                                    )}
                                                                </button>

                                                                {filteredLokasis.length ===
                                                                0 ? (
                                                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                                                        Lokasi
                                                                        tidak
                                                                        ditemukan
                                                                    </div>
                                                                ) : (
                                                                    filteredLokasis.map(
                                                                        (
                                                                            opt,
                                                                        ) => {
                                                                            const isSelected =
                                                                                filters.lokasi_arsip_id ===
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
                                                                                                lokasi_arsip_id:
                                                                                                    opt.id.toString(),
                                                                                            },
                                                                                        );
                                                                                        setLokasiFilterOpen(
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
                                                                                            {
                                                                                                opt.nama
                                                                                            }
                                                                                        </span>
                                                                                        {lokasiSearch.trim() &&
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
                                                <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                    -
                                                </TableHead>
                                                <TableHead className="p-2">
                                                    <Input
                                                        placeholder="Cari keterangan..."
                                                        value={
                                                            columnFilters.deskripsi
                                                        }
                                                        onChange={(e) =>
                                                            handleTextChange(
                                                                'deskripsi',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-8 w-full border-border/70 bg-background px-2.5 font-sans text-sm font-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground"
                                                    />
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
                                                                                filters.unit_organisasi_id ===
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
                                                                                                <span className="font-sans text-[11px] leading-tight break-words whitespace-normal text-muted-foreground">
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
                                                <TableHead className="p-2 text-center font-normal text-muted-foreground">
                                                    -
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
                                                        colSpan={15}
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

                                                                {/* Informasi Pajak Daerah */}
                                                                <TableCell className="w-[190px] min-w-[180px] px-2 align-middle break-words whitespace-normal">
                                                                    {arsip.nop ||
                                                                    arsip.nama_wajib_pajak ||
                                                                    arsip.npwpd ||
                                                                    arsip.no_register ? (
                                                                        <div className="flex flex-col gap-0.5 text-[11px]">
                                                                            {arsip.nop && (
                                                                                <span className="font-mono text-foreground">
                                                                                    <strong className="text-muted-foreground">
                                                                                        NOP:
                                                                                    </strong>{' '}
                                                                                    {
                                                                                        arsip.nop
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            {arsip.nama_wajib_pajak && (
                                                                                <span className="leading-tight text-foreground">
                                                                                    <strong className="text-muted-foreground">
                                                                                        WP:
                                                                                    </strong>{' '}
                                                                                    {
                                                                                        arsip.nama_wajib_pajak
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            {arsip.npwpd && (
                                                                                <span className="font-mono text-muted-foreground">
                                                                                    NPWPD:{' '}
                                                                                    {
                                                                                        arsip.npwpd
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                            {arsip.no_register && (
                                                                                <span className="text-muted-foreground">
                                                                                    Reg:{' '}
                                                                                    {
                                                                                        arsip.no_register
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground italic">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>

                                                                {/* Kondisi */}
                                                                <TableCell className="w-[150px] min-w-[140px] px-2 align-middle break-words whitespace-normal">
                                                                    {arsip.kondisi_arsip ? (
                                                                        <span className="inline-flex rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px]">
                                                                            {
                                                                                arsip
                                                                                    .kondisi_arsip
                                                                                    .nama
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>

                                                                {/* Tingkat Akses */}
                                                                <TableCell className="w-[150px] min-w-[140px] px-2 align-middle break-words whitespace-normal">
                                                                    {arsip.tingkat_akses_arsip ? (
                                                                        <span className="inline-flex rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px]">
                                                                            {
                                                                                arsip
                                                                                    .tingkat_akses_arsip
                                                                                    .nama
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </TableCell>

                                                                {/* Lokasi Fisik */}
                                                                <TableCell className="w-[180px] min-w-[170px] px-2 align-middle leading-tight break-words whitespace-normal text-foreground">
                                                                    {getLokasiHierarchyPath(
                                                                        arsip.lokasi_arsip,
                                                                    )}
                                                                </TableCell>

                                                                {/* Info Retensi */}
                                                                {(() => {
                                                                    const {
                                                                        retensiAktif,
                                                                        retensiInaktif,
                                                                        nasibAkhir,
                                                                    } =
                                                                        getKlasifikasiRetention(
                                                                            arsip.klasifikasi_arsip,
                                                                        );

                                                                    return (
                                                                        <TableCell className="w-[160px] min-w-[150px] px-2 align-middle text-[11px] break-words whitespace-normal">
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span>
                                                                                    Aktif:{' '}
                                                                                    {retensiAktif !=
                                                                                    null
                                                                                        ? `${retensiAktif} tahun`
                                                                                        : '-'}
                                                                                </span>
                                                                                <span>
                                                                                    Inaktif:{' '}
                                                                                    {retensiInaktif !=
                                                                                    null
                                                                                        ? `${retensiInaktif} tahun`
                                                                                        : '-'}
                                                                                </span>
                                                                                <span className="leading-tight">
                                                                                    Nasib:{' '}
                                                                                    {nasibAkhir ? (
                                                                                        <span className="font-semibold text-foreground">
                                                                                            {
                                                                                                nasibAkhir
                                                                                            }
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-muted-foreground">
                                                                                            -
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </TableCell>
                                                                    );
                                                                })()}

                                                                {/* Keterangan */}
                                                                <TableCell className="min-w-[180px] px-2 align-middle leading-relaxed break-words whitespace-normal text-muted-foreground">
                                                                    {arsip.deskripsi ||
                                                                        '-'}
                                                                </TableCell>

                                                                {/* Unit Pengolah */}
                                                                <TableCell className="w-[210px] min-w-[200px] px-2 align-middle leading-tight break-words whitespace-normal text-muted-foreground">
                                                                    {arsip
                                                                        .unit_organisasi
                                                                        ?.nama ||
                                                                        '-'}
                                                                </TableCell>

                                                                {/* Status */}
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
                                                                    className="w-[70px] px-2 text-center align-middle whitespace-nowrap"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                >
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-muted-foreground"
                                                                            >
                                                                                <span className="sr-only">
                                                                                    Menu
                                                                                    aksi
                                                                                </span>
                                                                                <svg
                                                                                    className="h-4 w-4"
                                                                                    fill="currentColor"
                                                                                    viewBox="0 0 20 20"
                                                                                >
                                                                                    <circle
                                                                                        cx="4"
                                                                                        cy="10"
                                                                                        r="1.5"
                                                                                    />
                                                                                    <circle
                                                                                        cx="10"
                                                                                        cy="10"
                                                                                        r="1.5"
                                                                                    />
                                                                                    <circle
                                                                                        cx="16"
                                                                                        cy="10"
                                                                                        r="1.5"
                                                                                    />
                                                                                </svg>
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
                                                                            {isArsipEditable(
                                                                                arsip.workflow_status,
                                                                            ) && (
                                                                                <Can permission="kelola-arsip.update">
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
                                                                                </Can>
                                                                            )}
                                                                            <Can permission="repositori-arsip.delete">
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
                                                                            </Can>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
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
                                        updateFilters({ per_page: String(val) })
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

Index.layout = {
    breadcrumbs: [
        { title: 'UTAMA' },
        { title: 'Repositori Arsip', href: '/arsip' },
    ],
};
