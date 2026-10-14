import { Head, router } from '@inertiajs/react';
import { Info, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Can } from '@/components/Can';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { DataTablePagination } from '@/components/Tables/data-table-pagination';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index } from '@/routes/admin/recycle-bin';

type DeletedArsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    unit_organisasi: string;
    dihapus_oleh: string;
    deleted_at: string;
    sisa_waktu_detik: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedArsips = {
    data: DeletedArsip[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    per_page?: number;
};

type RecycleBinProps = {
    arsips: PaginatedArsips;
};

function Countdown({ initialSeconds }: { initialSeconds: number }) {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (seconds <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setSeconds((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);

    if (seconds <= 0) {
        return (
            <span className="font-bold text-destructive">Siap Dimusnahkan</span>
        );
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return <span className="font-medium text-amber-500">{hours} jam</span>;
    }

    if (minutes > 0) {
        return (
            <span className="font-medium text-yellow-600">{minutes} menit</span>
        );
    }

    return <span className="font-medium text-rose-400">{seconds} detik</span>;
}

export default function RecycleBinIndex({ arsips }: RecycleBinProps) {
    const [restoreItem, setRestoreItem] = useState<DeletedArsip | null>(null);
    const [forceDeleteItem, setForceDeleteItem] = useState<DeletedArsip | null>(
        null,
    );
    const [actionLoading, setActionLoading] = useState(false);

    const confirmRestore = () => {
        if (!restoreItem) {
            return;
        }

        setActionLoading(true);
        router.post(
            `/admin/recycle-bin/${restoreItem.id}/restore`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRestoreItem(null);
                },
                onError: () => {
                    toast.error('Gagal memulihkan arsip.');
                },
                onFinish: () => {
                    setActionLoading(false);
                },
            },
        );
    };

    const confirmForceDelete = () => {
        if (!forceDeleteItem) {
            return;
        }

        setActionLoading(true);
        router.delete(`/admin/recycle-bin/${forceDeleteItem.id}/force-delete`, {
            preserveScroll: true,
            onSuccess: () => {
                setForceDeleteItem(null);
            },
            onError: () => {
                toast.error('Gagal memusnahkan arsip.');
            },
            onFinish: () => {
                setActionLoading(false);
            },
        });
    };

    return (
        <RouteGuard permission="admin-recycle-bin.view">
            <Head title="Riwayat Arsip Dihapus" />

            <PageContainer>
                <PageHeader
                    title="Riwayat Arsip Dihapus"
                    description="Daftar seluruh arsip yang dihapus sementara. Arsip akan otomatis dimusnahkan secara permanen setelah 24 jam."
                    breadcrumb={[
                        { title: 'ADMINISTRASI' },
                        { title: 'Riwayat Arsip Dihapus', href: index.url() },
                    ]}
                />

                <div className="flex flex-col gap-6">
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="flex items-start gap-3 p-4">
                            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            <div className="space-y-1 text-xs text-amber-800 dark:text-amber-300">
                                <p className="font-bold">Informasi Penting:</p>
                                <p>
                                    Seluruh dokumen arsip dalam daftar di bawah
                                    ini berada dalam antrian pemusnahan
                                    otomatis. Pemulihan (Restore) akan
                                    mengembalikan dokumen ke repositori aktif
                                    beserta riwayatnya.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <ContentCard
                        title="Daftar Arsip Dihapus"
                        description="Daftar arsip dalam antrian pemusnahan otomatis yang dapat dipulihkan atau dimusnahkan permanen"
                    >
                        <div className="space-y-4">
                            {arsips.data.length === 0 ? (
                                <EmptyTable
                                    icon={Trash2}
                                    title="Recycle bin kosong"
                                    description="Tidak ada dokumen arsip yang sedang dalam antrian pemusnahan."
                                />
                            ) : (
                                <>
                                    {/* Mobile card view */}
                                    <div className="flex flex-col gap-3 md:hidden">
                                        {arsips.data.map((arsip) => (
                                            <div
                                                key={arsip.id}
                                                className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="line-clamp-2 flex-1 text-sm leading-snug font-semibold text-foreground">
                                                        {arsip.judul}
                                                    </p>
                                                    <StatusBadge variant="danger">
                                                        Akan Dihapus
                                                    </StatusBadge>
                                                </div>
                                                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                                    {arsip.nomor_arsip}
                                                </p>
                                                <div className="mt-2 grid grid-cols-2 gap-y-1 text-[11px] text-muted-foreground">
                                                    <span>Unit:</span>
                                                    <span className="truncate font-medium text-foreground">
                                                        {arsip.unit_organisasi}
                                                    </span>
                                                    <span>Dihapus oleh:</span>
                                                    <span className="truncate font-medium text-foreground">
                                                        {arsip.dihapus_oleh}
                                                    </span>
                                                    <span>Waktu Dihapus:</span>
                                                    <span className="text-foreground">
                                                        {arsip.deleted_at}
                                                    </span>
                                                    <span>Sisa waktu:</span>
                                                    <span>
                                                        <Countdown
                                                            initialSeconds={
                                                                arsip.sisa_waktu_detik
                                                            }
                                                        />
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
                                                    <Can permission="admin-recycle-bin.restore">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 flex-1 gap-1.5 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                            onClick={() =>
                                                                setRestoreItem(
                                                                    arsip,
                                                                )
                                                            }
                                                        >
                                                            Pulihkan
                                                        </Button>
                                                    </Can>
                                                    <Can permission="admin-recycle-bin.force-delete">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 flex-1 gap-1.5 border-rose-500/20 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                                                            onClick={() =>
                                                                setForceDeleteItem(
                                                                    arsip,
                                                                )
                                                            }
                                                        >
                                                            Hapus Permanen
                                                        </Button>
                                                    </Can>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop table view */}
                                    <div className="hidden overflow-hidden rounded-md border border-border/60 md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/40">
                                                    <TableHead className="w-[140px] font-semibold">
                                                        Nomor Arsip
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Judul
                                                    </TableHead>
                                                    <TableHead className="w-[150px] font-semibold">
                                                        Unit Organisasi
                                                    </TableHead>
                                                    <TableHead className="w-[140px] font-semibold">
                                                        Dihapus Oleh
                                                    </TableHead>
                                                    <TableHead className="w-[150px] font-semibold">
                                                        Waktu Dihapus
                                                    </TableHead>
                                                    <TableHead className="w-[110px] font-semibold">
                                                        Sisa Waktu
                                                    </TableHead>
                                                    <TableHead className="w-[110px] font-semibold">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="w-[200px] text-center font-semibold">
                                                        Aksi
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {arsips.data.map((arsip) => (
                                                    <TableRow
                                                        key={arsip.id}
                                                        className="transition-colors hover:bg-muted/30"
                                                    >
                                                        <TableCell
                                                            className="font-mono text-xs whitespace-nowrap text-muted-foreground"
                                                            title={
                                                                arsip.nomor_arsip
                                                            }
                                                        >
                                                            {arsip.nomor_arsip}
                                                        </TableCell>
                                                        <TableCell
                                                            className="max-w-[200px] truncate text-sm font-medium"
                                                            title={arsip.judul}
                                                        >
                                                            {arsip.judul}
                                                        </TableCell>
                                                        <TableCell
                                                            className="max-w-[150px] truncate text-sm text-muted-foreground"
                                                            title={
                                                                arsip.unit_organisasi
                                                            }
                                                        >
                                                            {
                                                                arsip.unit_organisasi
                                                            }
                                                        </TableCell>
                                                        <TableCell
                                                            className="max-w-[140px] truncate text-sm text-muted-foreground"
                                                            title={
                                                                arsip.dihapus_oleh
                                                            }
                                                        >
                                                            {arsip.dihapus_oleh}
                                                        </TableCell>
                                                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                                                            {arsip.deleted_at}
                                                        </TableCell>
                                                        <TableCell className="text-sm whitespace-nowrap">
                                                            <Countdown
                                                                initialSeconds={
                                                                    arsip.sisa_waktu_detik
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="whitespace-nowrap">
                                                            <StatusBadge variant="danger">
                                                                Akan Dihapus
                                                            </StatusBadge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Can permission="admin-recycle-bin.restore">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 gap-1.5 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                                                        onClick={() =>
                                                                            setRestoreItem(
                                                                                arsip,
                                                                            )
                                                                        }
                                                                    >
                                                                        Pulihkan
                                                                    </Button>
                                                                </Can>
                                                                <Can permission="admin-recycle-bin.force-delete">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 gap-1.5 border-rose-500/20 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                                                                        onClick={() =>
                                                                            setForceDeleteItem(
                                                                                arsip,
                                                                            )
                                                                        }
                                                                    >
                                                                        Hapus
                                                                        Permanen
                                                                    </Button>
                                                                </Can>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <DataTablePagination
                                        data={arsips}
                                        itemName="arsip"
                                    />
                                </>
                            )}
                        </div>
                    </ContentCard>
                </div>
            </PageContainer>

            {/* Dialog Konfirmasi Pulihkan */}
            <ConfirmDialog
                isOpen={restoreItem !== null}
                onClose={() => !actionLoading && setRestoreItem(null)}
                onConfirm={confirmRestore}
                title="Pulihkan Arsip"
                description={`Apakah Anda yakin ingin memulihkan arsip "${restoreItem?.judul}" (${restoreItem?.nomor_arsip}) ke repositori aktif?`}
                confirmLabel="Pulihkan Arsip"
                loading={actionLoading}
            />

            {/* Dialog Konfirmasi Hapus Permanen */}
            <ConfirmDialog
                isOpen={forceDeleteItem !== null}
                onClose={() => !actionLoading && setForceDeleteItem(null)}
                onConfirm={confirmForceDelete}
                title="Hapus Permanen Arsip"
                description={`PERINGATAN: Tindakan ini akan menghapus arsip "${forceDeleteItem?.judul}" (${forceDeleteItem?.nomor_arsip}) secara permanen beserta seluruh file versi dan riwayatnya. Data yang dihapus tidak dapat dipulihkan kembali.`}
                confirmLabel="Hapus Permanen"
                destructive
                loading={actionLoading}
            />
        </RouteGuard>
    );
}

RecycleBinIndex.layout = {
    breadcrumbs: [
        { title: 'ADMINISTRASI' },
        { title: 'Riwayat Arsip Dihapus', href: index.url() },
    ],
};
