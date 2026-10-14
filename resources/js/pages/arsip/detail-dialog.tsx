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
    User,
} from 'lucide-react';
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
import { usePermission } from '@/hooks/use-permission';
import type { WorkflowStatus } from '@/lib/workflow-status';
import {
    workflowStatusLabel,
    workflowStatusVariant,
} from '@/lib/workflow-status';
import { downloadVersion } from '@/routes/arsip';
import { index as verifikasiArsipIndex } from '@/routes/verifikasi-arsip';

type MasterItem = {
    id: number;
    kode: string;
    nama: string;
    retensi_aktif?: number | null;
    retensi_inaktif?: number | null;
    nasib_akhir?: { id: number; nama: string } | null;
    parent?: MasterItem | null;
};

export type LokasiArsipDetail = {
    id: number;
    kode: string;
    nama: string;
    parent_id?: number | null;
    parent?: LokasiArsipDetail | null;
    gedung?: string | null;
    lantai?: string | null;
    ruangan?: string | null;
    rak?: string | null;
    box?: string | null;
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
};

export type DetailArsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    created_at: string;
    updated_at: string;
    workflow_status: WorkflowStatus;
    catatan_revisi?: string | null;
    kategori_arsip?: MasterItem | null;
    no_register?: string | null;
    nop?: string | null;
    npwpd?: string | null;
    nama_wajib_pajak?: string | null;
    klasifikasi_arsip?: MasterItem | null;
    lokasi_arsip?: LokasiArsipDetail | null;
    jenis_dokumen?: MasterItem | null;
    media_arsip?: MasterItem | null;
    kondisi_arsip?: MasterItem | null;
    tingkat_akses_arsip?: MasterItem | null;
    retensi_arsip?: RetentionItem | null;
    unit_organisasi?: MasterItem | null;
    creator?: UserItem | null;
    dokumen?: DokumenArsip | null;
    has_approved_peminjaman?: boolean;
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
    onGantiFile?: (arsip: DetailArsip) => void;
};

type DetailRowProps = {
    label: string;
    value?: string | null;
    children?: React.ReactNode;
};

function DetailRow({ label, value, children }: DetailRowProps) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">
                {label}
            </span>
            {children ? (
                children
            ) : (
                <span className="text-sm break-words text-foreground">
                    {value ?? '-'}
                </span>
            )}
        </div>
    );
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
    return ['application/pdf', 'image/jpg', 'image/jpeg', 'image/png'].includes(
        mimeType,
    );
}

function getLocationChain(
    lokasi?: LokasiArsipDetail | null,
): LokasiArsipDetail[] {
    if (!lokasi) {
        return [];
    }

    const chain: LokasiArsipDetail[] = [];
    let curr: LokasiArsipDetail | null | undefined = lokasi;
    const visited = new Set<number>();

    while (curr && !visited.has(curr.id)) {
        visited.add(curr.id);
        chain.unshift(curr);
        curr = curr.parent;
    }

    return chain;
}

function getFieldValue(
    chain: LokasiArsipDetail[],
    field: 'gedung' | 'lantai' | 'ruangan' | 'rak' | 'box',
): string | null {
    for (const item of chain) {
        if (item[field]) {
            return item[field]!;
        }
    }

    return null;
}

function getKlasifikasiChain(klasifikasi?: MasterItem | null): MasterItem[] {
    if (!klasifikasi) {
        return [];
    }

    const chain: MasterItem[] = [];
    let curr: MasterItem | null | undefined = klasifikasi;
    const visited = new Set<number>();

    while (curr && !visited.has(curr.id)) {
        visited.add(curr.id);
        chain.unshift(curr);
        curr = curr.parent;
    }

    return chain;
}

