import { useForm, usePage } from '@inertiajs/react';
import { format, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
    Calendar as CalendarIcon,
    FileText,
    Save,
    UploadCloud,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import InputError from '@/components/input-error';
import { KlasifikasiArsipSelect } from '@/components/klasifikasi-arsip-select';
import type { KlasifikasiArsipOption } from '@/components/klasifikasi-arsip-select';
import { LokasiArsipSelect } from '@/components/lokasi-arsip-select';
import type { LokasiArsipOption } from '@/components/lokasi-arsip-select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UnitOrganisasiSelect } from '@/components/unit-organisasi-select';
import type { UnitOrganisasiOption } from '@/components/unit-organisasi-select';
import { cn } from '@/lib/utils';
import { focusFirstInvalidField } from '@/utils/form-validation';
import type { MasterItem } from './create-dialog';

type DokumenArsip = {
    id: number;
    nama_original: string;
    nama_generated: string;
    ukuran: number;
    mime_type: string;
    path_penyimpanan: string;
    uploaded_at: string | null;
};

export type EditableArsip = {
    id: number;
    nomor_arsip: string;
    judul: string;
    deskripsi: string | null;
    tanggal_arsip: string;
    tanggal_arsip_input?: string | null;
    kategori_arsip_id?: number | null;
    no_register?: string | null;
    nop?: string | null;
    npwpd?: string | null;
    nama_wajib_pajak?: string | null;
    kategori_arsip?: MasterItem | null;
    klasifikasi_arsip_id: number;
    jenis_arsip_id: number | null;
    sifat_arsip_id: number | null;
    tingkat_perkembangan_arsip_id: number | null;
    lokasi_arsip_id: number | null;
    unit_organisasi_id: number | null;
    kondisi_arsip_id: number | null;
    tingkat_akses_arsip_id: number | null;
    dokumen?: DokumenArsip | null;
    workflow_status?: string | null;
    catatan_revisi?: string | null;
};

export type ArsipEditDialogProps = {
    open: boolean;
    onClose: () => void;
    arsip: EditableArsip;
    klasifikasis?: KlasifikasiArsipOption[];
    kategoriArsips?: MasterItem[];
    jenisArsips?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    unitOrganisasis?: UnitOrganisasiOption[];
    lokasiArsips?: LokasiArsipOption[];
    kondisiArsips?: MasterItem[];
    tingkatAksesArsips?: MasterItem[];
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

function toDateInputValue(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function ArsipEditDialog({
    open,
    onClose,
    arsip,
    klasifikasis = [],
    kategoriArsips = [],
    jenisArsips = [],
    sifatArsips = [],
    tingkatPerkembanganArsips = [],
    unitOrganisasis = [],
    lokasiArsips = [],
    kondisiArsips = [],
    tingkatAksesArsips = [],
}: ArsipEditDialogProps) {
    const isRevisi = arsip.workflow_status === 'revisi';

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        isDirty,
        setError,
        clearErrors,
    } = useForm({
        _method: 'put',
        nomor_arsip: arsip.nomor_arsip || '',
        judul: arsip.judul || '',
        deskripsi: arsip.deskripsi || '',
        tanggal_arsip:
            arsip.tanggal_arsip_input || toDateInputValue(arsip.tanggal_arsip),
        kategori_arsip_id: arsip.kategori_arsip_id?.toString() || '',
        no_register: arsip.no_register || '',
        nop: arsip.nop || '',
        npwpd: arsip.npwpd || '',
        nama_wajib_pajak: arsip.nama_wajib_pajak || '',
        klasifikasi_arsip_id: arsip.klasifikasi_arsip_id?.toString() || '',
        jenis_arsip_id: arsip.jenis_arsip_id?.toString() || '',
        sifat_arsip_id: arsip.sifat_arsip_id?.toString() || '',
        tingkat_perkembangan_arsip_id:
            arsip.tingkat_perkembangan_arsip_id?.toString() || '',
        unit_organisasi_id: arsip.unit_organisasi_id?.toString() || '',
        lokasi_arsip_id: arsip.lokasi_arsip_id?.toString() || '',
        kondisi_arsip_id: arsip.kondisi_arsip_id?.toString() || '',
        tingkat_akses_arsip_id: arsip.tingkat_akses_arsip_id?.toString() || '',
        file: null as File | null,
    });

    const selectedKategori = kategoriArsips.find(
        (k) => k.id.toString() === data.kategori_arsip_id,
    );
    const isPajakDaerah =
        selectedKategori?.nama === 'Arsip Pelayanan Pajak Daerah' ||
        selectedKategori?.kode === 'KAT-002';

    const { auth } = usePage<{
        auth: {
            user: {
                roles?: string[];
                unit_organisasi_id?: number | null;
            } | null;
        };
    }>().props;
    const isOperatorUnit = auth.user?.roles?.includes('Operator Unit') ?? false;
    const operatorUnitId = auth.user?.unit_organisasi_id ?? null;

    useEffect(() => {
        if (
            open &&
            isOperatorUnit &&
            operatorUnitId &&
            !data.unit_organisasi_id
        ) {
            setData('unit_organisasi_id', operatorUnitId.toString());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, isOperatorUnit, operatorUnitId]);

    const [dragActive, setDragActive] = useState(false);
    const [deleteFile, setDeleteFile] = useState(false);

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

    const formRef = useRef<HTMLFormElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (data.file) {
            requestAnimationFrame(() => {
                // Radix focus-trap calls fileInput.focus() on the sr-only input,
                // causing the browser to auto-scroll overflow:hidden parents → content hidden.
                // Reset those first.
                if (formRef.current) {
                    formRef.current.scrollTop = 0;
                    const parent = formRef.current.parentElement;

                    if (parent) {
                        parent.scrollTop = 0;
                    }
                }

                // Then scroll the real scroll container to show the file card.
                requestAnimationFrame(() => {
                    if (scrollContainerRef.current) {
                        const sc = scrollContainerRef.current;
                        sc.scrollTop = sc.scrollHeight;
                    }
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.file]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof typeof data, string>> = {};
        let firstMissingLabel = '';

        if (!data.tanggal_arsip) {
            newErrors.tanggal_arsip = 'Tanggal arsip wajib diisi.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Tanggal Arsip';
            }
        }

        if (!data.judul.trim()) {
            newErrors.judul = 'Judul arsip wajib diisi.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Judul Arsip';
            }
        }

        if (!data.deskripsi.trim()) {
            newErrors.deskripsi = 'Keterangan / deskripsi wajib diisi.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Keterangan / Deskripsi';
            }
        }

        if (!data.kategori_arsip_id) {
            newErrors.kategori_arsip_id = 'Kategori arsip wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Kategori Arsip';
            }
        }

        if (!data.klasifikasi_arsip_id) {
            newErrors.klasifikasi_arsip_id = 'Klasifikasi arsip wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Klasifikasi Arsip';
            }
        }

        if (!data.jenis_arsip_id) {
            newErrors.jenis_arsip_id = 'Jenis arsip wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Jenis Arsip';
            }
        }

        if (!data.unit_organisasi_id) {
            newErrors.unit_organisasi_id = 'Unit organisasi wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Unit Organisasi';
            }
        }

        if (!data.lokasi_arsip_id) {
            newErrors.lokasi_arsip_id = 'Lokasi arsip wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Lokasi Arsip';
            }
        }

        if (!data.sifat_arsip_id) {
            newErrors.sifat_arsip_id = 'Sifat arsip wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Sifat Arsip';
            }
        }

        if (!data.kondisi_arsip_id) {
            newErrors.kondisi_arsip_id = 'Kondisi arsip wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Kondisi Arsip';
            }
        }

        if (!data.tingkat_akses_arsip_id) {
            newErrors.tingkat_akses_arsip_id = 'Tingkat akses wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Tingkat Akses';
            }
        }

        if (!data.tingkat_perkembangan_arsip_id) {
            newErrors.tingkat_perkembangan_arsip_id =
                'Tingkat perkembangan wajib dipilih.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Tingkat Perkembangan';
            }
        }

        if (isPajakDaerah) {
            if (!data.no_register.trim()) {
                newErrors.no_register = 'No register wajib diisi.';

                if (!firstMissingLabel) {
                    firstMissingLabel = 'No Register';
                }
            }

            if (!data.nop.trim()) {
                newErrors.nop = 'NOP wajib diisi.';

                if (!firstMissingLabel) {
                    firstMissingLabel = 'NOP';
                }
            }

            if (!data.npwpd.trim()) {
                newErrors.npwpd = 'NPWPD wajib diisi.';

                if (!firstMissingLabel) {
                    firstMissingLabel = 'NPWPD';
                }
            }

            if (!data.nama_wajib_pajak.trim()) {
                newErrors.nama_wajib_pajak = 'Nama wajib pajak wajib diisi.';

                if (!firstMissingLabel) {
                    firstMissingLabel = 'Nama Wajib Pajak';
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setError(newErrors as Record<string, string>);
            toast.warning(
                `Harap isi kolom "${firstMissingLabel}" yang wajib diisi.`,
                {
                    description:
                        'Lengkapi seluruh kolom bertanda bintang sebelum memperbarui.',
                },
            );
            setTimeout(() => focusFirstInvalidField(formRef.current), 100);

            return false;
        }

        return true;
    };

    const handleClose = () => {
        reset();
        setDeleteFile(false);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        if (!validate()) {
            return;
        }

        post(`/arsip/${arsip.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat memperbarui arsip.', {
                    description: 'Periksa kembali data yang ditandai merah.',
                });
                setTimeout(() => focusFirstInvalidField(formRef.current), 100);
            },
        });
    };

    const [showConfirmDeleteFile, setShowConfirmDeleteFile] = useState(false);

    const handleDeleteExistingFile = () => {
        setShowConfirmDeleteFile(true);
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(isOpen) => !isOpen && handleClose()}
            >
                <DialogContent
                    className="flex max-h-[90vh] flex-col overflow-hidden border-border/60 sm:max-w-2xl"
                    onFocusOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="shrink-0">
                        <DialogTitle>
                            {isRevisi
                                ? `Revisi Arsip — ${arsip.nomor_arsip}`
                                : `Edit Arsip — ${arsip.nomor_arsip}`}
                        </DialogTitle>
                        <DialogDescription>
                            {isRevisi
                                ? 'Perbarui berkas atau data arsip untuk diajukan ulang ke tahap verifikasi.'
                                : 'Perbarui berkas dan metadata arsip.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        noValidate
                        className="flex min-h-0 flex-1 flex-col overflow-hidden pt-1"
                    >
                        <div
                            ref={scrollContainerRef}
                            className="max-h-[calc(90vh-10rem)] flex-1 space-y-4 overflow-y-auto pr-2"
                        >
                            {isRevisi && arsip.catatan_revisi && (
                                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-foreground">
                                    <span className="font-semibold text-destructive">
                                        Catatan Revisi:
                                    </span>{' '}
                                    {arsip.catatan_revisi}
                                </div>
                            )}
                            {/* Section 1: Informasi Utama Arsip */}
                            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3.5">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    1. Informasi Utama Arsip
                                </h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_nomor_arsip">
                                            Nomor Arsip{' '}
                                            <span className="text-xs text-muted-foreground">
                                                (Otomatis)
                                            </span>
                                        </Label>
                                        <Input
                                            id="edit_nomor_arsip"
                                            value={data.nomor_arsip}
                                            disabled
                                            className="cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground"
                                        />
                                        <InputError
                                            message={errors.nomor_arsip}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_tanggal_arsip">
                                            Tanggal Arsip{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="edit_tanggal_arsip"
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start border-border/60 text-left font-normal',
                                                        !data.tanggal_arsip &&
                                                            'text-muted-foreground',
                                                        errors.tanggal_arsip &&
                                                            'border-destructive',
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                                    {data.tanggal_arsip &&
                                                    isValid(
                                                        new Date(
                                                            data.tanggal_arsip +
                                                                'T00:00:00',
                                                        ),
                                                    ) ? (
                                                        format(
                                                            new Date(
                                                                data.tanggal_arsip +
                                                                    'T00:00:00',
                                                            ),
                                                            'dd MMMM yyyy',
                                                            {
                                                                locale: idLocale,
                                                            },
                                                        )
                                                    ) : (
                                                        <span>
                                                            Pilih tanggal
                                                            arsip...
                                                        </span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        data.tanggal_arsip
                                                            ? new Date(
                                                                  data.tanggal_arsip +
                                                                      'T00:00:00',
                                                              )
                                                            : undefined
                                                    }
                                                    onSelect={(date) => {
                                                        setData(
                                                            'tanggal_arsip',
                                                            date
                                                                ? format(
                                                                      date,
                                                                      'yyyy-MM-dd',
                                                                  )
                                                                : '',
                                                        );
                                                    }}
                                                    locale={idLocale}
                                                    captionLayout="dropdown"
                                                    startMonth={
                                                        new Date(1970, 0)
                                                    }
                                                    endMonth={
                                                        new Date(
                                                            new Date().getFullYear() +
                                                                10,
                                                            11,
                                                        )
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <InputError
                                            message={errors.tanggal_arsip}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_judul">
                                        Judul Arsip{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="edit_judul"
                                        value={data.judul}
                                        onChange={(e) =>
                                            setData('judul', e.target.value)
                                        }
                                        className="border-border/60"
                                    />
                                    <InputError message={errors.judul} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_deskripsi">
                                        Keterangan / Deskripsi
                                    </Label>
                                    <textarea
                                        id="edit_deskripsi"
                                        value={data.deskripsi}
                                        onChange={(e) =>
                                            setData('deskripsi', e.target.value)
                                        }
                                        rows={2}
                                        className="flex w-full resize-none rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                    />
                                    <InputError message={errors.deskripsi} />
                                </div>
                            </div>

                            {/* Section 2: Klasifikasi & Kategori Arsip */}
                            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3.5">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    2. Kategori, Klasifikasi & Jenis Arsip
                                </h4>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit_kategori_arsip_id">
                                        Kategori Arsip
                                    </Label>
                                    <Select
                                        value={data.kategori_arsip_id}
                                        onValueChange={(val) =>
                                            setData('kategori_arsip_id', val)
                                        }
                                    >
                                        <SelectTrigger
                                            id="edit_kategori_arsip_id"
                                            className="w-full border-border/60"
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
                                    <div className="animate-in space-y-3 rounded-md border border-primary/20 bg-primary/5 p-3 duration-200 fade-in-50">
                                        <h5 className="text-xs font-semibold text-primary">
                                            Data Pelayanan Pajak Daerah
                                        </h5>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="edit_no_register"
                                                    className="text-xs"
                                                >
                                                    No Register
                                                </Label>
                                                <Input
                                                    id="edit_no_register"
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

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="edit_nop"
                                                    className="text-xs"
                                                >
                                                    NOP (Nomor Objek Pajak)
                                                </Label>
                                                <Input
                                                    id="edit_nop"
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
                                                <InputError
                                                    message={errors.nop}
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="edit_npwpd"
                                                    className="text-xs"
                                                >
                                                    NPWPD
                                                </Label>
                                                <Input
                                                    id="edit_npwpd"
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

                                            <div className="space-y-1.5">
                                                <Label
                                                    htmlFor="edit_nama_wajib_pajak"
                                                    className="text-xs"
                                                >
                                                    Nama Wajib Pajak
                                                </Label>
                                                <Input
                                                    id="edit_nama_wajib_pajak"
                                                    value={
                                                        data.nama_wajib_pajak
                                                    }
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

                                <KlasifikasiArsipSelect
                                    klasifikasis={klasifikasis}
                                    value={data.klasifikasi_arsip_id}
                                    onChange={(val) =>
                                        setData('klasifikasi_arsip_id', val)
                                    }
                                    idPrefix="edit-klasifikasi"
                                />
                                <InputError
                                    message={errors.klasifikasi_arsip_id}
                                />

                                <div className="space-y-1.5 pt-1">
                                    <Label htmlFor="edit_jenis_arsip_id">
                                        Jenis Arsip{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.jenis_arsip_id}
                                        onValueChange={(val) =>
                                            setData('jenis_arsip_id', val)
                                        }
                                    >
                                        <SelectTrigger
                                            id="edit_jenis_arsip_id"
                                            className="w-full border-border/60"
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
                            </div>

                            {/* Section 3: Unit Organisasi & Lokasi Fisik */}
                            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3.5">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    3. Unit Organisasi & Lokasi Fisik
                                </h4>
                                <UnitOrganisasiSelect
                                    units={unitOrganisasis}
                                    value={data.unit_organisasi_id}
                                    onChange={(val) =>
                                        setData('unit_organisasi_id', val)
                                    }
                                    idPrefix="edit-unit"
                                    locked={isOperatorUnit}
                                />
                                <InputError
                                    message={errors.unit_organisasi_id}
                                />

                                <LokasiArsipSelect
                                    lokasis={lokasiArsips}
                                    value={data.lokasi_arsip_id}
                                    onChange={(val) =>
                                        setData('lokasi_arsip_id', val)
                                    }
                                    idPrefix="edit-lokasi"
                                />
                                <InputError message={errors.lokasi_arsip_id} />
                            </div>

                            {/* Section 4: Sifat & Tingkat Akses */}
                            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3.5">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    4. Sifat & Akses Arsip
                                </h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_sifat_arsip_id">
                                            Sifat Arsip{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.sifat_arsip_id}
                                            onValueChange={(val) =>
                                                setData('sifat_arsip_id', val)
                                            }
                                        >
                                            <SelectTrigger
                                                id="edit_sifat_arsip_id"
                                                className="w-full border-border/60"
                                            >
                                                <SelectValue placeholder="Pilih sifat..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sifatArsips.map((opt) => (
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
                                            message={errors.sifat_arsip_id}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_kondisi_arsip_id">
                                            Kondisi Arsip{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.kondisi_arsip_id}
                                            onValueChange={(val) =>
                                                setData('kondisi_arsip_id', val)
                                            }
                                        >
                                            <SelectTrigger
                                                id="edit_kondisi_arsip_id"
                                                className="w-full border-border/60"
                                            >
                                                <SelectValue placeholder="Pilih kondisi..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kondisiArsips.map((opt) => (
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
                                            message={errors.kondisi_arsip_id}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_tingkat_akses_arsip_id">
                                            Tingkat Akses{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.tingkat_akses_arsip_id}
                                            onValueChange={(val) =>
                                                setData(
                                                    'tingkat_akses_arsip_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="edit_tingkat_akses_arsip_id"
                                                className="w-full border-border/60"
                                            >
                                                <SelectValue placeholder="Pilih tingkat akses..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tingkatAksesArsips.map(
                                                    (opt) => (
                                                        <SelectItem
                                                            key={opt.id}
                                                            value={opt.id.toString()}
                                                        >
                                                            {opt.nama}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                errors.tingkat_akses_arsip_id
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit_tingkat_perkembangan_arsip_id">
                                            Tingkat Perkembangan{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={
                                                data.tingkat_perkembangan_arsip_id
                                            }
                                            onValueChange={(val) =>
                                                setData(
                                                    'tingkat_perkembangan_arsip_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="edit_tingkat_perkembangan_arsip_id"
                                                className="w-full border-border/60"
                                            >
                                                <SelectValue placeholder="Pilih tingkat..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tingkatPerkembanganArsips.map(
                                                    (opt) => (
                                                        <SelectItem
                                                            key={opt.id}
                                                            value={opt.id.toString()}
                                                        >
                                                            {opt.nama}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                errors.tingkat_perkembangan_arsip_id
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Berkas Digital */}
                            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3.5">
                                <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    5. Berkas Digital Arsip
                                </h4>
                                <div className="space-y-1.5">
                                    <Label>Dokumen Digital</Label>

                                    {arsip.dokumen &&
                                    !data.file &&
                                    !deleteFile ? (
                                        <div className="mb-2 flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <FileText className="h-7 w-7 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium">
                                                        {
                                                            arsip.dokumen
                                                                .nama_original
                                                        }
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {formatBytes(
                                                            arsip.dokumen
                                                                .ukuran,
                                                        )}{' '}
                                                        ·{' '}
                                                        {
                                                            arsip.dokumen
                                                                .mime_type
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 shrink-0 self-end text-xs text-destructive hover:bg-destructive/10 hover:text-destructive sm:self-auto"
                                                onClick={
                                                    handleDeleteExistingFile
                                                }
                                            >
                                                Ganti Berkas
                                            </Button>
                                        </div>
                                    ) : data.file ? (
                                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <FileText className="h-7 w-7 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium">
                                                        {data.file.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {(
                                                            data.file.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{' '}
                                                        MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                    setData('file', null)
                                                }
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
                                            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                                                dragActive
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border/60 bg-muted/20'
                                            }`}
                                        >
                                            <UploadCloud className="mx-auto mb-1 h-7 w-7 text-muted-foreground" />
                                            <p className="text-xs font-medium">
                                                Seret dan lepas berkas baru di
                                                sini, atau
                                            </p>
                                            <label className="mt-1.5 inline-flex h-7 cursor-pointer items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
                                                Pilih Berkas
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                    onChange={(e) =>
                                                        setData(
                                                            'file',
                                                            e.target.files
                                                                ? e.target
                                                                      .files[0]
                                                                : null,
                                                        )
                                                    }
                                                />
                                            </label>
                                            <p className="mt-1.5 text-[10px] text-muted-foreground">
                                                PDF, DOC, DOCX, XLS, XLSX, JPG,
                                                PNG hingga 100MB
                                            </p>
                                        </div>
                                    )}
                                    <InputError message={errors.file} />
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/40 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClose}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing || !isDirty}
                            >
                                <Save className="mr-1.5 h-4 w-4" />
                                {isRevisi ? 'Revisi' : 'Perbarui Arsip'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={showConfirmDeleteFile}
                onClose={() => setShowConfirmDeleteFile(false)}
                onConfirm={() => {
                    setDeleteFile(true);
                    setShowConfirmDeleteFile(false);
                }}
                title="Hapus Dokumen Arsip"
                description="Apakah Anda yakin ingin menghapus berkas dokumen ini dari daftar unggahan? Klik simpan nanti untuk memperbarui data."
                confirmLabel="Hapus"
                destructive
            />
        </>
    );
}
