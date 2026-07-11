import { Head, Link } from '@inertiajs/react';
import { Archive, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index, create, show } from '@/routes/arsip';

type ArsipRow = {
    id: number;
    nomor_arsip: string;
    judul: string;
    klasifikasi: string;
    unit_organisasi: string;
    lokasi: string;
    status: string;
};

const dummyData: ArsipRow[] = [
    { id: 1, nomor_arsip: 'ARS/2026/00001', judul: 'Laporan Keuangan Triwulan I', klasifikasi: 'KU.01', unit_organisasi: 'Bidang Keuangan', lokasi: 'Rak A-01', status: 'Aktif' },
    { id: 2, nomor_arsip: 'ARS/2026/00002', judul: 'SK Pengangkatan Pegawai', klasifikasi: 'KP.03', unit_organisasi: 'Sekretariat', lokasi: 'Rak B-03', status: 'Aktif' },
    { id: 3, nomor_arsip: 'ARS/2026/00003', judul: 'Berita Acara Pemeriksaan', klasifikasi: 'HK.02', unit_organisasi: 'Bidang Pengawasan', lokasi: 'Rak C-02', status: 'Inaktif' },
    { id: 4, nomor_arsip: 'ARS/2026/00004', judul: 'Laporan Realisasi Anggaran', klasifikasi: 'KU.04', unit_organisasi: 'Bidang Keuangan', lokasi: 'Rak A-04', status: 'Aktif' },
    { id: 5, nomor_arsip: 'ARS/2026/00005', judul: 'Surat Keputusan Kepala Dinas', klasifikasi: 'HK.01', unit_organisasi: 'Kepala Dinas', lokasi: 'Rak D-01', status: 'Aktif' },
];

function statusVariant(status: string) {
    if (status === 'Aktif') {
return 'success' as const;
}

    if (status === 'Inaktif') {
return 'secondary' as const;
}

    return 'warning' as const;
}

export default function Index() {
    const [search, setSearch] = useState('');

    const filtered = dummyData.filter(
        (a) =>
            a.nomor_arsip.toLowerCase().includes(search.toLowerCase()) ||
            a.judul.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <>
            <Head title="Repository Arsip" />
            <PageContainer>
                <PageHeader
                    title="Repository Arsip"
                    description="Kelola seluruh arsip digital instansi"
                    breadcrumb={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Repository Arsip', href: index() }]}
                    actions={
                        <Button asChild size="sm">
                            <Link href={create()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Arsip
                            </Link>
                        </Button>
                    }
                />

                <ContentCard title="Daftar Arsip" description="Data seluruh arsip yang telah diregistrasi">
                    <DataToolbar
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Cari nomor atau judul arsip..."
                    />

                    {filtered.length === 0 ? (
                        <EmptyTable
                            title="Belum ada arsip"
                            description="Tambahkan arsip baru dengan menekan tombol Tambah Arsip"
                            icon={Archive}
                        />
                    ) : (
                        <div className="rounded-md border border-border/60 mt-4 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead className="w-[160px] font-semibold">Nomor Arsip</TableHead>
                                        <TableHead className="font-semibold">Judul</TableHead>
                                        <TableHead className="font-semibold">Klasifikasi</TableHead>
                                        <TableHead className="font-semibold">Unit Organisasi</TableHead>
                                        <TableHead className="font-semibold">Lokasi</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="w-[80px] text-right font-semibold">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((arsip) => (
                                        <TableRow key={arsip.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-xs text-muted-foreground">{arsip.nomor_arsip}</TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate">{arsip.judul}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-mono">
                                                    {arsip.klasifikasi}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{arsip.unit_organisasi}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{arsip.lokasi}</TableCell>
                                            <TableCell>
                                                <StatusBadge variant={statusVariant(arsip.status)}>
                                                    {arsip.status}
                                                </StatusBadge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <span className="sr-only">Menu aksi</span>
                                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <circle cx="4" cy="10" r="1.5" />
                                                                <circle cx="10" cy="10" r="1.5" />
                                                                <circle cx="16" cy="10" r="1.5" />
                                                            </svg>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={show({ arsip: arsip.id })} className="flex items-center gap-2 cursor-pointer">
                                                                <Eye className="h-4 w-4" />
                                                                Detail
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/arsip/${arsip.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                                <Pencil className="h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination placeholder */}
                    <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
                        <span>Menampilkan {filtered.length} dari {dummyData.length} arsip</span>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" disabled>
                                Sebelumnya
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                </ContentCard>
            </PageContainer>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Repository Arsip', href: '/arsip' },
    ],
};
