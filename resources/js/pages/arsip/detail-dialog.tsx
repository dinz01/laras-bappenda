import { router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Download,
    Eye,
    FileText,
    Hash,
    MapPin,
    Pencil,
    RefreshCw,
    Trash2,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Can } from '@/components/Can';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { index as verifikasiArsipIndex } from '@/routes/verifikasi-arsip';
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
    catatan_perubahan?: string | null;
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

export type DetailArsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    created_at: string;
    updated_at: string;
    workflow_status:
    | 'draft'
    | 'review'
    | 'revisi'
    | 'approved'
    | 'active'
    | 'retention'
    | 'record_center'
    | 'destruction';
    catatan_revisi?: string | null;
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
    action?: string | null;
    keterangan: string | null;
    created_at: string;
    user?: UserItem | null;
};

type AllowedTransition = {
    value: string;
    label: string;
};

export type ArsipDetailDialogProps = {
    open: boolean;
    onClose: () => void;
    arsip: DetailArsip;
    workflowHistory?: WorkflowHistoryItem[];
    allowedTransitions?: AllowedTransition[];
    onEdit?: () => void;
};

type DetailRowProps = {
    label: string;
    value?: string | null;
};

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            <span className="text-sm break-words text-foreground">
                {value ?? '-'}
            </span>
        </div>
    );
}

function statusVariant(statusName?: string | null) {
    if (!statusName) return 'secondary' as const;
    const name = statusName.toLowerCase();
    if (name.includes('aktif') && !name.includes('inaktif')) return 'success' as const;
    if (name.includes('inaktif')) return 'secondary' as const;
    if (name.includes('musnah') || name.includes('hapus')) return 'danger' as const;
    return 'warning' as const;
}

function ocrStatusVariant(status?: string | null) {
    switch (status) {
        case 'completed': return 'success' as const;
        case 'processing': return 'info' as const;
        case 'failed': return 'danger' as const;
        default: return 'warning' as const;
    }
}

function ocrStatusLabel(status?: string | null) {
    switch (status) {
        case 'completed': return 'Selesai';
        case 'processing': return 'Diproses';
        case 'failed': return 'Gagal';
        default: return 'Menunggu';
    }
}

