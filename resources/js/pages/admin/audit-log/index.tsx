import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ChevronDown, Eye, FileClock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import type { BadgeStatusVariant } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { DataTablePagination } from '@/components/Tables/data-table-pagination';
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { index } from '@/routes/admin/audit-log';

type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

type AuditLog = {
    id: number;
    created_at: string | null;
    created_at_human: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    event: string;
    module: string;
    archive: {
        id: number;
        nomor_arsip: string;
        judul: string;
    } | null;
    ip_address: string | null;
    user_agent: string | null;
    old_values: JsonValue | null;
    new_values: JsonValue | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedAuditLogs = {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Filters = {
    search?: string;
    event_category?: string;
    user_type?: string;
    date_from?: string;
    date_until?: string;
};

type Statistics = {
    total: number;
    today: number;
    active_users_today: number;
    events_today: number;
};

type AuditLogIndexProps = {
    auditLogs: PaginatedAuditLogs;
    statistics: Statistics;
    filters: Filters;
    masterLookups?: Record<string, Record<string | number, string>>;
};

const eventCategoryOptions = [
    { value: 'arsip', label: 'Arsip' },
    { value: 'dokumen', label: 'Dokumen' },
    { value: 'workflow', label: 'Workflow' },
    { value: 'pengguna', label: 'Pengguna' },
    { value: 'role', label: 'Role' },
    { value: 'master', label: 'Master Data' },
    { value: 'peminjaman', label: 'Peminjaman' },
];

const userTypeOptions = [
    { value: 'system', label: 'Sistem' },
    { value: 'user', label: 'User' },
];

const masterEntityLabels: Record<string, string> = {
    'unit-organisasi': 'Unit Organisasi',
    jabatan: 'Jabatan',
    'klasifikasi-arsip': 'Klasifikasi Arsip',
    'lokasi-arsip': 'Lokasi Arsip',
    'jenis-arsip': 'Jenis Arsip',
    'kategori-arsip': 'Kategori Arsip',
    'sifat-arsip': 'Sifat Arsip',
    'tingkat-akses-arsip': 'Tingkat Akses Arsip',
    'tingkat-perkembangan-arsip': 'Tingkat Perkembangan Arsip',
    'kondisi-arsip': 'Kondisi Arsip',
    'nasib-akhir': 'Nasib Akhir',
};

const eventLabels: Record<string, string> = {
    'arsip.created': 'Arsip dibuat',
    'arsip.updated': 'Arsip diperbarui',
    'arsip.deleted': 'Arsip dipindahkan ke Riwayat Arsip',
    'arsip.restored': 'Arsip dipulihkan',
    'arsip.force_deleted': 'Arsip dihapus permanen',
    'workflow.changed': 'Tahap arsip berubah',
    'dokumen.uploaded': 'Dokumen diunggah',
    'dokumen.replaced': 'Dokumen diganti',
    'dokumen.version_created': 'Versi dokumen dibuat',
    'pengguna.created': 'Pengguna ditambahkan',
    'pengguna.updated': 'Pengguna diperbarui',
    'pengguna.deleted': 'Pengguna dihapus',
    'role.created': 'Role ditambahkan',
    'role.updated': 'Role diperbarui',
    'role.deleted': 'Role dihapus',
    'peminjaman.requested': 'Permohonan peminjaman diajukan',
    'peminjaman.approved': 'Permohonan peminjaman disetujui',
    'peminjaman.rejected': 'Permohonan peminjaman ditolak',
    'master.unit-organisasi.created': 'Unit Organisasi ditambahkan',
    'master.unit-organisasi.updated': 'Unit Organisasi diperbarui',
    'master.unit-organisasi.deleted': 'Unit Organisasi dihapus',
    'master.jabatan.created': 'Jabatan ditambahkan',
    'master.jabatan.updated': 'Jabatan diperbarui',
    'master.jabatan.deleted': 'Jabatan dihapus',
    'master.klasifikasi-arsip.created': 'Klasifikasi Arsip ditambahkan',
    'master.klasifikasi-arsip.updated': 'Klasifikasi Arsip diperbarui',
    'master.klasifikasi-arsip.deleted': 'Klasifikasi Arsip dihapus',
    'master.lokasi-arsip.created': 'Lokasi Arsip ditambahkan',
    'master.lokasi-arsip.updated': 'Lokasi Arsip diperbarui',
    'master.lokasi-arsip.deleted': 'Lokasi Arsip dihapus',
    'master.jenis-arsip.created': 'Jenis Arsip ditambahkan',
    'master.jenis-arsip.updated': 'Jenis Arsip diperbarui',
    'master.jenis-arsip.deleted': 'Jenis Arsip dihapus',
    'master.kategori-arsip.created': 'Kategori Arsip ditambahkan',
    'master.kategori-arsip.updated': 'Kategori Arsip diperbarui',
    'master.kategori-arsip.deleted': 'Kategori Arsip dihapus',
    'master.sifat-arsip.created': 'Sifat Arsip ditambahkan',
    'master.sifat-arsip.updated': 'Sifat Arsip diperbarui',
    'master.sifat-arsip.deleted': 'Sifat Arsip dihapus',
    'master.tingkat-akses-arsip.created': 'Tingkat Akses Arsip ditambahkan',
    'master.tingkat-akses-arsip.updated': 'Tingkat Akses Arsip diperbarui',
    'master.tingkat-akses-arsip.deleted': 'Tingkat Akses Arsip dihapus',
    'master.tingkat-perkembangan-arsip.created':
        'Tingkat Perkembangan Arsip ditambahkan',
    'master.tingkat-perkembangan-arsip.updated':
        'Tingkat Perkembangan Arsip diperbarui',
    'master.tingkat-perkembangan-arsip.deleted':
        'Tingkat Perkembangan Arsip dihapus',
    'master.kondisi-arsip.created': 'Kondisi Arsip ditambahkan',
    'master.kondisi-arsip.updated': 'Kondisi Arsip diperbarui',
    'master.kondisi-arsip.deleted': 'Kondisi Arsip dihapus',
    'master.nasib-akhir.created': 'Nasib Akhir ditambahkan',
    'master.nasib-akhir.updated': 'Nasib Akhir diperbarui',
    'master.nasib-akhir.deleted': 'Nasib Akhir dihapus',
};

const permissionGroupLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    profile: 'Profil',
    arsip: 'Arsip',
    dokumen: 'Dokumen',
    workflow: 'Alur Kerja',
    master: 'Master Data',
    user: 'Pengguna',
    role: 'Role',
    permission: 'Permission',
    auditlog: 'Audit Log',
    peminjaman: 'Peminjaman',
};

const permissionActionLabels: Record<string, string> = {
    view: 'Lihat',
    create: 'Tambah',
    update: 'Ubah',
    delete: 'Hapus',
    restore: 'Pulihkan',
    upload: 'Unggah',
    download: 'Unduh',
    verify: 'Verifikasi',
    approve: 'Setujui',
    reject: 'Tolak',
    tte: 'TTE',
};

function formatPermissionName(perm: string): string {
    const [group, action] = perm.split('.');

    if (!action) {
        return perm;
    }

    const g = permissionGroupLabels[group] ?? group;
    const a = permissionActionLabels[action] ?? action;

    return `${g} (${a})`;
}

const fieldLabels: Record<string, string> = {
    nomor_arsip: 'Nomor Arsip',
    judul: 'Judul Arsip',
    deskripsi: 'Keterangan / Deskripsi',
    tanggal_arsip: 'Tanggal Arsip',
    kategori_arsip_id: 'Kategori Arsip',
    klasifikasi_arsip_id: 'Klasifikasi',
    lokasi_arsip_id: 'Lokasi',
    jenis_arsip_id: 'Jenis Arsip',
    sifat_arsip_id: 'Sifat Arsip',
    tingkat_perkembangan_arsip_id: 'Tingkat Perkembangan Arsip',
    kondisi_arsip_id: 'Kondisi',
    status_arsip_id: 'Status Arsip',
    tingkat_akses_arsip_id: 'Tingkat Akses',
    retensi_arsip_id: 'Retensi',
    unit_organisasi_id: 'Unit Organisasi',
    dokumen_arsip_id: 'Dokumen Arsip',
    jenis_dokumen_id: 'Jenis Dokumen',
    media_arsip_id: 'Media Arsip',
    workflow_status: 'Tahap Arsip',
    catatan_revisi: 'Catatan Revisi',
    no_register: 'Nomor Register',
    nop: 'NOP',
    npwpd: 'NPWPD',
    nama_wajib_pajak: 'Nama Wajib Pajak',
    created_by: 'Dibuat Oleh',
    updated_by: 'Diperbarui Oleh',
    user_id: 'Pengguna',
    deleted_at: 'Waktu Dihapus',
    nama_original: 'Nama File Asli',
    ukuran: 'Ukuran File',
    mime_type: 'Tipe File',
    path_penyimpanan: 'Lokasi File',
    uploaded_by: 'Pengunggah',
    versi: 'Versi',
    nama_file: 'Nama File',
    path_file: 'Lokasi File',
    ukuran_file: 'Ukuran File',
    hash_file: 'Hash File',
    name: 'Nama',
    nama: 'Nama',
    kode: 'Kode',
    tipe: 'Tipe',
    status: 'Status',
    roles: 'Role',
    permissions: 'Hak Akses (Permissions)',
    email: 'Email',
    username: 'Nama Pengguna',
    nip: 'NIP',
    nik: 'NIK',
    jabatan_id: 'Jabatan',
};

function eventVariant(event: string): BadgeStatusVariant {
    if (
        [
            'arsip.created',
            'arsip.restored',
            'pengguna.created',
            'role.created',
            'peminjaman.approved',
        ].includes(event) ||
        event.endsWith('.created')
    ) {
        return 'success';
    }

    if (
        [
            'arsip.updated',
            'workflow.changed',
            'pengguna.updated',
            'role.updated',
            'peminjaman.requested',
        ].includes(event) ||
        event.endsWith('.updated')
    ) {
        return 'info';
    }

    if (
        [
            'dokumen.uploaded',
            'dokumen.replaced',
            'dokumen.version_created',
        ].includes(event)
    ) {
        return 'warning';
    }

    if (
        [
            'arsip.deleted',
            'arsip.force_deleted',
            'pengguna.deleted',
            'role.deleted',
            'peminjaman.rejected',
        ].includes(event) ||
        event.endsWith('.deleted')
    ) {
        return 'danger';
    }

    return 'secondary';
}

function eventLabel(event: string): string {
    if (eventLabels[event]) {
        return eventLabels[event];
    }

    if (event.startsWith('master.')) {
        const parts = event.split('.');
        const entity =
            masterEntityLabels[parts[1]] ?? parts[1]?.replaceAll('-', ' ');
        const action =
            parts[2] === 'created'
                ? 'ditambahkan'
                : parts[2] === 'updated'
                  ? 'diperbarui'
                  : parts[2] === 'deleted'
                    ? 'dihapus'
                    : parts[2];

        return `${entity} ${action}`;
    }

    return event;
}

function prettyJson(value: JsonValue | null): string {
    if (value === null) {
        return '-';
    }

    return JSON.stringify(value, null, 2);
}

function isRecord(
    value: JsonValue | null,
): value is { [key: string]: JsonValue } {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSimpleValue(value: JsonValue | undefined, field?: string): boolean {
    if (value === undefined || value === null) {
        return true;
    }

    if (['string', 'number', 'boolean'].includes(typeof value)) {
        return true;
    }

    if (
        Array.isArray(value) &&
        (field === 'permissions' ||
            field === 'roles' ||
            value.every((v) => typeof v === 'string' || typeof v === 'number'))
    ) {
        return true;
    }

    return false;
}

function fieldLabel(field: string): string {
    return fieldLabels[field] ?? field.replaceAll('_', ' ');
}

function isIsoDateString(val: string): boolean {
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(val);
}

function formatDateValue(val: string): string {
    const d = new Date(val);

    if (isNaN(d.getTime())) {
        return val;
    }

    const isDateOnly =
        /^\d{4}-\d{2}-\d{2}$/.test(val) ||
        val.endsWith('T00:00:00.000000Z') ||
        val.endsWith('T00:00:00Z');

    if (isDateOnly) {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
        }).format(d);
    }

    return (
        new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
        }).format(d) + ' WIB'
    );
}

