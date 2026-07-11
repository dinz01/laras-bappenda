import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { ContentCard } from '@/components/Cards/content-card';
import InputError from '@/components/input-error';
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

type MasterItem = {
    id: number;
    kode: string;
    nama: string;
};

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    file_path: string | null;
    klasifikasi_arsip_id: number;
    lokasi_arsip_id: number | null;
    jenis_dokumen_id: number | null;
    media_arsip_id: number | null;
    kondisi_arsip_id: number | null;
    status_arsip_id: number | null;
    tingkat_akses_arsip_id: number | null;
    retensi_arsip_id: number | null;
    unit_organisasi_id: number | null;
    created_by: number | null;
};

type EditProps = {
    arsip: Arsip;
    klasifikasis: MasterItem[];
    jenisDokumens: MasterItem[];
    unitOrganisasis: MasterItem[];
    lokasiArsips: MasterItem[];
    statusArsips: MasterItem[];
};

export default function Edit({
    arsip,
    klasifikasis,
    jenisDokumens,
    unitOrganisasis,
    lokasiArsips,
    statusArsips,
}: EditProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        nomor_arsip: arsip.nomor_arsip || '',
        judul: arsip.judul || '',
        deskripsi: arsip.deskripsi || '',
        tanggal_arsip: arsip.tanggal_arsip || '',
        klasifikasi_arsip_id: arsip.klasifikasi_arsip_id?.toString() || '',
        jenis_dokumen_id: arsip.jenis_dokumen_id?.toString() || '',
        unit_organisasi_id: arsip.unit_organisasi_id?.toString() || '',
        lokasi_arsip_id: arsip.lokasi_arsip_id?.toString() || '',
        status_arsip_id: arsip.status_arsip_id?.toString() || '',
        file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use post with _method: 'put' to support file upload on update
        post(`/arsip/${arsip.id}`);
    };

    return (
        <>
            <Head title={`Edit Arsip — ${arsip.nomor_arsip}`} />
            <PageContainer>
                <PageHeader
                    title="Edit Arsip"
                    description={`Perbarui data arsip ${arsip.nomor_arsip}`}
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                        { title: arsip.nomor_arsip, href: show({ arsip: arsip.id }) },
                        { title: 'Edit', href: '#' },
                    ]}
                    actions={
                        <Button variant="outline" size="sm" asChild>
                            <Link href={show({ arsip: arsip.id })}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                    value={data.nomor_arsip}
                                    onChange={(e) => setData('nomor_arsip', e.target.value)}
                                    className="border-border/60"
                                />
                                <InputError message={errors.nomor_arsip} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tanggal_arsip">
                                    Tanggal Arsip <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="tanggal_arsip"
                                    type="date"
                                    value={data.tanggal_arsip}
                                    onChange={(e) => setData('tanggal_arsip', e.target.value)}
                                    className="border-border/60"
                                />
                                <InputError message={errors.tanggal_arsip} />
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="judul">
                                    Judul Arsip <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="judul"
                                    value={data.judul}
                                    onChange={(e) => setData('judul', e.target.value)}
                                    className="border-border/60"
                                />
                                <InputError message={errors.judul} />
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <Label htmlFor="deskripsi">Keterangan / Deskripsi</Label>
                                <textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    rows={3}
                                    className="flex w-full rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                                />
                                <InputError message={errors.deskripsi} />
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
                                <Select
                                    value={data.klasifikasi_arsip_id}
                                    onValueChange={(val) => setData('klasifikasi_arsip_id', val)}
                                >
                                    <SelectTrigger id="klasifikasi_arsip_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih klasifikasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {klasifikasis.map((opt) => (
                                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                                {opt.kode} — {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.klasifikasi_arsip_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis_dokumen_id">Jenis Dokumen</Label>
                                <Select
                                    value={data.jenis_dokumen_id}
                                    onValueChange={(val) => setData('jenis_dokumen_id', val)}
                                >
                                    <SelectTrigger id="jenis_dokumen_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih jenis dokumen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jenisDokumens.map((opt) => (
                                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                                {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.jenis_dokumen_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_organisasi_id">Unit Organisasi</Label>
                                <Select
                                    value={data.unit_organisasi_id}
                                    onValueChange={(val) => setData('unit_organisasi_id', val)}
                                >
                                    <SelectTrigger id="unit_organisasi_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih unit organisasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitOrganisasis.map((opt) => (
                                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                                {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.unit_organisasi_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lokasi_arsip_id">Lokasi Arsip</Label>
                                <Select
                                    value={data.lokasi_arsip_id}
                                    onValueChange={(val) => setData('lokasi_arsip_id', val)}
                                >
                                    <SelectTrigger id="lokasi_arsip_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih lokasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lokasiArsips.map((opt) => (
                                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                                {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.lokasi_arsip_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status_arsip_id">Status</Label>
                                <Select
                                    value={data.status_arsip_id}
                                    onValueChange={(val) => setData('status_arsip_id', val)}
                                >
                                    <SelectTrigger id="status_arsip_id" className="border-border/60">
                                        <SelectValue placeholder="Pilih status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusArsips.map((opt) => (
                                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                                {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status_arsip_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">Berkas Digital (Pilih jika ingin mengganti)</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                    className="border-border/60"
                                />
                                <InputError message={errors.file} />
                            </div>
                        </div>
                    </ContentCard>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={show({ arsip: arsip.id })}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
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
