import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Save, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { BarcodePreview } from '@/components/BarcodePreview';
import { ContentCard } from '@/components/Cards/content-card';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
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
import { index } from '@/routes/arsip';
import { focusFirstInvalidField } from '@/utils/form-validation';

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
    kategori_arsip_id: number | null;
    no_register?: string | null;
    nop?: string | null;
    npwpd?: string | null;
    nama_wajib_pajak?: string | null;
    klasifikasi_arsip_id: number;
    lokasi_arsip_id: number | null;
    jenis_arsip_id: number | null;
    media_arsip_id: number | null;
    kondisi_arsip_id: number | null;
    tingkat_akses_arsip_id: number | null;
    retensi_arsip_id: number | null;
    unit_organisasi_id: number | null;
    created_by: number | null;
    dokumen?: DokumenArsip | null;
};

type EditProps = {
    arsip: Arsip;
    klasifikasis: MasterItem[];
    kategoriArsips?: MasterItem[];
    jenisArsips: MasterItem[];
    unitOrganisasis: MasterItem[];
    lokasiArsips: MasterItem[];
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
    kategoriArsips = [],
    jenisArsips,
    unitOrganisasis,
    lokasiArsips,
}: EditProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        nomor_arsip: arsip.nomor_arsip || '',
        judul: arsip.judul || '',
        deskripsi: arsip.deskripsi || '',
        tanggal_arsip: arsip.tanggal_arsip || '',
        kategori_arsip_id: arsip.kategori_arsip_id?.toString() || '',
        no_register: arsip.no_register || '',
        nop: arsip.nop || '',
        npwpd: arsip.npwpd || '',
        nama_wajib_pajak: arsip.nama_wajib_pajak || '',
        klasifikasi_arsip_id: arsip.klasifikasi_arsip_id?.toString() || '',
        jenis_arsip_id: arsip.jenis_arsip_id?.toString() || '',
        unit_organisasi_id: arsip.unit_organisasi_id?.toString() || '',
        lokasi_arsip_id: arsip.lokasi_arsip_id?.toString() || '',
        file: null as File | null,
    });

    const selectedKategori = kategoriArsips.find(
        (k) => k.id.toString() === data.kategori_arsip_id,
    );
    const isPajakDaerah =
        selectedKategori?.nama === 'Arsip Pelayanan Pajak Daerah' ||
        selectedKategori?.kode === 'KAT-002';

    const formRef = useRef<HTMLFormElement>(null);

    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (file: File) => {
        setData('file', file);
    };

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
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const validate = (): boolean => {
        let firstMissingLabel = '';

        if (!data.tanggal_arsip) {
            firstMissingLabel = 'Tanggal Arsip';
        } else if (!data.judul.trim()) {
            firstMissingLabel = 'Judul Arsip';
        } else if (!data.deskripsi.trim()) {
            firstMissingLabel = 'Keterangan / Deskripsi';
        } else if (!data.kategori_arsip_id) {
            firstMissingLabel = 'Kategori Arsip';
        } else if (!data.klasifikasi_arsip_id) {
            firstMissingLabel = 'Klasifikasi Arsip';
        } else if (!data.jenis_arsip_id) {
            firstMissingLabel = 'Jenis Arsip';
        } else if (!data.unit_organisasi_id) {
            firstMissingLabel = 'Unit Organisasi';
        } else if (!data.lokasi_arsip_id) {
            firstMissingLabel = 'Lokasi Arsip';
        }

        if (isPajakDaerah && !firstMissingLabel) {
            if (!data.no_register.trim()) {
                firstMissingLabel = 'No Register';
            } else if (!data.nop.trim()) {
                firstMissingLabel = 'NOP';
            } else if (!data.npwpd.trim()) {
                firstMissingLabel = 'NPWPD';
            } else if (!data.nama_wajib_pajak.trim()) {
                firstMissingLabel = 'Nama Wajib Pajak';
            }
        }

        if (firstMissingLabel) {
            toast.warning(
                `Harap isi kolom "${firstMissingLabel}" yang wajib diisi.`,
                {
                    description:
                        'Lengkapi seluruh kolom bertanda bintang sebelum menyimpan.',
                },
            );
            setTimeout(() => focusFirstInvalidField(formRef.current), 100);

            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        post(`/arsip/${arsip.id}`, {
            preserveScroll: true,
            onError: () => {
                toast.error('Terjadi kesalahan saat memperbarui arsip.', {
                    description: 'Periksa kembali data yang ditandai merah.',
                });
                setTimeout(() => focusFirstInvalidField(formRef.current), 100);
            },
        });
    };

    const [confirmDeleteFile, setConfirmDeleteFile] = useState(false);
    const [deletingFile, setDeletingFile] = useState(false);

    const handleDeleteFile = () => {
        setConfirmDeleteFile(true);
    };

    const handleConfirmDeleteFile = () => {
        setDeletingFile(true);
        router.delete(`/arsip/${arsip.id}/file`, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmDeleteFile(false);
            },
            onError: () => {
                toast.error('Gagal menghapus berkas arsip.');
            },
            onFinish: () => setDeletingFile(false),
        });
    };

    return (
        <RouteGuard permission="kelola-arsip.update">
            <Head title={`Edit Arsip - ${arsip.nomor_arsip}`} />

            <PageContainer>
                <PageHeader
                    title="Edit Arsip"
                    description={`Edit metadata arsip: ${arsip.nomor_arsip}`}
                    breadcrumb={[
                        { title: 'BERANDA', href: '/' },
                        { title: 'UTAMA' },
                        { title: 'Repository Arsip', href: index() },
                        { title: 'Edit Arsip' },
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

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-6"
                >
                    {/* Informasi Dasar */}
                    <ContentCard
                        title="Informasi Dasar"
                        description="Data pokok arsip"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nomor_arsip">
                                    Nomor Arsip{' '}
                                    <span className="text-xs text-muted-foreground">
                                        (Otomatis)
                                    </span>
                                </Label>
                                <Input
                                    id="nomor_arsip"
                                    value={data.nomor_arsip}
                                    disabled
                                    className="cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground"
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

                    {/* Kategori, Klasifikasi & Referensi */}
                    <ContentCard
                        title="Klasifikasi & Kategori Arsip"
                        description="Kategori dan pengelompokan arsip"
                    >
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="kategori_arsip_id">
                                    Kategori Arsip
                                </Label>
                                <Select
                                    value={data.kategori_arsip_id}
                                    onValueChange={(val) =>
                                        setData('kategori_arsip_id', val)
                                    }
                                >
                                    <SelectTrigger
                                        id="kategori_arsip_id"
                                        className="border-border/60"
                                    >
                                        <SelectValue placeholder="Pilih kategori arsip..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kategoriArsips.map((opt) => (
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
                                    message={errors.kategori_arsip_id}
                                />
                            </div>

                            {/* Conditional Section for Arsip Pelayanan Pajak Daerah */}
                            {isPajakDaerah && (
                                <div className="animate-in space-y-3 rounded-md border border-primary/20 bg-primary/5 p-4 duration-200 fade-in-50">
                                    <h5 className="text-sm font-semibold text-primary">
                                        Data Pelayanan Pajak Daerah
                                    </h5>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="no_register">
                                                No Register
                                            </Label>
                                            <Input
                                                id="no_register"
                                                value={data.no_register}
                                                onChange={(e) =>
                                                    setData(
                                                        'no_register',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan No Register"
                                                className="border-border/60 bg-background"
                                            />
                                            <InputError
                                                message={errors.no_register}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nop">
                                                NOP (Nomor Objek Pajak)
                                            </Label>
                                            <Input
                                                id="nop"
                                                value={data.nop}
                                                onChange={(e) =>
                                                    setData(
                                                        'nop',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan NOP"
                                                className="border-border/60 bg-background"
                                            />
                                            <InputError message={errors.nop} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="npwpd">NPWPD</Label>
                                            <Input
                                                id="npwpd"
                                                value={data.npwpd}
                                                onChange={(e) =>
                                                    setData(
                                                        'npwpd',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan NPWPD"
                                                className="border-border/60 bg-background"
                                            />
                                            <InputError
                                                message={errors.npwpd}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nama_wajib_pajak">
                                                Nama Wajib Pajak
                                            </Label>
                                            <Input
                                                id="nama_wajib_pajak"
                                                value={data.nama_wajib_pajak}
                                                onChange={(e) =>
                                                    setData(
                                                        'nama_wajib_pajak',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan Nama Wajib Pajak"
                                                className="border-border/60 bg-background"
                                            />
                                            <InputError
                                                message={
                                                    errors.nama_wajib_pajak
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="klasifikasi_arsip_id">
                                        Klasifikasi Arsip{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
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
                                    <InputError
                                        message={errors.jenis_arsip_id}
                                    />
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
                                    <InputError
                                        message={errors.lokasi_arsip_id}
                                    />
                                </div>
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
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {data.file.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatBytes(
                                                        data.file.size,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() =>
                                                setData('file', null)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Preview posisi barcode — kiri bawah otomatis */}
                                    <BarcodePreview file={data.file} />
                                </div>
                            ) : (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                        dragActive
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
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleFileSelect(
                                                        e.target.files[0],
                                                    );
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        PDF, JPG, PNG hingga 100MB
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
                            <Link href={index()}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Perbarui Arsip
                        </Button>
                    </div>
                </form>

                <ConfirmDialog
                    isOpen={confirmDeleteFile}
                    onClose={() => setConfirmDeleteFile(false)}
                    onConfirm={handleConfirmDeleteFile}
                    title="Hapus Dokumen Arsip"
                    description="Apakah Anda yakin ingin menghapus berkas dokumen ini? Tindakan ini tidak dapat dibatalkan."
                    confirmLabel="Hapus"
                    loading={deletingFile}
                    destructive
                />
            </PageContainer>
        </RouteGuard>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'UTAMA' },
        { title: 'Repositori Arsip', href: '/arsip' },
        { title: 'Edit Arsip' },
    ],
};
