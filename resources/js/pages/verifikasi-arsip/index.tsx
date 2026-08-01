import { Head, router } from '@inertiajs/react';
import { ClipboardCheck, Eye } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
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
import { ArsipDetailDialog } from '../arsip/detail-dialog';
import type { DetailArsip } from '../arsip/detail-dialog';

type MasterItem = { id: number; kode: string; nama: string };

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    tanggal_arsip: string;
    created_at: string;
    klasifikasi_arsip?: MasterItem | null;
    unit_organisasi?: MasterItem | null;
    creator?: { id: number; name: string } | null;
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
};

export default function VerifikasiArsipIndex({ arsips }: IndexProps) {
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [catatan, setCatatan] = useState('');
    const [detailArsip, setDetailArsip] = useState<DetailArsip | null>(null);
    const [detailHistory, setDetailHistory] = useState([]);
    const [detailTransitions, setDetailTransitions] = useState([]);
    const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

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

    const handleVerify = (id: number) => {
        if (confirm('Setujui arsip ini?')) {
            setProcessingId(id);
            router.post(
                `/arsip/${id}/verify`,
                {},
                { preserveScroll: true, onFinish: () => setProcessingId(null) },
            );
        }
    };

    const handleReject = (id: number) => {
        if (!catatan.trim()) {
            return;
        }

        setProcessingId(id);
        router.post(
            `/arsip/${id}/reject`,
            { catatan_revisi: catatan },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectingId(null);
                    setCatatan('');
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };

    return (
        <RouteGuard permission="workflow.approve">
            <Head title="Verifikasi Arsip" />
            <PageContainer>
                <PageHeader
                    title="Verifikasi Arsip"
                    description="Arsip yang menunggu verifikasi Arsiparis"
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Verifikasi Arsip', href: '/verifikasi-arsip' },
                    ]}
                />

                <ContentCard title="Antrian Verifikasi" description="Arsip berstatus Menunggu Verifikasi, diurutkan dari yang paling lama masuk">
                    {arsips.data.length === 0 ? (
                        <EmptyTable
                            title="Tidak ada arsip menunggu verifikasi"
                            description="Semua arsip yang masuk sudah diproses."
                            icon={ClipboardCheck}
                        />
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-md border border-border/60">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40">
                                            <TableHead className="w-[160px] font-semibold">Nomor Arsip</TableHead>
                                            <TableHead className="font-semibold">Judul</TableHead>
                                            <TableHead className="font-semibold">Unit</TableHead>
                                            <TableHead className="font-semibold">Diajukan oleh</TableHead>
                                            <TableHead className="w-[220px] text-right font-semibold">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {arsips.data.map((arsip) => (
                                            <TableRow key={arsip.id} className="hover:bg-muted/30">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {arsip.nomor_arsip}
                                                </TableCell>
                                                <TableCell className="max-w-[240px] truncate font-medium">
                                                    {arsip.judul}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {arsip.unit_organisasi?.nama || '-'}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {arsip.creator?.name || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {rejectingId === arsip.id ? (
                                                        <div className="flex flex-col items-end gap-2">
                                                            <textarea
                                                                value={catatan}
                                                                onChange={(e) => setCatatan(e.target.value)}
                                                                rows={2}
                                                                placeholder="Catatan revisi..."
                                                                className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                                            />
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    disabled={processingId === arsip.id}
                                                                    onClick={() => handleReject(arsip.id)}
                                                                >
                                                                    Kirim
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setRejectingId(null);
                                                                        setCatatan('');
                                                                    }}
                                                                >
                                                                    Batal
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
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
                                                            <Button
                                                                size="sm"
                                                                disabled={processingId === arsip.id}
                                                                onClick={() => handleVerify(arsip.id)}
                                                            >
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={() => setRejectingId(arsip.id)}
                                                            >
                                                                Tolak
                                                            </Button>
                                                        </div>
                                                    )}
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

VerifikasiArsipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Verifikasi Arsip', href: '/verifikasi-arsip' },
    ],
};