function KlasifikasiDetailDisplay({
    klasifikasi,
}: {
    klasifikasi?: MasterItem | null;
}) {
    const chain = getKlasifikasiChain(klasifikasi);

    if (chain.length === 0) {
        return <span className="text-sm text-foreground">-</span>;
    }

    const target = chain[chain.length - 1];
    const parents = chain.slice(0, chain.length - 1);

    if (parents.length === 0) {
        return (
            <span className="text-sm font-medium break-words text-foreground">
                {target.kode} - {target.nama}
            </span>
        );
    }

    return (
        <div className="space-y-0.5">
            <p className="text-sm font-semibold break-words text-foreground">
                {target.kode} - {target.nama}
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                {parents.map((item, index) => (
                    <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5"
                    >
                        {index > 0 && (
                            <span className="text-muted-foreground/40">›</span>
                        )}
                        <span>
                            {item.kode} - {item.nama}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}

function getKlasifikasiRetention(klasifikasi?: MasterItem | null) {
    if (!klasifikasi) {
        return { retensiAktif: null, retensiInaktif: null, nasibAkhir: null };
    }

    let curr: MasterItem | null | undefined = klasifikasi;
    let retensiAktif: number | null = null;
    let retensiInaktif: number | null = null;
    let nasibAkhir: string | null = null;
    const visited = new Set<number>();

    while (curr && !visited.has(curr.id)) {
        visited.add(curr.id);

        if (retensiAktif === null && curr.retensi_aktif != null) {
            retensiAktif = curr.retensi_aktif;
        }

        if (retensiInaktif === null && curr.retensi_inaktif != null) {
            retensiInaktif = curr.retensi_inaktif;
        }

        if (nasibAkhir === null && curr.nasib_akhir?.nama) {
            nasibAkhir = curr.nasib_akhir.nama;
        }

        curr = curr.parent;
    }

    return { retensiAktif, retensiInaktif, nasibAkhir };
}

export function ArsipDetailDialog({
    open,
    onClose,
    arsip,
    workflowHistory = [],
    onGantiFile,
}: ArsipDetailDialogProps) {
    const { can } = usePermission();
    const canDownload = can('dokumen-arsip.download');
    const isTteSigned = ![
        'review',
        'revisi',
        'approved',
        'waiting_tte',
    ].includes(arsip.workflow_status);
    const canAccessTteDoc =
        canDownload || !isTteSigned || Boolean(arsip.has_approved_peminjaman);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden border-border/60 sm:max-w-5xl">
                <DialogHeader className="shrink-0">
                    <div className="min-w-0 pr-6">
                        <DialogTitle className="break-words">
                            {arsip.nomor_arsip}
                        </DialogTitle>
                        <DialogDescription className="break-words">
                            {arsip.judul}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="max-h-[calc(90vh-7rem)] overflow-y-auto pr-2">
                    <div className="grid gap-6 pt-2 lg:grid-cols-5">
                        {/* Kolom Utama */}
                        <div className="min-w-0 space-y-6 lg:col-span-3">
                            <ContentCard
                                title="Informasi Arsip"
                                description="Data identitas dan konten arsip"
                            >
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {arsip.tanggal_arsip}
                                        </span>
                                    </div>

                                    <Separator className="border-border/40" />

                                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                        {arsip.kategori_arsip && (
                                            <DetailRow
                                                label="Kategori"
                                                value={
                                                    arsip.kategori_arsip.nama
                                                }
                                            />
                                        )}
                                        {arsip.jenis_dokumen && (
                                            <DetailRow
                                                label="Jenis Dokumen"
                                                value={arsip.jenis_dokumen.nama}
                                            />
                                        )}
                                        {arsip.media_arsip && (
                                            <DetailRow
                                                label="Media Arsip"
                                                value={arsip.media_arsip.nama}
                                            />
                                        )}
                                        <DetailRow
                                            label="Kondisi"
                                            value={arsip.kondisi_arsip?.nama}
                                        />
                                        <DetailRow
                                            label="Tingkat Akses"
                                            value={
                                                arsip.tingkat_akses_arsip?.nama
                                            }
                                        />
                                    </div>

                                    <DetailRow label="Klasifikasi">
                                        <KlasifikasiDetailDisplay
                                            klasifikasi={
                                                arsip.klasifikasi_arsip
                                            }
                                        />
                                    </DetailRow>

                                    {(arsip.no_register ||
                                        arsip.nop ||
                                        arsip.npwpd ||
                                        arsip.nama_wajib_pajak) && (
                                        <>
                                            <Separator className="border-border/40" />
                                            <div>
                                                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Informasi Pajak Daerah
                                                </p>
                                                <div className="grid grid-cols-1 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:grid-cols-2">
                                                    {arsip.no_register && (
                                                        <DetailRow
                                                            label="No Register"
                                                            value={
                                                                arsip.no_register
                                                            }
                                                        />
                                                    )}
                                                    {arsip.nop && (
                                                        <DetailRow
                                                            label="NOP"
                                                            value={arsip.nop}
                                                        />
                                                    )}
                                                    {arsip.npwpd && (
                                                        <DetailRow
                                                            label="NPWPD"
                                                            value={arsip.npwpd}
                                                        />
                                                    )}
                                                    {arsip.nama_wajib_pajak && (
                                                        <DetailRow
                                                            label="Nama Wajib Pajak"
                                                            value={
                                                                arsip.nama_wajib_pajak
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {arsip.deskripsi && (
                                        <>
                                            <Separator className="border-border/40" />
                                            <div>
                                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                                    Keterangan
                                                </p>
                                                <p className="text-sm leading-relaxed break-words text-foreground">
                                                    {arsip.deskripsi}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </ContentCard>

                            <ContentCard
                                title="Dokumen Digital"
                                description="Berkas fisik arsip yang telah diunggah"
                            >
                                {arsip.dokumen ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                                            <FileText className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <p className="truncate text-sm font-medium">
                                                    {
                                                        arsip.dokumen
                                                            .nama_original
                                                    }
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        {formatBytes(
                                                            arsip.dokumen
                                                                .ukuran,
                                                        )}
                                                    </span>
                                                    <span>·</span>
                                                    <span>
                                                        {
                                                            arsip.dokumen
                                                                .mime_type
                                                        }
                                                    </span>
                                                    {arsip.dokumen
                                                        .uploaded_at && (
                                                        <>
                                                            <span>·</span>
                                                            <span>
                                                                Diunggah{' '}
                                                                {
                                                                    arsip
                                                                        .dokumen
                                                                        .uploaded_at
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                    {arsip.dokumen.uploader && (
                                                        <>
                                                            <span>·</span>
                                                            <span>
                                                                oleh{' '}
                                                                {
                                                                    arsip
                                                                        .dokumen
                                                                        .uploader
                                                                        .name
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {!canAccessTteDoc && isTteSigned ? (
                                                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                                                    <span>
                                                        Arsip ini telah diberi
                                                        TTE. Hanya Arsip yang
                                                        statusnya{' '}
                                                        <strong>Inaktif</strong>{' '}
                                                        yang dapat dipinjam
                                                        untuk dilihat dan
                                                        diunduh.
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    {isPreviewable(
                                                        arsip.dokumen.mime_type,
                                                    ) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
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
                                                    {(canDownload ||
                                                        Boolean(
                                                            arsip.has_approved_peminjaman,
                                                        )) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a
                                                                href={`/arsip/${arsip.id}/download`}
                                                            >
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Unduh
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {!isTteSigned &&
                                                        onGantiFile && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    onGantiFile(
                                                                        arsip,
                                                                    );
                                                                    onClose();
                                                                }}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Ganti File
                                                            </Button>
                                                        )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Belum ada dokumen digital
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Upload berkas melalui tombol Edit
                                        </p>
                                    </div>
                                )}
                            </ContentCard>

                            {arsip.dokumen &&
                                arsip.dokumen.versions &&
                                arsip.dokumen.versions.length > 0 && (
                                    <ContentCard
                                        title="Riwayat Versi Dokumen"
                                        description="Seluruh versi file yang pernah diunggah untuk arsip ini"
                                    >
                                        <div className="space-y-3">
                                            {arsip.dokumen.versions.map(
                                                (ver) => (
                                                    <div
                                                        key={ver.id}
                                                        className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                                            <Badge
                                                                variant="outline"
                                                                className="shrink-0 font-mono text-xs"
                                                            >
                                                                v{ver.versi}
                                                            </Badge>
                                                            <div className="min-w-0 flex-1 space-y-1">
                                                                <p className="truncate text-sm font-medium">
                                                                    {
                                                                        ver.nama_file
                                                                    }
                                                                </p>
                                                                {ver.catatan_perubahan && (
                                                                    <p className="text-xs break-words text-muted-foreground italic">
                                                                        "
                                                                        {
                                                                            ver.catatan_perubahan
                                                                        }
                                                                        "
                                                                    </p>
                                                                )}
                                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {
                                                                            ver.created_at
                                                                        }
                                                                    </span>
                                                                    {ver.uploader && (
                                                                        <span className="inline-flex items-center gap-1">
                                                                            <User className="h-3 w-3" />
                                                                            {
                                                                                ver
                                                                                    .uploader
                                                                                    .name
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    <span>
                                                                        {formatBytes(
                                                                            ver.ukuran_file,
                                                                        )}
                                                                    </span>
                                                                    <span className="inline-flex items-center gap-1 font-mono">
                                                                        <Hash className="h-3 w-3" />
                                                                        {ver.hash_file.slice(
                                                                            0,
                                                                            12,
                                                                        )}
                                                                        …
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {(!ver.catatan_perubahan?.includes(
                                                            'TTE-',
                                                        ) ||
                                                            canAccessTteDoc) && (
                                                            <div className="flex shrink-0 items-center justify-end gap-1 self-end sm:justify-normal sm:self-auto">
                                                                {[
                                                                    'application/pdf',
                                                                    'image/jpg',
                                                                    'image/jpeg',
                                                                    'image/png',
                                                                ].includes(
                                                                    ver.mime_type,
                                                                ) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={
                                                                                downloadVersion(
                                                                                    {
                                                                                        version:
                                                                                            ver.id,
                                                                                    },
                                                                                )
                                                                                    .url +
                                                                                '?preview=1'
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                                {(!ver.catatan_perubahan?.includes(
                                                                    'TTE-',
                                                                ) ||
                                                                    canDownload ||
                                                                    Boolean(
                                                                        arsip.has_approved_peminjaman,
                                                                    )) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={
                                                                                downloadVersion(
                                                                                    {
                                                                                        version:
                                                                                            ver.id,
                                                                                    },
                                                                                )
                                                                                    .url
                                                                            }
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </ContentCard>
                                )}

                            <ContentCard
                                title="Informasi Retensi"
                                description="Jadwal retensi dan penyusutan arsip"
                            >
                                {(() => {
                                    const {
                                        retensiAktif,
                                        retensiInaktif,
                                        nasibAkhir,
                                    } = getKlasifikasiRetention(
                                        arsip.klasifikasi_arsip,
                                    );
                                    const hasRetention =
                                        retensiAktif != null ||
                                        retensiInaktif != null ||
                                        nasibAkhir != null;

                                    if (
                                        !arsip.klasifikasi_arsip ||
                                        !hasRetention
                                    ) {
                                        return (
                                            <p className="text-sm text-muted-foreground">
                                                Jadwal retensi belum diatur pada
                                                klasifikasi ini.
                                            </p>
                                        );
                                    }

                                    const dateArsip = arsip.tanggal_arsip
                                        ? new Date(arsip.tanggal_arsip)
                                        : null;
                                    const isDateValid =
                                        dateArsip !== null &&
                                        !Number.isNaN(dateArsip.getTime());

                                    const formatRetensiPeriod = (
                                        yearsToAdd: number | null,
                                        baseYears: number = 0,
                                    ) => {
                                        if (yearsToAdd == null) {
                                            return '';
                                        }

                                        if (isDateValid && dateArsip) {
                                            const d = new Date(
                                                dateArsip.getTime(),
                                            );
                                            d.setFullYear(
                                                d.getFullYear() +
                                                    baseYears +
                                                    yearsToAdd,
                                            );
                                            const formatted =
                                                d.toLocaleDateString('id-ID', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                });

                                            return ` (sampai ${formatted})`;
                                        }

                                        const match = arsip.tanggal_arsip
                                            ? arsip.tanggal_arsip.match(
                                                  /\b(19|20)\d{2}\b/,
                                              )
                                            : null;

                                        if (match) {
                                            const yr =
                                                Number.parseInt(match[0], 10) +
                                                baseYears +
                                                yearsToAdd;

                                            return ` (sampai tahun ${yr})`;
                                        }

                                        return '';
                                    };

                                    return (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <DetailRow
                                                    label="Retensi Aktif"
                                                    value={
                                                        retensiAktif != null
                                                            ? `${retensiAktif} Tahun${formatRetensiPeriod(retensiAktif, 0)}`
                                                            : '-'
                                                    }
                                                />
                                                <DetailRow
                                                    label="Retensi Inaktif"
                                                    value={
                                                        retensiInaktif != null
                                                            ? `${retensiInaktif} Tahun${formatRetensiPeriod(retensiInaktif, retensiAktif || 0)}`
                                                            : '-'
                                                    }
                                                />
                                            </div>
                                            <DetailRow
                                                label="Nasib Akhir"
                                                value={nasibAkhir || '-'}
                                            />
                                        </div>
                                    );
                                })()}
                            </ContentCard>
                        </div>

                        {/* Sidebar */}
                        <div className="min-w-0 space-y-6 lg:col-span-2">
                            <ContentCard
                                title="Status Arsip"
                                description="Status arsip saat ini"
                            >
                                <StatusBadge
                                    variant={workflowStatusVariant(
                                        arsip.workflow_status,
                                    )}
                                >
                                    {workflowStatusLabel(arsip.workflow_status)}
                                </StatusBadge>
                            </ContentCard>

                            {(arsip.workflow_status === 'review' ||
                                (arsip.workflow_status === 'revisi' &&
                                    arsip.catatan_revisi) ||
                                workflowHistory.length > 0) && (
                                <ContentCard
                                    title="Riwayat Status"
                                    description="Rekam jejak perubahan status arsip"
                                >
                                    <div className="space-y-4">
                                        {arsip.workflow_status === 'review' && (
                                            <Can permission="workflow.approve">
                                                <Button
                                                    size="sm"
                                                    className="w-full gap-2"
                                                    onClick={() =>
                                                        router.visit(
                                                            verifikasiArsipIndex.url(),
                                                        )
                                                    }
                                                >
                                                    Buka di Verifikasi Arsip
                                                </Button>
                                            </Can>
                                        )}

                                        {arsip.workflow_status === 'revisi' &&
                                            arsip.catatan_revisi && (
                                                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                                    <p className="mb-1 text-xs font-semibold text-destructive">
                                                        Catatan Revisi dari
                                                        Arsiparis
                                                    </p>
                                                    <p className="text-xs break-words text-foreground">
                                                        {arsip.catatan_revisi}
                                                    </p>
                                                </div>
                                            )}

                                        {workflowHistory.length > 0 && (
                                            <div className="min-w-0 space-y-3">
                                                {(arsip.workflow_status ===
                                                    'review' ||
                                                    (arsip.workflow_status ===
                                                        'revisi' &&
                                                        arsip.catatan_revisi)) && (
                                                    <Separator className="border-border/40" />
                                                )}
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    Riwayat Status
                                                </span>
                                                <div className="relative min-w-0 space-y-4 border-l border-border/80 pl-4">
                                                    {workflowHistory.map(
                                                        (history) => (
                                                            <div
                                                                key={history.id}
                                                                className="relative min-w-0 text-xs"
                                                            >
                                                                <div className="absolute top-1 -left-[21px] h-2.5 w-2.5 rounded-full border-2 border-background bg-border" />
                                                                <div className="flex min-w-0 flex-col gap-1">
                                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                                                            <span className="font-semibold break-words text-foreground">
                                                                                {workflowStatusLabel(
                                                                                    history.status_baru as WorkflowStatus,
                                                                                )}
                                                                            </span>
                                                                            {history.action && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="px-1 py-0 font-mono text-[9px] uppercase"
                                                                                >
                                                                                    {
                                                                                        history.action
                                                                                    }
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <span className="shrink-0 text-[10px] whitespace-nowrap text-muted-foreground">
                                                                            {
                                                                                history.created_at
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                                                        <span>
                                                                            Dari{' '}
                                                                            {workflowStatusLabel(
                                                                                history.status_lama as WorkflowStatus,
                                                                            )}
                                                                        </span>
                                                                        {history.user && (
                                                                            <>
                                                                                <span>
                                                                                    ·
                                                                                </span>
                                                                                <span>
                                                                                    oleh{' '}
                                                                                    {
                                                                                        history
                                                                                            .user
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    {history.keterangan && (
                                                                        <p className="mt-0.5 rounded border border-border/40 bg-muted/30 px-2 py-1 text-[11px] leading-relaxed break-words text-muted-foreground italic">
                                                                            "
                                                                            {
                                                                                history.keterangan
                                                                            }
                                                                            "
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ContentCard>
                            )}

                            <ContentCard
                                title="Informasi Lokasi"
                                description="Tempat penyimpanan arsip fisik"
                            >
                                <div className="space-y-3">
                                    {arsip.lokasi_arsip ? (
                                        <>
                                            <div className="flex min-w-0 items-start gap-2 text-sm">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <p className="font-medium break-words text-foreground">
                                                        {
                                                            arsip.lokasi_arsip
                                                                .nama
                                                        }
                                                    </p>
                                                    <p className="font-mono text-xs break-words text-muted-foreground">
                                                        {
                                                            arsip.lokasi_arsip
                                                                .kode
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {(() => {
                                                const chain = getLocationChain(
                                                    arsip.lokasi_arsip,
                                                );
                                                const gedungVal =
                                                    getFieldValue(
                                                        chain,
                                                        'gedung',
                                                    ) ||
                                                    (chain.length > 1
                                                        ? chain[0]?.nama
                                                        : null);
                                                const lantaiVal =
                                                    getFieldValue(
                                                        chain,
                                                        'lantai',
                                                    ) ||
                                                    (chain.length > 2
                                                        ? chain[1]?.nama
                                                        : null);
                                                const ruanganVal =
                                                    getFieldValue(
                                                        chain,
                                                        'ruangan',
                                                    ) ||
                                                    (chain.length > 3
                                                        ? chain[2]?.nama
                                                        : null);
                                                const rakVal =
                                                    getFieldValue(
                                                        chain,
                                                        'rak',
                                                    ) ||
                                                    (chain.length > 4
                                                        ? chain[3]?.nama
                                                        : null);
                                                const boxVal =
                                                    getFieldValue(
                                                        chain,
                                                        'box',
                                                    ) ||
                                                    (chain.length >= 5
                                                        ? chain[4]?.nama
                                                        : null);
                                                const hasDetails = Boolean(
                                                    gedungVal ||
                                                    lantaiVal ||
                                                    ruanganVal ||
                                                    rakVal ||
                                                    boxVal,
                                                );

                                                if (!hasDetails) {
                                                    return null;
                                                }

                                                return (
                                                    <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                                                        {gedungVal && (
                                                            <DetailRow
                                                                label="Gedung"
                                                                value={
                                                                    gedungVal
                                                                }
                                                            />
                                                        )}
                                                        {lantaiVal && (
                                                            <DetailRow
                                                                label="Lantai"
                                                                value={
                                                                    lantaiVal
                                                                }
                                                            />
                                                        )}
                                                        {ruanganVal && (
                                                            <DetailRow
                                                                label="Ruangan"
                                                                value={
                                                                    ruanganVal
                                                                }
                                                            />
                                                        )}
                                                        {rakVal && (
                                                            <DetailRow
                                                                label="Rak"
                                                                value={rakVal}
                                                            />
                                                        )}
                                                        {boxVal && (
                                                            <DetailRow
                                                                label="Box"
                                                                value={boxVal}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Belum diatur
                                        </p>
                                    )}
                                    <Separator className="border-border/40" />
                                    <DetailRow
                                        label="Unit Organisasi"
                                        value={arsip.unit_organisasi?.nama}
                                    />
                                </div>
                            </ContentCard>

                            <ContentCard
                                title="Informasi Sistem"
                                description="Data teknis dan pencatatan"
                            >
                                <div className="space-y-3">
                                    <DetailRow
                                        label="Dibuat oleh"
                                        value={arsip.creator?.name}
                                    />
                                    <DetailRow
                                        label="Tanggal dibuat"
                                        value={arsip.created_at}
                                    />
                                    <DetailRow
                                        label="Diperbarui"
                                        value={arsip.updated_at}
                                    />
                                </div>
                            </ContentCard>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
