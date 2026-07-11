import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, MapPin, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { index, show } from '@/routes/arsip';

const dummy = {
    id: 1,
    nomor_arsip: 'ARS/2026/00001',
    judul: 'Laporan Keuangan Triwulan I',
    deskripsi: 'Laporan realisasi anggaran semester pertama tahun 2026, mencakup seluruh pos belanja operasional dan modal instansi.',
    tanggal_arsip: '31 Januari 2026',
    file_path: 'arsip/laporan-keuangan-q1.pdf',
    klasifikasi: 'KU.01 — Keuangan Umum',
    jenis_dokumen: 'Laporan',
    media: 'Digital (PDF)',
    kondisi: 'Baik',
    status: 'Aktif',
    tingkat_akses: 'Umum',
    unit_organisasi: 'Bidang Keuangan',
    lokasi: 'Rak A-01 — Ruang Arsip Utama',
    gedung: 'Gedung Utama Lt. 2',
    retensi_aktif: '5 Tahun',
    retensi_inaktif: '10 Tahun',
    metode_penyusutan: 'Dimusnahkan',
    created_by: 'Admin Sistem',
    created_at: '11 Juli 2026, 09:45',
    updated_at: '11 Juli 2026, 09:45',
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

export default function Show() {
    return (
        <>
            <Head title={`Arsip — ${dummy.nomor_arsip}`} />
            <PageContainer>
                <PageHeader
                    title={dummy.nomor_arsip}
                    description={dummy.judul}
                    breadcrumb={[
                        { title: 'Dashboard', href: '/dashboard' },
                        { title: 'Repository Arsip', href: index() },
                        { title: dummy.nomor_arsip, href: show({ arsip: dummy.id }) },
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
                                <Link href={`/arsip/${dummy.id}/edit`}>
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
                                    <StatusBadge variant="success">{dummy.status}</StatusBadge>
                                    <span className="text-muted-foreground">·</span>
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {dummy.tanggal_arsip}
                                    </span>
                                </div>

                                <Separator className="border-border/40" />

                                <div className="space-y-3">
                                    <DetailRow label="Nomor Arsip" value={dummy.nomor_arsip} />
                                    <DetailRow label="Judul" value={dummy.judul} />
                                    <DetailRow label="Klasifikasi" value={dummy.klasifikasi} />
                                    <DetailRow label="Jenis Dokumen" value={dummy.jenis_dokumen} />
                                    <DetailRow label="Media" value={dummy.media} />
                                    <DetailRow label="Kondisi" value={dummy.kondisi} />
                                    <DetailRow label="Tingkat Akses" value={dummy.tingkat_akses} />
                                </div>

                                {dummy.deskripsi && (
                                    <>
                                        <Separator className="border-border/40" />
                                        <div>
                                            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Keterangan</p>
                                            <p className="text-sm leading-relaxed text-foreground">{dummy.deskripsi}</p>
                                        </div>
                                    </>
                                )}

                                {dummy.file_path && (
                                    <>
                                        <Separator className="border-border/40" />
                                        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{dummy.file_path.split('/').pop()}</p>
                                                <p className="text-xs text-muted-foreground">Berkas digital tersedia</p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Unduh
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
                            <div className="space-y-3">
                                <DetailRow label="Retensi Aktif" value={dummy.retensi_aktif} />
                                <DetailRow label="Retensi Inaktif" value={dummy.retensi_inaktif} />
                                <DetailRow label="Metode Penyusutan" value={dummy.metode_penyusutan} />
                            </div>
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
                                        <p className="font-medium text-foreground">{dummy.lokasi}</p>
                                        <p className="text-xs">{dummy.gedung}</p>
                                    </div>
                                </div>
                                <Separator className="border-border/40" />
                                <DetailRow label="Unit Organisasi" value={dummy.unit_organisasi} />
                            </div>
                        </ContentCard>

                        {/* Informasi Sistem */}
                        <ContentCard
                            title="Informasi Sistem"
                            description="Data teknis dan pencatatan"
                        >
                            <div className="space-y-3">
                                <DetailRow label="Dibuat oleh" value={dummy.created_by} />
                                <DetailRow label="Tanggal dibuat" value={dummy.created_at} />
                                <DetailRow label="Diperbarui" value={dummy.updated_at} />
                            </div>
                        </ContentCard>

                        {/* Aksi Bahaya */}
                        <ContentCard title="Aksi">
                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
                                    <RotateCcw className="h-4 w-4" />
                                    Pindahkan ke Inaktif
                                </Button>
                                <Button
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