function workflowStatusVariant(
    status: string,
): 'secondary' | 'warning' | 'info' | 'success' | 'danger' {
    switch (status) {
        case 'draft': return 'secondary';
        case 'review': return 'warning';
        case 'revisi': return 'danger';
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
        case 'review': return 'Menunggu Verifikasi';
        case 'revisi': return 'Perlu Revisi';
        case 'approved': return 'Disetujui';
        case 'active': return 'Arsip Aktif';
        case 'retention': return 'Retensi';
        case 'record_center': return 'Record Center';
        case 'destruction': return 'Pemusnahan';
        default: return status;
    }
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isPreviewable(mimeType: string) {
    return ['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(mimeType);
}

export function ArsipDetailDialog({
    open,
    onClose,
    arsip,
    workflowHistory = [],
    allowedTransitions = [],
    onEdit,
}: ArsipDetailDialogProps) {
    const [showFullText, setShowFullText] = useState(false);
    const [processingOcr, setProcessingOcr] = useState(false);
    const [showAdvanceForm, setShowAdvanceForm] = useState(false);
    const [targetStatus, setTargetStatus] = useState(allowedTransitions[0]?.value || '');
    const [keteranganWorkflow, setKeteranganWorkflow] = useState('');
    const [processingWorkflow, setProcessingWorkflow] = useState(false);

    const handleReprocessOcr = () => {
        setProcessingOcr(true);
        router.post(
            `/arsip/${arsip.id}/ocr-reprocess`,
            {},
            { preserveScroll: true, onFinish: () => setProcessingOcr(false) },
        );
    };

    const handleAdvanceWorkflow = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetStatus) return;

        if (confirm(`Apakah Anda yakin ingin melanjutkan ke tahap arsip: ${workflowStatusLabel(targetStatus)}?`)) {
            setProcessingWorkflow(true);
            router.post(
                `/arsip/${arsip.id}/workflow/advance`,
                { target_status: targetStatus, keterangan: keteranganWorkflow },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowAdvanceForm(false);
                        setKeteranganWorkflow('');
                    },
                    onFinish: () => setProcessingWorkflow(false),
                },
            );
        }
    };

    const handleDeleteFile = () => {
        if (confirm('Hapus dokumen ini? Tindakan tidak dapat dibatalkan.')) {
            router.delete(`/arsip/${arsip.id}/file`, { preserveScroll: true });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto border-border/60 sm:max-w-4xl">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-2 pr-6">
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="break-words">{arsip.nomor_arsip}</DialogTitle>
                            <DialogDescription className="break-words">{arsip.judul}</DialogDescription>
                        </div>
                        {onEdit && (
                            <Can permission="arsip.update">
                                <Button size="sm" onClick={onEdit} className="shrink-0">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Can>
                        )}
                    </div>
                </DialogHeader>

                <div className="grid gap-6 pt-2 lg:grid-cols-3">
                    {/* Kolom Utama */}
                    <div className="min-w-0 space-y-6 lg:col-span-2">
                        <ContentCard title="Informasi Arsip" description="Data identitas dan konten arsip">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
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
                                        value={arsip.klasifikasi_arsip ? `${arsip.klasifikasi_arsip.kode} — ${arsip.klasifikasi_arsip.nama}` : '-'}
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
                                            <p className="text-sm leading-relaxed break-words text-foreground">{arsip.deskripsi}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ContentCard>

                        <ContentCard title="Dokumen Digital" description="Berkas fisik arsip yang telah diunggah">
                            {arsip.dokumen ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                                        <FileText className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="truncate text-sm font-medium">{arsip.dokumen.nama_original}</p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                <span>{formatBytes(arsip.dokumen.ukuran)}</span>
                                                <span>·</span>
                                                <span>{arsip.dokumen.mime_type}</span>
                                                {arsip.dokumen.uploaded_at && (
                                                    <>
                                                        <span>·</span>
                                                        <span>Diunggah {arsip.dokumen.uploaded_at}</span>
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

                                    <div className="flex flex-wrap items-center gap-2">
                                        {isPreviewable(arsip.dokumen.mime_type) && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/arsip/${arsip.id}/download?preview=1`} target="_blank" rel="noopener noreferrer">
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
                                            className="text-destructive hover:text-destructive"
                                            onClick={handleDeleteFile}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus File
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
                                    <p className="text-sm font-medium text-muted-foreground">Belum ada dokumen digital</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Upload berkas melalui tombol Edit</p>
                                </div>
                            )}
                        </ContentCard>

                        {arsip.dokumen && arsip.dokumen.versions && arsip.dokumen.versions.length > 0 && (
                            <ContentCard title="Riwayat Versi Dokumen" description="Seluruh versi file yang pernah diunggah untuk arsip ini">
                                <div className="space-y-3">
                                    {arsip.dokumen.versions.map((ver) => (
                                        <div key={ver.id} className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 p-3">
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                                                    v{ver.versi}
                                                </Badge>
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="truncate text-sm font-medium">{ver.nama_file}</p>
                                                    {ver.catatan_perubahan && (
                                                        <p className="text-xs break-words text-muted-foreground italic">"{ver.catatan_perubahan}"</p>
                                                    )}
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
                                                        <a href={downloadVersion({ version: ver.id }).url + '?preview=1'} target="_blank" rel="noopener noreferrer">
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

                    {/* Sidebar */}
                    <div className="min-w-0 space-y-6">
                        <ContentCard title="Tahap Arsip" description="Siklus hidup dokumen arsip">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs font-medium text-muted-foreground">Tahap Saat Ini</span>
                                    <StatusBadge variant={workflowStatusVariant(arsip.workflow_status)}>
                                        {workflowStatusLabel(arsip.workflow_status)}
                                    </StatusBadge>
                                </div>

                                {arsip.workflow_status === 'review' && (
                                    <Can permission="workflow.approve">
                                        <Button
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => router.visit(verifikasiArsipIndex.url())}
                                        >
                                            Buka di Verifikasi Arsip
                                        </Button>
                                    </Can>
                                )}

                                {arsip.workflow_status === 'revisi' && arsip.catatan_revisi && (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                        <p className="mb-1 text-xs font-semibold text-destructive">Catatan Revisi dari Arsiparis</p>
                                        <p className="text-xs break-words text-foreground">{arsip.catatan_revisi}</p>
                                    </div>
                                )}

                                {allowedTransitions.length > 0 &&
                                    arsip.workflow_status !== 'review' &&
                                    arsip.workflow_status !== 'revisi' && (
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
                                                <form onSubmit={handleAdvanceWorkflow} className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-muted-foreground">Pilih Tahap Tujuan</label>
                                                        <select
                                                            value={targetStatus}
                                                            onChange={(e) => setTargetStatus(e.target.value)}
                                                            required
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
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
                                                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button type="submit" size="sm" disabled={processingWorkflow}>
                                                            Kirim
                                                        </Button>
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanceForm(false)}>
                                                            Batal
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}

                                {workflowHistory.length > 0 && (
                                    <div className="min-w-0 space-y-3">
                                        <Separator className="border-border/40" />
                                        <span className="text-xs font-semibold text-muted-foreground">Riwayat Tahap</span>
                                        <div className="relative min-w-0 space-y-4 border-l border-border/80 pl-4">
                                            {workflowHistory.map((history) => (
                                                <div key={history.id} className="relative min-w-0 text-xs">
                                                    <div className="absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full border-2 border-background bg-border" />
                                                    <div className="flex min-w-0 flex-col gap-1">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                                                <span className="font-semibold break-words text-foreground">
                                                                    {workflowStatusLabel(history.status_baru)}
                                                                </span>
                                                                {history.action && (
                                                                    <Badge variant="outline" className="px-1 py-0 font-mono text-[9px] uppercase">
                                                                        {history.action}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="shrink-0 text-[10px] whitespace-nowrap text-muted-foreground">
                                                                {history.created_at}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                                            <span>Dari {workflowStatusLabel(history.status_lama)}</span>
                                                            {history.user && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span>oleh {history.user.name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {history.keterangan && (
                                                            <p className="mt-0.5 rounded border border-border/40 bg-muted/30 px-2 py-1 text-[11px] leading-relaxed break-words text-muted-foreground italic">
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

                        <ContentCard title="Informasi Lokasi" description="Tempat penyimpanan arsip fisik">
                            <div className="space-y-3">
                                <div className="flex min-w-0 items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="break-words font-medium text-foreground">{arsip.lokasi_arsip?.nama || 'Belum diatur'}</p>
                                        <p className="text-xs break-words">{arsip.lokasi_arsip?.kode || '-'}</p>
                                    </div>
                                </div>
                                <Separator className="border-border/40" />
                                <DetailRow label="Unit Organisasi" value={arsip.unit_organisasi?.nama} />
                            </div>
                        </ContentCard>

                        {arsip.dokumen && (
                            <ContentCard title="Hasil OCR" description="Ekstraksi teks otomatis dari berkas digital">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
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
                                                value={arsip.dokumen.ocr_confidence != null ? `${arsip.dokumen.ocr_confidence}%` : '-'}
                                            />
                                            <DetailRow
                                                label="Jumlah Halaman"
                                                value={arsip.dokumen.ocr_pages != null ? `${arsip.dokumen.ocr_pages} Halaman` : '-'}
                                            />
                                            <DetailRow
                                                label="Bahasa"
                                                value={arsip.dokumen.ocr_language === 'id' ? 'Bahasa Indonesia (id)' : arsip.dokumen.ocr_language || '-'}
                                            />
                                            <DetailRow label="Tanggal Proses" value={arsip.dokumen.ocr_processed_at ?? '-'} />

                                            {arsip.dokumen.ocr_text && (
                                                <>
                                                    <Separator className="border-border/40" />
                                                    <div className="min-w-0 space-y-1.5">
                                                        <span className="text-xs font-medium text-muted-foreground">Hasil Ekstraksi (Preview)</span>
                                                        <div className="max-h-40 overflow-y-auto rounded-md border border-border/60 bg-muted/30 p-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-foreground">
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

                        <ContentCard title="Informasi Sistem" description="Data teknis dan pencatatan">
                            <div className="space-y-3">
                                <DetailRow label="Dibuat oleh" value={arsip.creator?.name} />
                                <DetailRow label="Tanggal dibuat" value={arsip.created_at} />
                                <DetailRow label="Diperbarui" value={arsip.updated_at} />
                            </div>
                        </ContentCard>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}