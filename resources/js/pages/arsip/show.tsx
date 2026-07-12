import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Eye, FileText, MapPin, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { index, show } from '@/routes/arsip';

type MasterItem = {
    id: number;
    kode: string;
    nama: string;
};

type RetentionItem = {
    id: number;
    kode: string;
    nama: string;
    retensi_aktif: number;
    retensi_inaktif: number;
    keterangan: string | null;
};

type UserItem = {
    id: number;
    name: string;
};

type DokumenArsip = {
    id: number;
    nama_original: string;
    nama_generated: string;
    ukuran: number;
    mime_type: string;
    path_penyimpanan: string;
    uploaded_at: string | null;
    uploader?: UserItem | null;
};

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    created_at: string;
    updated_at: string;
    klasifikasi_arsip?: MasterItem | null;
    lokasi_arsip?: MasterItem | null;
    jenis_dokumen?: MasterItem | null;
    media_arsip?: MasterItem | null;
    kondisi_arsip?: MasterItem | null;
    status_arsip?: MasterItem | null;
    tingkat_akses_arsip?: MasterItem | null;
    retensi_arsip?: RetentionItem | null;
    unit_organisasi?: MasterItem | null;
    creator?: UserItem | null;
    dokumen?: DokumenArsip | null;
};

type ShowProps = {
    arsip: Arsip;
};

type DetailRowProps = {
    label: string;
    value?: string | null;
};

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start">
            <span className="w-44 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
            <span className="text-sm text-foreground">{value ?? '-'}</span>
        </div>
    );
}

