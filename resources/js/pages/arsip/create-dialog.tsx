import { useForm } from '@inertiajs/react';
import { FileText, Save, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type MasterItem = {
    id: number;
    kode: string;
    nama: string;
};

export type ArsipCreateDialogProps = {
    open: boolean;
    onClose: () => void;
    klasifikasis?: MasterItem[];
    jenisArsips?: MasterItem[];
    sifatArsips?: MasterItem[];
    tingkatPerkembanganArsips?: MasterItem[];
    unitOrganisasis?: MasterItem[];
    lokasiArsips?: MasterItem[];
    statusArsips?: MasterItem[];
};

export function ArsipCreateDialog({
    open,
    onClose,
    klasifikasis = [],
    jenisArsips = [],
    sifatArsips = [],
    tingkatPerkembanganArsips = [],
    unitOrganisasis = [],
    lokasiArsips = [],
    statusArsips = [],
}: ArsipCreateDialogProps) {

    const { data, setData, post, processing, errors, reset } = useForm({
        nomor_arsip: '',
        judul: '',
        deskripsi: '',
        tanggal_arsip: '',
        klasifikasi_arsip_id: '',
        jenis_arsip_id: '',
        sifat_arsip_id: '',
        tingkat_perkembangan_arsip_id: '',
        unit_organisasi_id: '',
        lokasi_arsip_id: '',
        status_arsip_id: '',
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

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/arsip', {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Tambah Arsip Baru</DialogTitle>
                    <DialogDescription>
                        Registrasi berkas dan metadata arsip baru ke dalam
                        repositori.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
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
                                placeholder="Contoh: ARS/2026/00001"
                                className="border-border/60"
                            />
                            <InputError message={errors.nomor_arsip} />
                        </div>

                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5 sm:col-span-2">
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
                                placeholder="Masukkan judul arsip"
                                className="border-border/60"
                            />
                            <InputError message={errors.judul} />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="deskripsi">
                                Keterangan / Deskripsi
                            </Label>
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) =>
                                    setData('deskripsi', e.target.value)
                                }
                                rows={2}
                                placeholder="Deskripsi singkat isi arsip (opsional)"
                                className="flex w-full resize-none rounded-md border border-border/60 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            />
                            <InputError message={errors.deskripsi} />
                        </div>

                        <div className="space-y-1.5">
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
                            <InputError message={errors.klasifikasi_arsip_id} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="jenis_arsip_id">Jenis Arsip</Label>
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

                        <div className="space-y-1.5">
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
                            <InputError message={errors.unit_organisasi_id} />
                        </div>

                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5">
                            <Label htmlFor="sifat_arsip_id">Sifat Arsip</Label>
                            <Select
                                value={data.sifat_arsip_id}
                                onValueChange={(val) =>
                                    setData('sifat_arsip_id', val)
                                }
                            >
                                <SelectTrigger
                                    id="sifat_arsip_id"
                                    className="border-border/60"
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
                            <InputError message={errors.sifat_arsip_id} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="tingkat_perkembangan_arsip_id">
                                Tingkat Perkembangan
                            </Label>
                            <Select
                                value={data.tingkat_perkembangan_arsip_id}
                                onValueChange={(val) =>
                                    setData(
                                        'tingkat_perkembangan_arsip_id',
                                        val,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="tingkat_perkembangan_arsip_id"
                                    className="border-border/60"
                                >
                                    <SelectValue placeholder="Pilih tingkat..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {tingkatPerkembanganArsips.map((opt) => (
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
                                message={errors.tingkat_perkembangan_arsip_id}
                            />
                        </div>

                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5 sm:col-span-2">
                            <Label>Berkas Digital (Opsional)</Label>
                            {data.file ? (
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
                                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors ${dragActive
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
                                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                                        PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                                        hingga 10MB
                                    </p>
                                </div>
                            )}
                            <InputError message={errors.file} />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
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