function formatValue(
    value: JsonValue | undefined,
    field?: string,
    masterLookups?: Record<string, Record<string | number, string>>,
): string {
    if (value === undefined || value === null || value === '') {
        return '-';
    }

    if (typeof value === 'boolean') {
        return value ? 'Ya' : 'Tidak';
    }

    if (field === 'status' || value === 'active' || value === 'inactive') {
        if (value === 'active') {
            return 'Aktif';
        }

        if (value === 'inactive') {
            return 'Nonaktif';
        }
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return '-';
        }

        if (field === 'permissions') {
            return value
                .map((p) =>
                    typeof p === 'string' ? formatPermissionName(p) : String(p),
                )
                .join(', ');
        }

        if (field === 'roles') {
            return value.join(', ');
        }

        return value
            .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
            .join(', ');
    }

    if (field && masterLookups && masterLookups[field]) {
        const lookup = masterLookups[field][value as string | number];

        if (lookup) {
            return lookup;
        }
    }

    if (field === 'workflow_status' && typeof value === 'string') {
        const statusMap: Record<string, string> = {
            draft: 'Draft',
            review: 'Menunggu Review',
            revisi: 'Perlu Revisi',
            approved: 'Disetujui',
            waiting_tte: 'Menunggu TTE',
            signed: 'Sudah TTE',
            active: 'Aktif',
            inactive: 'Inaktif',
            retention: 'Masa Retensi',
            record_center: 'Arsip Inaktif',
            destruction: 'Nasib Akhir Arsip',
        };

        if (statusMap[value]) {
            return statusMap[value];
        }
    }

    if (typeof value === 'string') {
        if (isIsoDateString(value)) {
            return formatDateValue(value);
        }

        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return JSON.stringify(value, null, 2);
}