function statusVariant(statusName?: string | null) {
    if (!statusName) {
return 'secondary' as const;
}

    const name = statusName.toLowerCase();

    if (name.includes('aktif') && !name.includes('inaktif')) {
return 'success' as const;
}

    if (name.includes('inaktif')) {
return 'secondary' as const;
}

    if (name.includes('musnah') || name.includes('hapus')) {
return 'danger' as const;
}

    return 'warning' as const;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) {
return `${bytes} B`;
}

    if (bytes < 1024 * 1024) {
return `${(bytes / 1024).toFixed(1)} KB`;
}

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isPreviewable(mimeType: string) {
    return ['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(mimeType);
}

export default function Show({ arsip }: ShowProps) {
    const [replacingFile, setReplacingFile] = useState(false);

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus arsip ini?')) {
            router.delete(`/arsip/${arsip.id}`);
        }
    };

    const handleDeleteFile = () => {
        if (confirm('Hapus dokumen ini? Tindakan tidak dapat dibatalkan.')) {
            router.delete(`/arsip/${arsip.id}/file`, { preserveScroll: true });
        }
    };

    const handleReplaceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        router.post(`/arsip/${arsip.id}/replace`, formData, {
            preserveScroll: true,
            onSuccess: () => setReplacingFile(false),
        });
    };

    return (
        <>
            <Head title={`Arsip — ${arsip.nomor_arsip}`} />
            <PageContainer>
                <PageHeader
                    title={arsip.nomor_arsip}
                    description={arsip.judul}
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                        { title: arsip.nomor_arsip, href: show({ arsip: arsip.id }) },
                    ]}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={index()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href={`/arsip/${arsip.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Kolom Utama */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Informasi Arsip */}
                        <ContentCard title="Informasi Arsip" description="Data identitas dan konten arsip">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <StatusBadge variant={statusVariant(arsip.status_arsip?.nama)}>
                                        {arsip.status_arsip?.nama || 'Draft'}
                                    </StatusBadge>
                                    <span className="text-muted-foreground">·</span>
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {arsip.tanggal_arsip}
                                    </span>
                                </div>

                                <Separator className="border-border/40" />

                                <div className="space-y-3">
                                    <DetailRow label="Nomor Arsip" value={arsip.nomor_arsip} />
                                    <DetailRow label="Judul" value={arsip.judul} />
                                    <DetailRow
                                        label="Klasifikasi"
                                        value={arsip.klasifikasi_arsip
                                            ? `${arsip.klasifikasi_arsip.kode} — ${arsip.klasifikasi_arsip.nama}`
                                            : '-'}
                                    />
                                    <DetailRow label="Jenis Dokumen" value={arsip.jenis_dokumen?.nama} />
                                    <DetailRow label="Media" value={arsip.media_arsip?.nama} />
                                    <DetailRow label="Kondisi" value={arsip.kondisi_arsip?.nama} />
                                    <DetailRow label="Tingkat Akses" value={arsip.tingkat_akses_arsip?.nama} />
                                </div>

                                {arsip.deskripsi && (
                                    <>
                                        <Separator className="border-border/40" />
                                        <div>
                                            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Keterangan</p>
                                            <p className="text-sm leading-relaxed text-foreground">{arsip.deskripsi}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ContentCard>

                        {/* Dokumen Digital */}
                        <ContentCard title="Dokumen Digital" description="Berkas fisik arsip yang telah diunggah">
                            {arsip.dokumen ? (
                                <div className="space-y-4">
                                    {/* File metadata */}
                                    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                                        <FileText className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="truncate font-medium text-sm">{arsip.dokumen.nama_original}</p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                <span>{formatBytes(arsip.dokumen.ukuran)}</span>
                                                <span>·</span>
                                                <span>{arsip.dokumen.mime_type}</span>
                                                {arsip.dokumen.uploaded_at && (
                                                    <>
                                                        <span>·</span>
                                                        <span>
                                                            Diunggah {new Date(arsip.dokumen.uploaded_at).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </>
                                                )}
                                                {arsip.dokumen.uploader && (
                                                    <>
                                                        <span>·</span>
                                                        <span>oleh {arsip.dokumen.uploader.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Aksi File */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {isPreviewable(arsip.dokumen.mime_type) && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={`/arsip/${arsip.id}/download?preview=1`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Lihat
                                                </a>
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/arsip/${arsip.id}/download`}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Unduh
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setReplacingFile((v) => !v)}
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Ganti File
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={handleDeleteFile}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus File
                                        </Button>
                                    </div>

                                    {/* Replace form */}
                                    {replacingFile && (
                                        <form onSubmit={handleReplaceSubmit} className="rounded-lg border border-border/60 p-4 space-y-3">
                                            <p className="text-sm font-medium">Pilih berkas pengganti:</p>
                                            <input
                                                type="file"
                                                name="file"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                required
                                                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Button type="submit" size="sm">
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Ganti
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReplacingFile(false)}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">Belum ada dokumen digital</p>
                                    <p className="text-xs text-muted-foreground mt-1">Upload berkas melalui halaman edit arsip</p>
                                    <Button variant="outline" size="sm" className="mt-4" asChild>
                                        <Link href={`/arsip/${arsip.id}/edit`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Upload Dokumen
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </ContentCard>

                        {/* Informasi Retensi */}
                        <ContentCard title="Informasi Retensi" description="Jadwal retensi dan penyusutan arsip">
                            {arsip.retensi_arsip ? (
                                <div className="space-y-3">
                                    <DetailRow label="Kode Retensi" value={arsip.retensi_arsip.kode} />
                                    <DetailRow label="Nama Retensi" value={arsip.retensi_arsip.nama} />
                                    <DetailRow label="Retensi Aktif" value={`${arsip.retensi_arsip.retensi_aktif} Tahun`} />
                                    <DetailRow label="Retensi Inaktif" value={`${arsip.retensi_arsip.retensi_inaktif} Tahun`} />
                                    <DetailRow label="Keterangan Retensi" value={arsip.retensi_arsip.keterangan} />
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Jadwal retensi belum diatur.</p>
                            )}
                        </ContentCard>
                    </div>

                    {/* Kolom Sidebar */}
                    <div className="space-y-6">
                        {/* Informasi Lokasi */}
                        <ContentCard title="Informasi Lokasi" description="Tempat penyimpanan arsip fisik">
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {arsip.lokasi_arsip?.nama || 'Belum diatur'}
                                        </p>
                                        <p className="text-xs">{arsip.lokasi_arsip?.kode || '-'}</p>
                                    </div>
                                </div>
                                <Separator className="border-border/40" />
                                <DetailRow label="Unit Organisasi" value={arsip.unit_organisasi?.nama} />
                            </div>
                        </ContentCard>

                        {/* Informasi Sistem */}
                        <ContentCard title="Informasi Sistem" description="Data teknis dan pencatatan">
                            <div className="space-y-3">
                                <DetailRow label="Dibuat oleh" value={arsip.creator?.name} />
                                <DetailRow label="Tanggal dibuat" value={new Date(arsip.created_at).toLocaleString('id-ID')} />
                                <DetailRow label="Diperbarui" value={new Date(arsip.updated_at).toLocaleString('id-ID')} />
                            </div>
                        </ContentCard>

                        {/* Aksi Bahaya */}
                        <ContentCard title="Aksi">
                            <div className="space-y-2">
                                <Button
                                    onClick={handleDelete}
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus Arsip
                                </Button>
                            </div>
                        </ContentCard>
                    </div>
                </div>
            </PageContainer>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Repository Arsip', href: '/arsip' },
        { title: 'Detail', href: '#' },
    ],
};
