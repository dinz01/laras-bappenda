import { Head, router } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { UnitOrganisasiOption } from '@/components/unit-organisasi-select';
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
    klasifikasi_arsip_id: number;
    lokasi_arsip_id: number | null;
    jenis_arsip_id: number | null;
    sifat_arsip_id: number | null;
    tingkat_perkembangan_arsip_id: number | null;
    media_arsip_id: number | null;
    kondisi_arsip_id: number | null;
    status_arsip_id: number | null;
    tingkat_akses_arsip_id: number | null;
    retensi_arsip_id: number | null;
    unit_organisasi_id: number | null;
    created_by: number | null;
    workflow_status:
    | 'draft'
    | 'review'
    | 'revisi'
    | 'approved'
    | 'active'
    | 'retention'
    | 'record_center'
    | 'destruction';
    catatan_revisi: string | null;
    klasifikasi_arsip?: MasterItem | null;
    lokasi_arsip?: MasterItem | null;
    status_arsip?: MasterItem | null;
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
    klasifikasis?: MasterItem[];
    unitOrganisasis?: UnitOrganisasiOption[];
    statusArsips?: MasterItem[];
    jenisArsips?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    lokasiArsips?: MasterItem[];
    mediaArsips?: MasterItem[];
    kondisiArsips?: MasterItem[];
    tingkatAksesArsips?: MasterItem[];
};

function workflowStatusVariant(
    status: string,
): 'secondary' | 'warning' | 'info' | 'success' | 'danger' {
    switch (status) {
        case 'draft': return 'secondary';
        case 'review': return 'warning';
        case 'revisi': return 'danger';
        case 'approved': return 'info';
        case 'active': return 'success';
        case 'retention': return 'warning';
        case 'record_center': return 'secondary';
        case 'destruction': return 'danger';
        default: return 'secondary';
    }
}

function workflowStatusLabel(status: string): string {
    switch (status) {
        case 'draft': return 'Draft';
        case 'review': return 'Menunggu Verifikasi';
        case 'revisi': return 'Perlu Revisi';
        case 'approved': return 'Disetujui';
        case 'active': return 'Arsip Aktif';
        case 'retention': return 'Retensi';
        case 'record_center': return 'Record Center';
        case 'destruction': return 'Pemusnahan';
        default: return status;
    }
}

export default function KelolaArsipIndex({
    arsips,
    klasifikasis = [],
    unitOrganisasis = [],
    statusArsips = [],
    jenisArsips = [],
    sifatArsips = [],
    tingkatPerkembanganArsips = [],
    lokasiArsips = [],
    mediaArsips = [],
    kondisiArsips = [],
    tingkatAksesArsips = [],
}: IndexProps) {

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingArsip, setEditingArsip] = useState<Arsip | null>(null);
    const [detailArsip, setDetailArsip] = useState<DetailArsip | null>(null);
    const [detailHistory, setDetailHistory] = useState([]);
    const [detailTransitions, setDetailTransitions] = useState([]);
    const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
    const [resubmittingId, setResubmittingId] = useState<number | null>(null);

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

    const handleResubmit = (id: number) => {
        if (confirm('Ajukan ulang arsip ini untuk diverifikasi kembali?')) {
            setResubmittingId(id);
            router.post(
                `/arsip/${id}/resubmit`,
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setResubmittingId(null),
                },
            );
        }
    };

    return (
        <RouteGuard permission="arsip.create">
            <Head title="Kelola Arsip" />
            <PageContainer>
                <PageHeader
                    title="Kelola Arsip"
                    description="Input dan pantau arsip yang diajukan oleh unit Anda"
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Kelola Arsip', href: '/kelola-arsip' },
                    ]}
                    actions={
                        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Arsip
                        </Button>
                    }
                />

                <ContentCard title="Daftar Arsip Unit Anda" description="Seluruh arsip yang diajukan oleh unit organisasi Anda">
                    {arsips.data.length === 0 ? (
                        <EmptyTable
                            title="Belum ada arsip"
                            description="Belum ada arsip yang diajukan dari unit Anda."
                            icon={Archive}
                        />
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-md border border-border/60">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40">
                                            <TableHead className="w-[160px] font-semibold">Nomor Arsip</TableHead>
                                            <TableHead className="w-[110px] font-semibold">Tanggal</TableHead>
                                            <TableHead className="font-semibold">Judul</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="w-[100px] text-right font-semibold">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {arsips.data.map((arsip) => (
                                            <TableRow key={arsip.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {arsip.nomor_arsip}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(arsip.tanggal_arsip).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </TableCell>
                                                <TableCell className="max-w-[220px] truncate font-medium">
                                                    {arsip.judul}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <StatusBadge variant={workflowStatusVariant(arsip.workflow_status)}>
                                                            {workflowStatusLabel(arsip.workflow_status)}
                                                        </StatusBadge>
                                                        {arsip.workflow_status === 'revisi' && arsip.catatan_revisi && (
                                                            <span className="max-w-[220px] truncate text-[10px] text-destructive" title={arsip.catatan_revisi}>
                                                                {arsip.catatan_revisi}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            disabled={loadingDetailId === arsip.id}
                                                            onClick={() => openDetail(arsip.id)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {(arsip.workflow_status === 'revisi' ||
                                                            arsip.workflow_status === 'review') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => setEditingArsip(arsip)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        {arsip.workflow_status === 'revisi' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                disabled={resubmittingId === arsip.id}
                                                                onClick={() => handleResubmit(arsip.id)}
                                                                title="Ajukan Ulang"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
                                <span>
                                    Menampilkan {arsips.from || 0} hingga {arsips.to || 0} dari {arsips.total} arsip
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!arsips.prev_page_url}
                                        onClick={() => arsips.prev_page_url && router.get(arsips.prev_page_url, {}, { preserveState: true })}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!arsips.next_page_url}
                                        onClick={() => arsips.next_page_url && router.get(arsips.next_page_url, {}, { preserveState: true })}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </ContentCard>

                <ArsipCreateDialog
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    klasifikasis={klasifikasis}
                    unitOrganisasis={unitOrganisasis}
                    statusArsips={statusArsips}
                    jenisArsips={jenisArsips}
                    sifatArsips={sifatArsips}
                    tingkatPerkembanganArsips={tingkatPerkembanganArsips}
                    lokasiArsips={lokasiArsips}
                    mediaArsips={mediaArsips}
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
                        unitOrganisasis={unitOrganisasis}
                        statusArsips={statusArsips}
                        jenisArsips={jenisArsips}
                        sifatArsips={sifatArsips}
                        tingkatPerkembanganArsips={tingkatPerkembanganArsips}
                        lokasiArsips={lokasiArsips}
                        mediaArsips={mediaArsips}
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

KelolaArsipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kelola Arsip', href: '/kelola-arsip' },
    ],
};