import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, MapPin, Pencil, Trash2 } from 'lucide-react';
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

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    file_path: string | null;
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

export default function Show({ arsip }: ShowProps) {
    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus arsip ini?')) {
            router.delete(`/arsip/${arsip.id}`);
        }
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
                        <ContentCard
                            title="Informasi Arsip"
                            description="Data identitas dan konten arsip"
                        >
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
                                        value={
                                            arsip.klasifikasi_arsip
                                                ? `${arsip.klasifikasi_arsip.kode} — ${arsip.klasifikasi_arsip.nama}`
                                                : '-'
                                        }
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

                                {arsip.file_path && (
                                    <>
                                        <Separator className="border-border/40" />
                                        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {arsip.file_path.split('/').pop()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Berkas digital tersedia</p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/storage/${arsip.file_path}`} download target="_blank" rel="noopener noreferrer">
                                                    Unduh
                                                </a>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ContentCard>

                        {/* Informasi Retensi */}
                        <ContentCard
                            title="Informasi Retensi"
                            description="Jadwal retensi dan penyusutan arsip"
                        >
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
                        <ContentCard
                            title="Informasi Lokasi"
                            description="Tempat penyimpanan arsip fisik"
                        >
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
                        <ContentCard
                            title="Informasi Sistem"
                            description="Data teknis dan pencatatan"
                        >
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
