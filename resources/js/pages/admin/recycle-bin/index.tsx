import { Head, router } from '@inertiajs/react';
import { Trash2, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
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

type RecycleBinProps = {
    arsips: {
        data: DeletedArsip[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        total: number;
    };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (seconds <= 0) {
        return <span className="font-semibold text-rose-500">Kadaluarsa</span>;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return <span className="font-medium text-amber-500">{hours} jam</span>;
    }

    if (minutes > 0) {
        return <span className="font-medium text-yellow-600">{minutes} menit</span>;
    }

    return <span className="font-medium text-rose-400">{seconds} detik</span>;
}

export default function RecycleBinIndex({ arsips }: RecycleBinProps) {
    const handleRestore = (id: number) => {
        if (confirm('Apakah Anda yakin ingin memulihkan arsip ini?')) {
            router.post(`/admin/recycle-bin/${id}/restore`);
        }
    };

    const handleForceDelete = (id: number) => {
        if (confirm('PERINGATAN: Tindakan ini akan menghapus arsip secara permanen beserta seluruh file versi & riwayat di dalamnya. Anda yakin?')) {
            router.delete(`/admin/recycle-bin/${id}/force-delete`);
        }
    };

    return (
        <>
            <Head title="Riwayat Arsip Dihapus" />

            <PageContainer>
                <PageHeader
                    title="Riwayat Arsip Dihapus (Recycle Bin)"
                    description="Daftar seluruh arsip yang dihapus sementara. Arsip akan otomatis dimusnahkan secara permanen setelah 24 jam."
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Riwayat Arsip Dihapus', href: index.url() },
                    ]}
                />

                <div className="flex flex-col gap-6">
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="flex items-start gap-3 p-4">
                            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                                <p className="font-bold">Informasi Penting:</p>
                                <p>Seluruh dokumen arsip dalam daftar di bawah ini berada dalam antrian pemusnahan otomatis. Pemulihan (Restore) akan mengembalikan dokumen ke repositori aktif beserta riwayatnya.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardContent className="p-0">
                            {arsips.data.length === 0 ? (
                                <div className="p-6">
                                    <EmptyTable
                                        icon={Trash2}
                                        title="Recycle bin kosong"
                                        description="Tidak ada dokumen arsip yang sedang dalam antrian pemusnahan."
                                    />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nomor Arsip</TableHead>
                                                <TableHead>Judul</TableHead>
                                                <TableHead>Unit Organisasi</TableHead>
                                                <TableHead>Dihapus Oleh</TableHead>
                                                <TableHead>Waktu Dihapus</TableHead>
                                                <TableHead>Sisa Waktu</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {arsips.data.map((arsip) => (
                                                <TableRow key={arsip.id}>
                                                    <TableCell className="font-mono text-xs font-semibold">
                                                        {arsip.nomor_arsip}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate font-medium">
                                                        {arsip.judul}
                                                    </TableCell>
                                                    <TableCell>{arsip.unit_organisasi}</TableCell>
                                                    <TableCell className="text-muted-foreground">{arsip.dihapus_oleh}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {arsip.deleted_at}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Countdown initialSeconds={arsip.sisa_waktu_detik} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-500 border border-rose-500/20">
                                                            Akan Dihapus
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                                                onClick={() => handleRestore(arsip.id)}
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                Pulihkan
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/20"
                                                                onClick={() => handleForceDelete(arsip.id)}
                                                            >
                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                                Hapus Permanen
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Simple Pagination */}
                    {arsips.last_page > 1 && (
                        <div className="flex justify-center gap-1">
                            {arsips.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => {
                                        if (link.url) {
                                            router.get(link.url);
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </PageContainer>
        </>
    );
}

RecycleBinIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Administrasi', href: '#' },
        { title: 'Riwayat Arsip Dihapus', href: index.url() },
    ],
};
