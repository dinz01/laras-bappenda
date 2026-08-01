import { Head, router } from '@inertiajs/react';
import { FileSignature } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type MasterItem = { id: number; kode: string; nama: string };

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
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
};

export default function KelolaTteIndex({ arsips }: IndexProps) {
    const [signingArsip, setSigningArsip] = useState<Arsip | null>(null);
    const [sandiPimpinan, setSandiPimpinan] = useState('');
    const [catatan, setCatatan] = useState('');
    const [processing, setProcessing] = useState(false);

    const openSignDialog = (arsip: Arsip) => {
        setSigningArsip(arsip);
        setSandiPimpinan('');
        setCatatan('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!signingArsip || !sandiPimpinan.trim()) return;

        setProcessing(true);
        router.post(
            `/arsip/${signingArsip.id}/ajukan-tte`,
            { sandi_pimpinan: sandiPimpinan, catatan },
            {
                preserveScroll: true,
                onSuccess: () => setSigningArsip(null),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <RouteGuard permission="workflow.tte">
            <Head title="Kelola TTE" />
            <PageContainer>
                <PageHeader
                    title="Kelola TTE"
                    description="Arsip yang menunggu tanda tangan elektronik"
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Kelola TTE', href: '/kelola-tte' },
                    ]}
                />

                <ContentCard title="Antrian TTE" description="Arsip berstatus Disetujui, menunggu tanda tangan elektronik">
                    {arsips.data.length === 0 ? (
                        <EmptyTable
                            title="Tidak ada arsip menunggu TTE"
                            description="Semua arsip yang disetujui sudah ditandatangani."
                            icon={FileSignature}
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
                                            <TableHead className="w-[160px] text-right font-semibold">Aksi</TableHead>
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
                                                    <Button size="sm" onClick={() => openSignDialog(arsip)}>
                                                        <FileSignature className="mr-1.5 h-4 w-4" />
                                                        Ajukan TTE
                                                    </Button>
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

                <Dialog open={!!signingArsip} onOpenChange={(open) => !open && setSigningArsip(null)}>
                    <DialogContent className="border-border/60 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Ajukan TTE — {signingArsip?.nomor_arsip}</DialogTitle>
                            <DialogDescription>
                                Tanda tangan elektronik ini bersifat simulasi (dummy) untuk keperluan demo.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sandi_pimpinan">
                                    Sandi Pimpinan <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="sandi_pimpinan"
                                    type="password"
                                    value={sandiPimpinan}
                                    onChange={(e) => setSandiPimpinan(e.target.value)}
                                    placeholder="Masukkan sandi..."
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                                <textarea
                                    id="catatan"
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    rows={2}
                                    placeholder="Catatan tambahan..."
                                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setSigningArsip(null)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Ajukan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageContainer>
        </RouteGuard>
    );
}

KelolaTteIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Kelola TTE', href: '/kelola-tte' },
    ],
};