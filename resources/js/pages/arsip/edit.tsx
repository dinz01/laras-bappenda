import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Save, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import InputError from '@/components/input-error';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
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

type DokumenArsip = {
    id: number;
    nama_original: string;
    nama_generated: string;
    ukuran: number;
    mime_type: string;
    path_penyimpanan: string;
    uploaded_at: string | null;
};

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    klasifikasi_arsip_id: number;
    lokasi_arsip_id: number | null;
    jenis_arsip_id: number | null;
    media_arsip_id: number | null;
    kondisi_arsip_id: number | null;
    status_arsip_id: number | null;
    tingkat_akses_arsip_id: number | null;
    retensi_arsip_id: number | null;
    unit_organisasi_id: number | null;
    created_by: number | null;
    dokumen?: DokumenArsip | null;
};

type EditProps = {
    arsip: Arsip;
    klasifikasis: MasterItem[];
    jenisArsips: MasterItem[];
    unitOrganisasis: MasterItem[];
    lokasiArsips: MasterItem[];
    statusArsips: MasterItem[];
};

function formatBytes(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function Edit({
    arsip,
    klasifikasis,
    jenisArsips,
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
        jenis_arsip_id: arsip.jenis_arsip_id?.toString() || '',
        unit_organisasi_id: arsip.unit_organisasi_id?.toString() || '',
        lokasi_arsip_id: arsip.lokasi_arsip_id?.toString() || '',
        status_arsip_id: arsip.status_arsip_id?.toString() || '',
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
        post(`/arsip/${arsip.id}`);
    };

    const handleDeleteFile = () => {
        if (confirm('Hapus dokumen ini? Tindakan tidak dapat dibatalkan.')) {
            router.delete(`/arsip/${arsip.id}/file`, { preserveScroll: true });
        }
    };

    return (
        <RouteGuard permission="arsip.update">
            <Head title={`Edit Arsip — ${arsip.nomor_arsip}`} />
            <PageContainer>
                <PageHeader
                    title="Edit Arsip"
                    description={`Perbarui data arsip ${arsip.nomor_arsip}`}
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                        {
                            title: arsip.nomor_arsip,
                            href: show({ arsip: arsip.id }),
                        },
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
                                    Nomor Arsip{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nomor_arsip"
                                    value={data.nomor_arsip}
                                    onChange={(e) =>
                                        setData('nomor_arsip', e.target.value)
                                    }
                                    className="border-border/60"
                                />
                                <InputError message={errors.nomor_arsip} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tanggal_arsip">
                                    Tanggal Arsip{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="tanggal_arsip"
                                    type="date"
                                    value={data.tanggal_arsip}
                                    onChange={(e) =>
                                        setData('tanggal_arsip', e.target.value)
                                    }
                                    className="border-border/60"
                                />
                                <InputError message={errors.tanggal_arsip} />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="judul">
                                    Judul Arsip{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="judul"
                                    value={data.judul}
                                    onChange={(e) =>
                                        setData('judul', e.target.value)
                                    }
                                    className="border-border/60"
                                />
                                <InputError message={errors.judul} />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="deskripsi">
                                    Keterangan / Deskripsi
                                </Label>
                                <textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) =>
                                        setData('deskripsi', e.target.value)
                                    }
                                    rows={3}
                                    className="flex w-full resize-none rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
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
                                    Klasifikasi Arsip{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.klasifikasi_arsip_id}
                                    onValueChange={(val) =>
                                        setData('klasifikasi_arsip_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="klasifikasi_arsip_id"
                                        className="border-border/60"
                                    >
                                        <SelectValue placeholder="Pilih klasifikasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {klasifikasis.map((opt) => (
                                            <SelectItem
                                                key={opt.id}
                                                value={opt.id.toString()}
                                            >
                                                {opt.kode} — {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.klasifikasi_arsip_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis_arsip_id">
                                    Jenis Arsip
                                </Label>
                                <Select
                                    value={data.jenis_arsip_id}
                                    onValueChange={(val) =>
                                        setData('jenis_arsip_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="jenis_arsip_id"
                                        className="border-border/60"
                                    >
                                        <SelectValue placeholder="Pilih jenis arsip..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jenisArsips.map((opt) => (
                                            <SelectItem
                                                key={opt.id}
                                                value={opt.id.toString()}
                                            >
                                                {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.jenis_arsip_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_organisasi_id">
                                    Unit Organisasi
                                </Label>
                                <Select
                                    value={data.unit_organisasi_id}
                                    onValueChange={(val) =>
                                        setData('unit_organisasi_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="unit_organisasi_id"
                                        className="border-border/60"
                                    >
                                        <SelectValue placeholder="Pilih unit organisasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitOrganisasis.map((opt) => (
                                            <SelectItem
                                                key={opt.id}
                                                value={opt.id.toString()}
                                            >
                                                {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={errors.unit_organisasi_id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lokasi_arsip_id">
                                    Lokasi Arsip
                                </Label>
                                <Select
                                    value={data.lokasi_arsip_id}
                                    onValueChange={(val) =>
                                        setData('lokasi_arsip_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="lokasi_arsip_id"
                                        className="border-border/60"
                                    >
                                        <SelectValue placeholder="Pilih lokasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lokasiArsips.map((opt) => (
                                            <SelectItem
                                                key={opt.id}
                                                value={opt.id.toString()}
                                            >
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
                                    onValueChange={(val) =>
                                        setData('status_arsip_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="status_arsip_id"
                                        className="border-border/60"
                                    >
                                        <SelectValue placeholder="Pilih status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusArsips.map((opt) => (
                                            <SelectItem
                                                key={opt.id}
                                                value={opt.id.toString()}
                                            >
                                                {opt.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status_arsip_id} />
                            </div>
                        </div>
                    </ContentCard>

                    {/* Dokumen Digital */}
                    <ContentCard
                        title="Dokumen Digital"
                        description="Upload berkas fisik arsip"
                    >
                        {arsip.dokumen && !data.file ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {arsip.dokumen.nama_original}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatBytes(
                                                    arsip.dokumen.ukuran,
                                                )}{' '}
                                                · {arsip.dokumen.mime_type}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 text-destructive hover:text-destructive"
                                        onClick={handleDeleteFile}
                                    >
                                        Hapus File
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Untuk mengganti file, unggah file baru di
                                    bawah ini:
                                </p>
                            </div>
                        ) : null}

                        <div
                            className={
                                arsip.dokumen && !data.file ? 'mt-3' : ''
                            }
                        >
                            {data.file ? (
                                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {data.file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatBytes(data.file.size)}
                                            </p>
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
                                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/60 bg-muted/20'
                                        }`}
                                >
                                    <UploadCloud className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        {arsip.dokumen
                                            ? 'Seret berkas pengganti, atau'
                                            : 'Seret dan lepas berkas di sini, atau'}
                                    </p>
                                    <label className="mt-2 inline-flex h-8 cursor-pointer items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
                                        {arsip.dokumen
                                            ? 'Pilih File Pengganti'
                                            : 'Pilih Berkas'}
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            onChange={(e) =>
                                                setData(
                                                    'file',
                                                    e.target.files
                                                        ? e.target.files[0]
                                                        : null,
                                                )
                                            }
                                        />
                                    </label>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                                        hingga 10MB
                                    </p>
                                </div>
                            )}
                            <InputError
                                message={errors.file}
                                className="mt-2"
                            />
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
        </RouteGuard>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Repository Arsip', href: '/arsip' },
        { title: 'Edit', href: '#' },
    ],
};
