import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Download, Eye, FileText, Hash, MapPin, Pencil, RefreshCw, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { index, show } from '@/routes/arsip';
import { downloadVersion } from '@/routes/arsip';

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

type DokumenArsipVersion = {
    id: number;
    versi: number;
    nama_file: string;
    path_file: string;
    ukuran_file: number;
    mime_type: string;
    hash_file: string;
    uploaded_by: number | null;
    created_at: string;
    uploader?: UserItem | null;
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
    versions?: DokumenArsipVersion[];
    ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
    ocr_text?: string | null;
    ocr_confidence?: number | null;
    ocr_language?: string | null;
    ocr_pages?: number | null;
    ocr_processed_at?: string | null;
};

type Arsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    created_at: string;
    updated_at: string;
    workflow_status: 'draft' | 'review' | 'approved' | 'active' | 'retention' | 'record_center' | 'destruction';
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

type WorkflowHistoryItem = {
    id: number;
    status_lama: string;
    status_baru: string;
    keterangan: string | null;
    created_at: string;
    user?: UserItem | null;
};

type AllowedTransition = {
    value: string;
    label: string;
};

type ShowProps = {
    arsip: Arsip;
    workflowHistory: WorkflowHistoryItem[];
    allowedTransitions: AllowedTransition[];
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

function ocrStatusVariant(status?: string | null) {
    if (!status) {
        return 'warning' as const;
    }

    switch (status) {
        case 'completed': return 'success' as const;
        case 'processing': return 'info' as const;
        case 'failed': return 'danger' as const;
        default: return 'warning' as const;
    }
}

function ocrStatusLabel(status?: string | null) {
    if (!status) {
        return 'Menunggu';
    }

    switch (status) {
        case 'completed': return 'Selesai';
        case 'processing': return 'Diproses';
        case 'failed': return 'Gagal';
        default: return 'Menunggu';
    }
}

function workflowStatusVariant(status: string): 'secondary' | 'warning' | 'info' | 'success' | 'danger' {
    switch (status) {
        case 'draft': return 'secondary';
        case 'review': return 'warning';
        case 'approved': return 'info';
        case 'active': return 'success';
        case 'retention': return 'warning';
        case 'record_center': return 'secondary';
        case 'destruction': return 'danger';
        default: return 'secondary';
    }
}

function workflowStatusLabel(status: string): string {
    switch (status) {
        case 'draft': return 'Draft';
        case 'review': return 'Review';
        case 'approved': return 'Disetujui';
        case 'active': return 'Arsip Aktif';
        case 'retention': return 'Retensi';
        case 'record_center': return 'Record Center';
        case 'destruction': return 'Pemusnahan';
        default: return status;
    }
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

export default function Show({ arsip, workflowHistory = [], allowedTransitions = [] }: ShowProps) {
    const [replacingFile, setReplacingFile] = useState(false);
    const [showFullText, setShowFullText] = useState(false);
    const [processingOcr, setProcessingOcr] = useState(false);

    const [showAdvanceForm, setShowAdvanceForm] = useState(false);
    const [targetStatus, setTargetStatus] = useState(allowedTransitions[0]?.value || '');
    const [keteranganWorkflow, setKeteranganWorkflow] = useState('');
    const [processingWorkflow, setProcessingWorkflow] = useState(false);

    // Keep target status updated when transitions change
    useState(() => {
        if (allowedTransitions.length > 0) {
            setTargetStatus(allowedTransitions[0].value);
        }
    });

    const handleReprocessOcr = () => {
        setProcessingOcr(true);
        router.post(`/arsip/${arsip.id}/ocr-reprocess`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessingOcr(false),
        });
    };

    const handleAdvanceWorkflow = (e: React.FormEvent) => {
        e.preventDefault();

        if (!targetStatus) {
return;
}

        if (confirm(`Apakah Anda yakin ingin melanjutkan ke tahap arsip: ${workflowStatusLabel(targetStatus)}?`)) {
            setProcessingWorkflow(true);
            router.post(`/arsip/${arsip.id}/workflow/advance`, {
                target_status: targetStatus,
                keterangan: keteranganWorkflow,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAdvanceForm(false);
                    setKeteranganWorkflow('');
                },
                onFinish: () => setProcessingWorkflow(false),
            });
        }
    };

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
                                                            Diunggah {arsip.dokumen.uploaded_at}
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

                        {/* Riwayat Versi Dokumen */}
                        {arsip.dokumen && arsip.dokumen.versions && arsip.dokumen.versions.length > 0 && (
                            <ContentCard
                                title="Riwayat Versi Dokumen"
                                description="Seluruh versi file yang pernah diunggah untuk arsip ini"
                            >
                                <div className="space-y-3">
                                    {arsip.dokumen.versions.map((ver) => (
                                        <div
                                            key={ver.id}
                                            className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 p-3"
                                        >
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 font-mono text-xs"
                                                >
                                                    v{ver.versi}
                                                </Badge>
                                                <div className="min-w-0 space-y-1">
                                                    <p className="truncate text-sm font-medium">{ver.nama_file}</p>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {ver.created_at}
                                                        </span>
                                                        {ver.uploader && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {ver.uploader.name}
                                                            </span>
                                                        )}
                                                        <span>{formatBytes(ver.ukuran_file)}</span>
                                                        <span className="inline-flex items-center gap-1 font-mono">
                                                            <Hash className="h-3 w-3" />
                                                            {ver.hash_file.slice(0, 12)}…
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                {['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(ver.mime_type) && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a
                                                            href={downloadVersion({ version: ver.id }).url + '?preview=1'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={downloadVersion({ version: ver.id }).url}>
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ContentCard>
                        )}

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
                        {/* Tahap Arsip */}
                        <ContentCard title="Tahap Arsip" description="Siklus hidup dokumen arsip">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Tahap Saat Ini</span>
                                    <StatusBadge variant={workflowStatusVariant(arsip.workflow_status)}>
                                        {workflowStatusLabel(arsip.workflow_status)}
                                    </StatusBadge>
                                </div>

                                {allowedTransitions.length > 0 && (
                                    <div className="pt-1">
                                        {!showAdvanceForm ? (
                                            <Button
                                                onClick={() => {
                                                    setTargetStatus(allowedTransitions[0].value);
                                                    setShowAdvanceForm(true);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 border-border/60"
                                            >
                                                Lanjutkan Tahap
                                            </Button>
                                        ) : (
                                            <form onSubmit={handleAdvanceWorkflow} className="rounded-lg border border-border/60 p-3 space-y-3 bg-muted/20">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-muted-foreground">Pilih Tahap Tujuan</label>
                                                    <select
                                                        value={targetStatus}
                                                        onChange={(e) => setTargetStatus(e.target.value)}
                                                        required
                                                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {allowedTransitions.map((t) => (
                                                            <option key={t.value} value={t.value}>
                                                                {t.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-muted-foreground">Keterangan (Opsional)</label>
                                                    <textarea
                                                        value={keteranganWorkflow}
                                                        onChange={(e) => setKeteranganWorkflow(e.target.value)}
                                                        rows={2}
                                                        placeholder="Catatan perubahan status..."
                                                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button type="submit" size="sm" disabled={processingWorkflow}>
                                                        Kirim
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowAdvanceForm(false)}
                                                    >
                                                        Batal
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {workflowHistory.length > 0 && (
                                    <div className="space-y-3">
                                        <Separator className="border-border/40" />
                                        <span className="text-xs font-semibold text-muted-foreground">Riwayat Tahap</span>
                                        <div className="relative pl-4 border-l border-border/80 space-y-4">
                                            {workflowHistory.map((history) => (
                                                <div key={history.id} className="relative text-xs">
                                                    {/* Timeline Bullet */}
                                                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-border" />
                                                    
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="font-semibold text-foreground">
                                                                {workflowStatusLabel(history.status_baru)}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                                {history.created_at}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                            <span>Dari {workflowStatusLabel(history.status_lama)}</span>
                                                            {history.user && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span>oleh {history.user.name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {history.keterangan && (
                                                            <p className="mt-0.5 rounded border border-border/40 bg-muted/30 px-2 py-1 italic text-[11px] leading-relaxed text-muted-foreground">
                                                                "{history.keterangan}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ContentCard>

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

                        {/* Hasil OCR */}
                        {arsip.dokumen && (
                            <ContentCard title="Hasil OCR" description="Ekstraksi teks otomatis dari berkas digital">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground">Status OCR</span>
                                        <StatusBadge variant={ocrStatusVariant(arsip.dokumen.ocr_status)}>
                                            {ocrStatusLabel(arsip.dokumen.ocr_status)}
                                        </StatusBadge>
                                    </div>
                                    
                                    {arsip.dokumen.ocr_status === 'completed' && (
                                        <>
                                            <Separator className="border-border/40" />
                                            <DetailRow 
                                                label="Confidence" 
                                                value={arsip.dokumen.ocr_confidence !== undefined && arsip.dokumen.ocr_confidence !== null 
                                                    ? `${arsip.dokumen.ocr_confidence}%` 
                                                    : '-'} 
                                            />
                                            <DetailRow 
                                                label="Jumlah Halaman" 
                                                value={arsip.dokumen.ocr_pages !== undefined && arsip.dokumen.ocr_pages !== null 
                                                    ? `${arsip.dokumen.ocr_pages} Halaman` 
                                                    : '-'} 
                                            />
                                            <DetailRow 
                                                label="Bahasa" 
                                                value={arsip.dokumen.ocr_language === 'id' ? 'Bahasa Indonesia (id)' : (arsip.dokumen.ocr_language || '-')} 
                                            />
                                            <DetailRow 
                                                label="Tanggal Proses" 
                                                value={arsip.dokumen.ocr_processed_at ?? '-'}
                                            />
                                            
                                            {arsip.dokumen.ocr_text && (
                                                <>
                                                    <Separator className="border-border/40" />
                                                    <div className="space-y-1.5">
                                                        <span className="text-xs font-medium text-muted-foreground">Hasil Ekstraksi (Preview)</span>
                                                        <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-foreground font-mono leading-relaxed break-words whitespace-pre-wrap max-h-40 overflow-y-auto">
                                                            {showFullText 
                                                                ? arsip.dokumen.ocr_text 
                                                                : `${arsip.dokumen.ocr_text.slice(0, 300)}${arsip.dokumen.ocr_text.length > 300 ? '...' : ''}`}
                                                        </div>
                                                        {arsip.dokumen.ocr_text.length > 300 && (
                                                            <Button 
                                                                variant="link" 
                                                                size="sm" 
                                                                className="h-auto p-0 text-xs font-semibold text-primary hover:underline"
                                                                onClick={() => setShowFullText(!showFullText)}
                                                            >
                                                                {showFullText ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {(arsip.dokumen.ocr_status === 'completed' || arsip.dokumen.ocr_status === 'failed') && (
                                        <div className="pt-2">
                                            <Button
                                                onClick={handleReprocessOcr}
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2 border-border/60"
                                                disabled={processingOcr}
                                            >
                                                <RefreshCw className={`h-3.5 w-3.5 ${processingOcr ? 'animate-spin' : ''}`} />
                                                Proses Ulang OCR
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </ContentCard>
                        )}

                        {/* Informasi Sistem */}
                        <ContentCard title="Informasi Sistem" description="Data teknis dan pencatatan">
                            <div className="space-y-3">
                                <DetailRow label="Dibuat oleh" value={arsip.creator?.name} />
                                <DetailRow label="Tanggal dibuat" value={arsip.created_at} />
                                <DetailRow label="Diperbarui" value={arsip.updated_at} />
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
