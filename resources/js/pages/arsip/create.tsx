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
import { index, create } from '@/routes/arsip';

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

export default function Create() {
    return (
        <>
            <Head title="Tambah Arsip" />
            <PageContainer>
                <PageHeader
                    title="Tambah Arsip"
                    description="Registrasi arsip baru ke dalam repositori"
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                        { title: 'Tambah', href: create() },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index()}>
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
                        description="Data pokok arsip yang wajib diisi"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nomor_arsip">
                                    Nomor Arsip <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nomor_arsip"
                                    name="nomor_arsip"
                                    placeholder="Contoh: ARS/2026/00001"
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
                                    placeholder="Masukkan judul arsip"
                                    className="border-border/60"
                                />
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="deskripsi">Keterangan / Deskripsi</Label>
                                <textarea
                                    id="deskripsi"
                                    name="deskripsi"
                                    rows={3}
                                    placeholder="Deskripsi singkat isi arsip (opsional)"
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
                                <Select name="klasifikasi_arsip_id">
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
                                <Select name="jenis_dokumen_id">
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
                                <Select name="unit_organisasi_id">
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
                                <Select name="lokasi_arsip_id">
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
                                <Select name="status_arsip_id" defaultValue="1">
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
                            <Link href={index()}>Batal</Link>
                        </Button>
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Arsip
                        </Button>
                    </div>
                </form>
            </PageContainer>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Repository Arsip', href: '/arsip' },
        { title: 'Tambah', href: '/arsip/create' },
    ],
};
