import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UploadCloud, FileText, X } from 'lucide-react';
import { useState } from 'react';
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
import { index, create } from '@/routes/arsip';

type MasterItem = {
    id: number;
    kode: string;
    nama: string;
};

type CreateProps = {
    klasifikasis: MasterItem[];
    jenisDokumens: MasterItem[];
    unitOrganisasis: MasterItem[];
    lokasiArsips: MasterItem[];
    statusArsips: MasterItem[];
};

export default function Create({
    klasifikasis,
    jenisDokumens,
    unitOrganisasis,
    lokasiArsips,
    statusArsips,
}: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        nomor_arsip: '',
        judul: '',
        deskripsi: '',
        tanggal_arsip: '',
        klasifikasi_arsip_id: '',
        jenis_dokumen_id: '',
        unit_organisasi_id: '',
        lokasi_arsip_id: '',
        status_arsip_id: '',
        file: null as File | null,
    });

    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('file', e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/arsip');
    };

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

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                    value={data.nomor_arsip}
                                    onChange={(e) => setData('nomor_arsip', e.target.value)}
                                    placeholder="Contoh: ARS/2026/00001"
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
                                    placeholder="Masukkan judul arsip"
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
                                    placeholder="Deskripsi singkat isi arsip (opsional)"
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
                                <Label>Berkas Digital</Label>
                                {data.file ? (
                                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{data.file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(data.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => setData('file', null)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                            dragActive ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/20'
                                        }`}
                                    >
                                        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Seret dan lepas berkas di sini, atau</p>
                                        <label className="mt-2 inline-flex h-8 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 cursor-pointer">
                                            Pilih Berkas
                                            <input
                                                type="file"
                                                className="sr-only"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                            />
                                        </label>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG hingga 10MB
                                        </p>
                                    </div>
                                )}
                                <InputError message={errors.file} />
                            </div>
                        </div>
                    </ContentCard>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href={index()}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
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
