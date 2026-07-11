import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { ContentCard } from '@/components/Cards/content-card';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index, show } from '@/routes/arsip';

const klasifikasiOptions = [
    { value: '1', label: 'KU.01 — Keuangan' },
    { value: '2', label: 'KP.03 — Kepegawaian' },
    { value: '3', label: 'HK.02 — Hukum' },
];

const jenisDokumenOptions = [
    { value: '1', label: 'Surat' },
    { value: '2', label: 'Laporan' },
    { value: '3', label: 'Berita Acara' },
    { value: '4', label: 'Keputusan' },
];

const unitOrganisasiOptions = [
    { value: '1', label: 'Sekretariat' },
    { value: '2', label: 'Bidang Keuangan' },
    { value: '3', label: 'Bidang Pendataan' },
    { value: '4', label: 'Bidang Pengawasan' },
];

const lokasiOptions = [
    { value: '1', label: 'Rak A-01 — Ruang Arsip Utama' },
    { value: '2', label: 'Rak B-03 — Ruang Arsip Sekretariat' },
    { value: '3', label: 'Rak C-02 — Ruang Arsip Bidang' },
];

const statusOptions = [
    { value: '1', label: 'Aktif' },
    { value: '2', label: 'Inaktif' },
    { value: '3', label: 'Musnah' },
];

// Dummy data default values
const dummy = {
    id: 1,
    nomor_arsip: 'ARS/2026/00001',
    judul: 'Laporan Keuangan Triwulan I',
    deskripsi: 'Laporan realisasi anggaran semester pertama tahun 2026.',
    tanggal_arsip: '2026-01-31',
    klasifikasi_arsip_id: '1',
    jenis_dokumen_id: '2',
    unit_organisasi_id: '2',
    lokasi_arsip_id: '1',
    status_arsip_id: '1',
};

export default function Edit() {
    return (
        <>
            <Head title={`Edit Arsip — ${dummy.nomor_arsip}`} />
            <PageContainer>
                <PageHeader
                    title="Edit Arsip"
                    description={`Perbarui data arsip ${dummy.nomor_arsip}`}
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                        { title: dummy.nomor_arsip, href: show({ arsip: dummy.id }) },
                        { title: 'Edit', href: '#' },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={show({ arsip: dummy.id })}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <form className="space-y-6">
                    {/* Informasi Dasar */}
                    <ContentCard
                        title="Informasi Dasar"
                        description="Data pokok arsip"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nomor_arsip">
                                    Nomor Arsip <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nomor_arsip"
                                    name="nomor_arsip"
                                    defaultValue={dummy.nomor_arsip}
                                    className="border-border/60"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tanggal_arsip">
                                    Tanggal Arsip <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="tanggal_arsip"
                                    name="tanggal_arsip"
                                    type="date"
                                    defaultValue={dummy.tanggal_arsip}
                                    className="border-border/60"
                                />
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="judul">
                                    Judul Arsip <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="judul"
                                    name="judul"
                                    defaultValue={dummy.judul}
                                    className="border-border/60"
                                />
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="deskripsi">Keterangan / Deskripsi</Label>
                                <textarea
                                    id="deskripsi"
                                    name="deskripsi"
                                    rows={3}
                                    defaultValue={dummy.deskripsi}
                                    className="flex w-full rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                />
                            </div>
                        </div>
                    </ContentCard>

                    {/* Klasifikasi & Referensi */}
                    <ContentCard
                        title="Klasifikasi & Referensi"
                        description="Kategori dan pengelompokan arsip"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="klasifikasi_arsip_id">
                                    Klasifikasi Arsip <span className="text-destructive">*</span>
                                </Label>
                                <Select name="klasifikasi_arsip_id" defaultValue={dummy.klasifikasi_arsip_id}>
                                    <SelectTrigger id="klasifikasi_arsip_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih klasifikasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {klasifikasiOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis_dokumen_id">Jenis Dokumen</Label>
                                <Select name="jenis_dokumen_id" defaultValue={dummy.jenis_dokumen_id}>
                                    <SelectTrigger id="jenis_dokumen_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih jenis dokumen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jenisDokumenOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_organisasi_id">Unit Organisasi</Label>
                                <Select name="unit_organisasi_id" defaultValue={dummy.unit_organisasi_id}>
                                    <SelectTrigger id="unit_organisasi_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih unit organisasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitOrganisasiOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lokasi_arsip_id">Lokasi Arsip</Label>
                                <Select name="lokasi_arsip_id" defaultValue={dummy.lokasi_arsip_id}>
                                    <SelectTrigger id="lokasi_arsip_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih lokasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lokasiOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status_arsip_id">Status</Label>
                                <Select name="status_arsip_id" defaultValue={dummy.status_arsip_id}>
                                    <SelectTrigger id="status_arsip_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </ContentCard>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={show({ arsip: dummy.id })}>Batal</Link>
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Perbarui Arsip
                        </Button>
                    </div>
                </form>
            </PageContainer>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Repository Arsip', href: '/arsip' },
        { title: 'Edit', href: '#' },
    ],
};
