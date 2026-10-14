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
import { BarcodePreview } from '@/components/BarcodePreview';
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

export type MasterItem = {
    id: number;
    kode: string;
    nama: string;
    parent_id?: number | null;
    retensi_aktif?: number | null;
    retensi_inaktif?: number | null;
    nasib_akhir_id?: number | null;
    nasib_akhir?: { id: number; nama: string } | null;
};

export type ArsipCreateDialogProps = {
    open: boolean;
    onClose: () => void;
    initialUnitId?: number | null;
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

export function ArsipCreateDialog({
    open,
    onClose,
    initialUnitId = null,
    klasifikasis = [],
    kategoriArsips = [],
    jenisArsips = [],
    sifatArsips = [],
    tingkatPerkembanganArsips = [],
    unitOrganisasis = [],
    lokasiArsips = [],
    kondisiArsips = [],
    tingkatAksesArsips = [],
}: ArsipCreateDialogProps) {
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
    const defaultUnitId = initialUnitId
        ? initialUnitId.toString()
        : isOperatorUnit && operatorUnitId
          ? operatorUnitId.toString()
          : '';

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        nomor_arsip: '',
        judul: '',
        deskripsi: '',
        tanggal_arsip: '',
        kategori_arsip_id: '',
        no_register: '',
        nop: '',
        npwpd: '',
        nama_wajib_pajak: '',
        klasifikasi_arsip_id: '',
        jenis_arsip_id: '',
        sifat_arsip_id: '',
        tingkat_perkembangan_arsip_id: '',
        unit_organisasi_id: defaultUnitId,
        lokasi_arsip_id: '',
        kondisi_arsip_id: '',
        tingkat_akses_arsip_id: '',
        file: null as File | null,
    });

    const selectedKategori = kategoriArsips.find(
        (k) => k.id.toString() === data.kategori_arsip_id,
    );
    const isPajakDaerah =
        selectedKategori?.nama === 'Arsip Pelayanan Pajak Daerah' ||
        selectedKategori?.kode === 'KAT-002';

    useEffect(() => {
        if (open) {
            if (isOperatorUnit && operatorUnitId) {
                setData('unit_organisasi_id', operatorUnitId.toString());
            } else if (initialUnitId) {
                setData('unit_organisasi_id', initialUnitId.toString());
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, isOperatorUnit, operatorUnitId, initialUnitId]);

    const [dragActive, setDragActive] = useState(false);

    const SUPPORTED_MIME = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
    ];

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

    const handleClose = () => {
        reset();
        clearErrors();

        if (isOperatorUnit && operatorUnitId) {
            setData('unit_organisasi_id', operatorUnitId.toString());
        }

        onClose();
    };

    // Validasi seluruh kolom wajib sebelum data dikirim ke server.
    // Select kustom (KlasifikasiArsipSelect, UnitOrganisasiSelect, LokasiArsipSelect)
    // tidak mendukung atribut HTML `required` bawaan karena bukan <select> native,
    // jadi validasi wajib dilakukan manual di sini.
    const formRef = useRef<HTMLFormElement>(null);

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

        if (!data.file) {
            newErrors.file = 'Berkas digital wajib diunggah.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Berkas Digital';
            }
        }

        if (data.file && !SUPPORTED_MIME.includes(data.file.type)) {
            newErrors.file =
                'Format file tidak didukung. Gunakan PDF, JPG, atau PNG.';

            if (!firstMissingLabel) {
                firstMissingLabel = 'Berkas Digital';
            }
        }

        // Kolom pajak daerah hanya wajib diisi ketika section-nya tampil
        // (yaitu ketika kategori arsip = "Arsip Pelayanan Pajak Daerah").
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
        clearErrors();

        if (!validate()) {
            return;
        }

        post('/arsip', {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat menyimpan arsip baru.', {
                    description: 'Periksa kembali data yang ditandai merah.',
                });
                setTimeout(() => focusFirstInvalidField(formRef.current), 100);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden border-border/60 sm:max-w-2xl">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Tambah Arsip Baru</DialogTitle>
                    <DialogDescription>
                        Registrasi berkas dan metadata arsip baru ke dalam
                        repositori. Semua kolom wajib diisi.
                    </DialogDescription>
                </DialogHeader>

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col overflow-hidden pt-1"
                >
                    <div className="max-h-[calc(90vh-10rem)] flex-1 space-y-4 overflow-y-auto pr-2">
                        {/* Section 1: Informasi Utama Arsip */}
                        <div className="space-y-3 rounded-lg border border-border/70 bg-muted/10 p-3.5">
                            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                1. Informasi Utama Arsip
                            </h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nomor_arsip">
                                        Nomor Arsip{' '}
                                        <span className="text-xs text-muted-foreground">
                                            (Otomatis)
                                        </span>
                                    </Label>
                                    <Input
                                        id="nomor_arsip"
                                        value="[Otomatis dibuat oleh sistem]"
                                        disabled
                                        className="cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Nomor unik akan digenerate otomatis saat
                                        disimpan.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tanggal_arsip">
                                        Tanggal Arsip{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="tanggal_arsip"
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
                                                        Pilih tanggal arsip...
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
                                                startMonth={new Date(1970, 0)}
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
                                <Label htmlFor="judul">
                                    Judul Arsip{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="judul"
                                    required
                                    value={data.judul}
                                    onChange={(e) =>
                                        setData('judul', e.target.value)
                                    }
                                    placeholder="Masukkan judul arsip"
                                    className="border-border/60"
                                />
                                <InputError message={errors.judul} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="deskripsi">
                                    Keterangan / Deskripsi{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <textarea
                                    id="deskripsi"
                                    required
                                    value={data.deskripsi}
                                    onChange={(e) =>
                                        setData('deskripsi', e.target.value)
                                    }
                                    rows={2}
                                    placeholder="Deskripsi singkat isi arsip"
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
                                <Label htmlFor="kategori_arsip_id">
                                    Kategori Arsip{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.kategori_arsip_id}
                                    onValueChange={(val) =>
                                        setData('kategori_arsip_id', val)
                                    }
                                    disabled={kategoriArsips.length === 0}
                                >
                                    <SelectTrigger
                                        id="kategori_arsip_id"
                                        className="w-full border-border/60"
                                    >
                                        <SelectValue
                                            placeholder={
                                                kategoriArsips.length === 0
                                                    ? 'Belum ada data kategori arsip'
                                                    : 'Pilih kategori arsip...'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kategoriArsips.length === 0 ? (
                                            <SelectItem
                                                disabled
                                                value="__empty__"
                                            >
                                                Belum ada data kategori arsip
                                            </SelectItem>
                                        ) : (
                                            kategoriArsips.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.id.toString()}
                                                >
                                                    {opt.nama}
                                                </SelectItem>
                                            ))
                                        )}
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
                                                htmlFor="no_register"
                                                className="text-xs"
                                            >
                                                No Register{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="no_register"
                                                required
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
                                                htmlFor="nop"
                                                className="text-xs"
                                            >
                                                NOP (Nomor Objek Pajak){' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="nop"
                                                required
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

                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="npwpd"
                                                className="text-xs"
                                            >
                                                NPWPD{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="npwpd"
                                                required
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
                                                htmlFor="nama_wajib_pajak"
                                                className="text-xs"
                                            >
                                                Nama Wajib Pajak{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="nama_wajib_pajak"
                                                required
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

                            <KlasifikasiArsipSelect
                                klasifikasis={klasifikasis}
                                value={data.klasifikasi_arsip_id}
                                onChange={(val) =>
                                    setData('klasifikasi_arsip_id', val)
                                }
                                idPrefix="create-klasifikasi"
                            />
                            <InputError message={errors.klasifikasi_arsip_id} />

                            <div className="space-y-1.5 pt-1">
                                <Label htmlFor="jenis_arsip_id">
                                    Jenis Arsip{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.jenis_arsip_id}
                                    onValueChange={(val) =>
                                        setData('jenis_arsip_id', val)
                                    }
                                    disabled={jenisArsips.length === 0}
                                >
                                    <SelectTrigger
                                        id="jenis_arsip_id"
                                        className="w-full border-border/60"
                                    >
                                        <SelectValue
                                            placeholder={
                                                jenisArsips.length === 0
                                                    ? 'Belum ada data jenis arsip'
                                                    : 'Pilih jenis arsip...'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jenisArsips.length === 0 ? (
                                            <SelectItem
                                                disabled
                                                value="__empty__"
                                            >
                                                Belum ada data jenis arsip
                                            </SelectItem>
                                        ) : (
                                            jenisArsips.map((opt) => (
                                                <SelectItem
                                                    key={opt.id}
                                                    value={opt.id.toString()}
                                                >
                                                    {opt.nama}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.jenis_arsip_id} />
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
                                idPrefix="create-unit"
                                locked={isOperatorUnit}
                            />
                            <InputError message={errors.unit_organisasi_id} />

                            <LokasiArsipSelect
                                lokasis={lokasiArsips}
                                value={data.lokasi_arsip_id}
                                onChange={(val) =>
                                    setData('lokasi_arsip_id', val)
                                }
                                idPrefix="create-lokasi"
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
                                    <Label htmlFor="sifat_arsip_id">
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
                                        disabled={sifatArsips.length === 0}
                                    >
                                        <SelectTrigger
                                            id="sifat_arsip_id"
                                            className="w-full border-border/60"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    sifatArsips.length === 0
                                                        ? 'Belum ada data sifat arsip'
                                                        : 'Pilih sifat...'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sifatArsips.length === 0 ? (
                                                <SelectItem
                                                    disabled
                                                    value="__empty__"
                                                >
                                                    Belum ada data sifat arsip
                                                </SelectItem>
                                            ) : (
                                                sifatArsips.map((opt) => (
                                                    <SelectItem
                                                        key={opt.id}
                                                        value={opt.id.toString()}
                                                    >
                                                        {opt.nama}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.sifat_arsip_id}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="kondisi_arsip_id">
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
                                        disabled={kondisiArsips.length === 0}
                                    >
                                        <SelectTrigger
                                            id="kondisi_arsip_id"
                                            className="w-full border-border/60"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    kondisiArsips.length === 0
                                                        ? 'Belum ada data kondisi arsip'
                                                        : 'Pilih kondisi...'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kondisiArsips.length === 0 ? (
                                                <SelectItem
                                                    disabled
                                                    value="__empty__"
                                                >
                                                    Belum ada data kondisi arsip
                                                </SelectItem>
                                            ) : (
                                                kondisiArsips.map((opt) => (
                                                    <SelectItem
                                                        key={opt.id}
                                                        value={opt.id.toString()}
                                                    >
                                                        {opt.nama}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.kondisi_arsip_id}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tingkat_akses_arsip_id">
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
                                        disabled={
                                            tingkatAksesArsips.length === 0
                                        }
                                    >
                                        <SelectTrigger
                                            id="tingkat_akses_arsip_id"
                                            className="w-full border-border/60"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    tingkatAksesArsips.length ===
                                                    0
                                                        ? 'Belum ada data tingkat akses'
                                                        : 'Pilih tingkat akses...'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tingkatAksesArsips.length === 0 ? (
                                                <SelectItem
                                                    disabled
                                                    value="__empty__"
                                                >
                                                    Belum ada data tingkat akses
                                                </SelectItem>
                                            ) : (
                                                tingkatAksesArsips.map(
                                                    (opt) => (
                                                        <SelectItem
                                                            key={opt.id}
                                                            value={opt.id.toString()}
                                                        >
                                                            {opt.nama}
                                                        </SelectItem>
                                                    ),
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.tingkat_akses_arsip_id}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="tingkat_perkembangan_arsip_id">
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
                                        disabled={
                                            tingkatPerkembanganArsips.length ===
                                            0
                                        }
                                    >
                                        <SelectTrigger
                                            id="tingkat_perkembangan_arsip_id"
                                            className="w-full border-border/60"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    tingkatPerkembanganArsips.length ===
                                                    0
                                                        ? 'Belum ada data tingkat perkembangan'
                                                        : 'Pilih tingkat...'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tingkatPerkembanganArsips.length ===
                                            0 ? (
                                                <SelectItem
                                                    disabled
                                                    value="__empty__"
                                                >
                                                    Belum ada data tingkat
                                                    perkembangan
                                                </SelectItem>
                                            ) : (
                                                tingkatPerkembanganArsips.map(
                                                    (opt) => (
                                                        <SelectItem
                                                            key={opt.id}
                                                            value={opt.id.toString()}
                                                        >
                                                            {opt.nama}
                                                        </SelectItem>
                                                    ),
                                                )
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
                                <Label>
                                    Upload File Berkas{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                {data.file ? (
                                    <div className="space-y-3">
                                        {/* File info row */}
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

                                        {/* Preview posisi barcode — kiri bawah otomatis */}
                                        <BarcodePreview file={data.file} />
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
                                            Seret dan lepas berkas di sini, atau
                                        </p>
                                        <label className="mt-1.5 inline-flex h-7 cursor-pointer items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
                                            Pilih Berkas
                                            <input
                                                type="file"
                                                required
                                                className="hidden"
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
                                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                                            PDF, JPG, PNG hingga 100MB
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
                        <Button type="submit" size="sm" disabled={processing}>
                            <Save className="mr-1.5 h-4 w-4" />
                            Simpan Arsip
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