function changeItems(oldValues: JsonValue | null, newValues: JsonValue | null) {
    if (!isRecord(oldValues) && !isRecord(newValues)) {
        return [];
    }

    const oldRecord = isRecord(oldValues) ? oldValues : {};
    const newRecord = isRecord(newValues) ? newValues : {};
    const fields = Array.from(
        new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]),
    );

    return fields.map((field) => {
        const oldValue = oldRecord[field];
        const newValue = newRecord[field];
        const isComplex =
            !isSimpleValue(oldValue, field) || !isSimpleValue(newValue, field);

        return {
            field,
            label: fieldLabel(field),
            oldValue,
            newValue,
            isComplex,
        };
    });
}

function cleanFilters(filters: Filters): Filters {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== '',
        ),
    ) as Filters;
}

export default function AuditLogIndex({
    auditLogs,
    statistics,
    filters = {},
    masterLookups,
}: AuditLogIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const updateFilters = (newFilters: Filters) => {
        const params = cleanFilters({
            ...filters,
            ...newFilters,
        });

        router.get(
            index.url({ query: params }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                updateFilters({ search });
            }
        }, 500);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const getPeriodKey = () => {
        const from = filters.date_from;
        const until = filters.date_until;

        if (!from && !until) {
            return 'all';
        }

        const today = new Date().toISOString().split('T')[0];

        if (from === today && until === today) {
            return 'today';
        }

        const d7 = new Date();
        d7.setDate(d7.getDate() - 7);
        const d7Str = d7.toISOString().split('T')[0];

        if (from === d7Str && until === today) {
            return '7days';
        }

        const d30 = new Date();
        d30.setDate(d30.getDate() - 30);
        const d30Str = d30.toISOString().split('T')[0];

        if (from === d30Str && until === today) {
            return '30days';
        }

        const firstOfMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
        )
            .toISOString()
            .split('T')[0];

        if (from === firstOfMonth && until === today) {
            return 'this_month';
        }

        return 'custom';
    };

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [isCustomDate, setIsCustomDate] = useState(
        () => getPeriodKey() === 'custom',
    );

    const handlePeriodChange = (val: string) => {
        const today = new Date().toISOString().split('T')[0];

        if (val === 'all') {
            setIsCustomDate(false);
            updateFilters({ date_from: '', date_until: '' });
        } else if (val === 'today') {
            setIsCustomDate(false);
            updateFilters({ date_from: today, date_until: today });
        } else if (val === '7days') {
            setIsCustomDate(false);
            const d7 = new Date();
            d7.setDate(d7.getDate() - 7);
            updateFilters({
                date_from: d7.toISOString().split('T')[0],
                date_until: today,
            });
        } else if (val === '30days') {
            setIsCustomDate(false);
            const d30 = new Date();
            d30.setDate(d30.getDate() - 30);
            updateFilters({
                date_from: d30.toISOString().split('T')[0],
                date_until: today,
            });
        } else if (val === 'this_month') {
            setIsCustomDate(false);
            const firstOfMonth = new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
            )
                .toISOString()
                .split('T')[0];
            updateFilters({ date_from: firstOfMonth, date_until: today });
        } else if (val === 'custom') {
            setIsCustomDate(true);
            setCalendarOpen(true);
        }
    };

    const hasFilters = Boolean(
        filters.search ||
        filters.event_category ||
        filters.user_type ||
        filters.date_from ||
        filters.date_until,
    );

    const clearFilters = () => {
        setSearch('');
        router.get(
            index.url(),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <RouteGuard permission="admin-audit-log.view">
            <Head title="Audit Log" />

            <PageContainer>
                <PageHeader
                    title="Audit Log"
                    description="Riwayat aktivitas dan jejak audit seluruh pengguna sistem."
                    breadcrumb={[
                        { title: 'ADMINISTRASI' },
                        { title: 'Audit Log', href: index.url() },
                    ]}
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Audit">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">
                                {statistics.total}
                            </p>
                        </div>
                    </ContentCard>
                    <ContentCard title="Audit Hari Ini">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">
                                {statistics.today}
                            </p>
                        </div>
                    </ContentCard>
                    <ContentCard title="User Aktif Hari Ini">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">
                                {statistics.active_users_today}
                            </p>
                        </div>
                    </ContentCard>
                    <ContentCard title="Event Hari Ini">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-2xl font-semibold tabular-nums">
                                {statistics.events_today}
                            </p>
                        </div>
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Audit Log"
                    description="Lacak riwayat perubahan data arsip, dokumen, dan tahap workflow."
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari user, nomor arsip, judul, atau event..."
                            filters={
                                <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
                                    <Select
                                        value={filters.event_category ?? 'all'}
                                        onValueChange={(value) =>
                                            updateFilters({
                                                event_category:
                                                    value === 'all'
                                                        ? ''
                                                        : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-full border-border/60 sm:w-[165px]">
                                            <SelectValue placeholder="Event" />
                                        </SelectTrigger>
                                        <SelectContent
                                            align="start"
                                            collisionPadding={16}
                                            className="max-h-[280px] w-[min(320px,calc(100vw-2rem))]"
                                        >
                                            <SelectItem value="all">
                                                Semua Event
                                            </SelectItem>
                                            {eventCategoryOptions.map(
                                                (option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                        className="whitespace-normal"
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={filters.user_type ?? 'all'}
                                        onValueChange={(value) =>
                                            updateFilters({
                                                user_type:
                                                    value === 'all'
                                                        ? ''
                                                        : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-full border-border/60 sm:w-[145px]">
                                            <SelectValue placeholder="User" />
                                        </SelectTrigger>
                                        <SelectContent
                                            align="start"
                                            collisionPadding={16}
                                            className="max-h-[280px] w-[min(320px,calc(100vw-2rem))]"
                                        >
                                            <SelectItem value="all">
                                                Semua User
                                            </SelectItem>
                                            {userTypeOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={
                                            isCustomDate
                                                ? 'custom'
                                                : getPeriodKey()
                                        }
                                        onValueChange={handlePeriodChange}
                                    >
                                        <SelectTrigger className="h-9 w-full border-border/60 sm:w-[155px]">
                                            <SelectValue placeholder="Periode" />
                                        </SelectTrigger>
                                        <SelectContent
                                            align="start"
                                            collisionPadding={16}
                                            className="max-h-[280px] w-[min(240px,calc(100vw-2rem))]"
                                        >
                                            <SelectItem value="all">
                                                Semua Waktu
                                            </SelectItem>
                                            <SelectItem value="today">
                                                Hari Ini
                                            </SelectItem>
                                            <SelectItem value="7days">
                                                7 Hari Terakhir
                                            </SelectItem>
                                            <SelectItem value="30days">
                                                30 Hari Terakhir
                                            </SelectItem>
                                            <SelectItem value="this_month">
                                                Bulan Ini
                                            </SelectItem>
                                            <SelectItem value="custom">
                                                {isCustomDate &&
                                                filters.date_from
                                                    ? format(
                                                          new Date(
                                                              filters.date_from +
                                                                  'T00:00:00',
                                                          ),
                                                          'dd MMM yyyy',
                                                          { locale: idLocale },
                                                      )
                                                    : 'Pilih Tanggal...'}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Dialog
                                        open={calendarOpen}
                                        onOpenChange={setCalendarOpen}
                                    >
                                        <DialogContent className="w-auto p-0">
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>
                                                    Pilih Tanggal
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Pilih tanggal untuk filter
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Calendar
                                                mode="single"
                                                locale={idLocale}
                                                captionLayout="dropdown"
                                                defaultMonth={
                                                    filters.date_from
                                                        ? new Date(
                                                              filters.date_from +
                                                                  'T00:00:00',
                                                          )
                                                        : new Date()
                                                }
                                                selected={
                                                    filters.date_from
                                                        ? new Date(
                                                              filters.date_from +
                                                                  'T00:00:00',
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(
                                                    date: Date | undefined,
                                                ) => {
                                                    if (date) {
                                                        const dateStr = format(
                                                            date,
                                                            'yyyy-MM-dd',
                                                        );
                                                        updateFilters({
                                                            date_from: dateStr,
                                                            date_until: dateStr,
                                                        });
                                                    } else {
                                                        updateFilters({
                                                            date_from: '',
                                                            date_until: '',
                                                        });
                                                        setIsCustomDate(false);
                                                    }

                                                    setCalendarOpen(false);
                                                }}
                                            />
                                        </DialogContent>
                                    </Dialog>

                                    {hasFilters && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            }
                        />

                        {auditLogs.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada audit log"
                                description="Belum ada aktivitas yang cocok dengan pencarian atau filter."
                                icon={FileClock}
                            />
                        ) : (
                            <>
                                {/* Mobile card view */}
                                <div className="flex flex-col gap-3 md:hidden">
                                    {auditLogs.data.map((auditLog) => (
                                        <div
                                            key={auditLog.id}
                                            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-2.5">
                                                <div className="min-w-0 flex-1">
                                                    <StatusBadge
                                                        variant={eventVariant(
                                                            auditLog.event,
                                                        )}
                                                        className="inline-block max-w-full truncate text-[11px] font-semibold whitespace-nowrap"
                                                    >
                                                        {eventLabel(
                                                            auditLog.event,
                                                        )}
                                                    </StatusBadge>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 shrink-0 gap-1 px-2.5 text-xs font-medium"
                                                    onClick={() =>
                                                        setSelectedLog(auditLog)
                                                    }
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Detail
                                                </Button>
                                            </div>
                                            <div className="mt-2 space-y-0.5">
                                                <p className="text-xs font-medium text-foreground">
                                                    {auditLog.user?.name ??
                                                        'Sistem'}
                                                </p>
                                                {auditLog.user?.email && (
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {auditLog.user.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                                                <span>{auditLog.module}</span>
                                                <span className="text-border">
                                                    •
                                                </span>
                                                <span>
                                                    {auditLog.created_at_human ??
                                                        '-'}
                                                </span>
                                            </div>
                                            {auditLog.archive && (
                                                <div className="mt-2 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1.5">
                                                    <p className="font-mono text-[11px] font-medium">
                                                        {
                                                            auditLog.archive
                                                                .nomor_arsip
                                                        }
                                                    </p>
                                                    <p className="truncate text-[11px] text-muted-foreground">
                                                        {auditLog.archive.judul}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop table view */}
                                <div className="hidden overflow-x-auto rounded-md border border-border/60 md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="min-w-[150px] font-semibold">
                                                    Waktu
                                                </TableHead>
                                                <TableHead className="min-w-[180px] font-semibold">
                                                    Pengguna
                                                </TableHead>
                                                <TableHead className="min-w-[170px] font-semibold">
                                                    Event
                                                </TableHead>
                                                <TableHead className="min-w-[120px] font-semibold">
                                                    Modul
                                                </TableHead>
                                                <TableHead className="min-w-[220px] font-semibold">
                                                    Nomor Arsip
                                                </TableHead>
                                                <TableHead className="w-[90px] text-right font-semibold">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogs.data.map((auditLog) => (
                                                <TableRow
                                                    key={auditLog.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {auditLog.created_at_human ??
                                                            '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {auditLog.user ? (
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium">
                                                                    {
                                                                        auditLog
                                                                            .user
                                                                            .name
                                                                    }
                                                                </p>
                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {
                                                                        auditLog
                                                                            .user
                                                                            .email
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                Sistem
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            variant={eventVariant(
                                                                auditLog.event,
                                                            )}
                                                        >
                                                            {eventLabel(
                                                                auditLog.event,
                                                            )}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {auditLog.module}
                                                    </TableCell>
                                                    <TableCell>
                                                        {auditLog.archive ? (
                                                            <div className="min-w-0">
                                                                <p className="font-mono text-xs font-medium">
                                                                    {
                                                                        auditLog
                                                                            .archive
                                                                            .nomor_arsip
                                                                    }
                                                                </p>
                                                                <p className="max-w-[260px] truncate text-xs text-muted-foreground">
                                                                    {
                                                                        auditLog
                                                                            .archive
                                                                            .judul
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelectedLog(
                                                                    auditLog,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Detail
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <DataTablePagination
                                    data={auditLogs}
                                    itemName="audit"
                                />
                            </>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <Dialog
                open={selectedLog !== null}
                onOpenChange={(open) => !open && setSelectedLog(null)}
            >
                <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detail Audit Log</DialogTitle>
                        <DialogDescription>
                            {selectedLog ? eventLabel(selectedLog.event) : '-'}{' '}
                            pada {selectedLog?.created_at_human ?? '-'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <AuditLogDetail
                            auditLog={selectedLog}
                            masterLookups={masterLookups}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </RouteGuard>
    );
}

function AuditLogDetail({
    auditLog,
    masterLookups,
}: {
    auditLog: AuditLog;
    masterLookups?: Record<string, Record<string | number, string>>;
}) {
    return (
        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
            <section className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                    label="Aktivitas"
                    value={eventLabel(auditLog.event)}
                />
                <DetailItem
                    label="Tanggal"
                    value={auditLog.created_at_human ?? '-'}
                />
                <DetailItem
                    label="Pengguna"
                    value={auditLog.user?.name ?? 'Sistem'}
                />
                <DetailItem
                    label="Nomor Arsip"
                    value={auditLog.archive?.nomor_arsip ?? '-'}
                />
                <DetailItem
                    className="sm:col-span-2"
                    label="Judul Arsip"
                    value={auditLog.archive?.judul ?? '-'}
                />
            </section>

            <ChangeSummary
                oldValues={auditLog.old_values}
                newValues={auditLog.new_values}
                masterLookups={masterLookups}
            />

            <section className="space-y-3 border-t border-border/60 pt-4">
                <div>
                    <h3 className="text-sm font-semibold">Informasi Teknis</h3>
                    <p className="text-xs text-muted-foreground">
                        Data teknis untuk kebutuhan penelusuran lanjutan.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <DetailItem
                        label="IP Address"
                        value={auditLog.ip_address ?? '-'}
                    />
                    <DetailItem
                        label="Browser/User Agent"
                        value={auditLog.user_agent ?? '-'}
                    />
                </div>
            </section>
        </div>
    );
}

function DetailItem({
    label,
    value,
    className = '',
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div className={`rounded-md border border-border/60 p-3 ${className}`}>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm break-words">{value}</p>
        </div>
    );
}

function ChangeSummary({
    oldValues,
    newValues,
    masterLookups,
}: {
    oldValues: JsonValue | null;
    newValues: JsonValue | null;
    masterLookups?: Record<string, Record<string | number, string>>;
}) {
    const changes = changeItems(oldValues, newValues);
    const visibleChanges = changes.filter((change) => !change.isComplex);
    const hasComplexChanges = changes.some((change) => change.isComplex);

    return (
        <section className="space-y-3">
            <div>
                <h3 className="text-sm font-semibold">Perubahan</h3>
                <p className="text-xs text-muted-foreground">
                    Ringkasan perubahan yang tercatat pada aktivitas ini.
                </p>
            </div>

            {visibleChanges.length > 0 ? (
                <div className="space-y-3">
                    {visibleChanges.map((change) => (
                        <div
                            key={change.field}
                            className="rounded-md border border-border/60 p-3"
                        >
                            <p className="text-sm font-semibold">
                                {change.label}
                            </p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <ValueBlock
                                    label="Sebelum"
                                    value={formatValue(
                                        change.oldValue,
                                        change.field,
                                        masterLookups,
                                    )}
                                />
                                <ValueBlock
                                    label="Sesudah"
                                    value={formatValue(
                                        change.newValue,
                                        change.field,
                                        masterLookups,
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="rounded-md border border-border/60 p-3 text-sm text-muted-foreground">
                    Tidak ada perubahan sederhana yang dapat ditampilkan.
                </p>
            )}

            {hasComplexChanges && (
                <FullData oldValues={oldValues} newValues={newValues} />
            )}
        </section>
    );
}

function ValueBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1 rounded-md bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm break-words whitespace-pre-wrap">{value}</p>
        </div>
    );
}

function FullData({
    oldValues,
    newValues,
}: {
    oldValues: JsonValue | null;
    newValues: JsonValue | null;
}) {
    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground"
                >
                    <ChevronDown className="h-4 w-4" />
                    Lihat Data Lengkap
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
                <JsonBlock title="Sebelum" value={oldValues} />
                <JsonBlock title="Sesudah" value={newValues} />
            </CollapsibleContent>
        </Collapsible>
    );
}

function JsonBlock({
    title,
    value,
}: {
    title: string;
    value: JsonValue | null;
}) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
                {title}
            </p>
            <pre className="max-h-64 overflow-auto rounded-md border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed">
                {prettyJson(value)}
            </pre>
        </div>
    );
}

AuditLogIndex.layout = {
    breadcrumbs: [
        { title: 'ADMINISTRASI' },
        { title: 'Audit Log', href: index.url() },
    ],
};
