import { Head, router, useForm } from '@inertiajs/react';
import {
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Can } from '@/components/Can';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import InputError from '@/components/input-error';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
import { DataTablePagination } from '@/components/Tables/data-table-pagination';
import { DataToolbar } from '@/components/Tables/data-toolbar';
import { EmptyTable } from '@/components/Tables/empty-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { destroy, index, store, update } from '@/routes/admin/pengguna';
import { focusFirstInvalidField } from '@/utils/form-validation';

type Pengguna = {
    id: number;
    name: string;
    username: string | null;
    email: string;
    nip: string | null;
    nik: string | null;
    status: 'active' | 'inactive';
    unit_organisasi_id: number | null;
    unit_organisasi: UnitOrganisasiDisplay;
    jabatan_id: number | null;
    jabatan: string | null;
    roles: string[];
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedPengguna = {
    data: Pengguna[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: PaginationLink[];
};

type UnitOrganisasi = {
    id: number;
    nama: string;
    tipe: 'bidang' | 'sub_bidang' | 'upt';
    parent_id: number | null;
};

type Jabatan = { id: number; nama: string };

type Stats = {
    total: number;
    aktif: number;
    nonaktif: number;
    bulan_ini: number;
};

type IndexProps = {
    users: PaginatedPengguna;
    stats: Stats;
    roles: string[];
    unit_organisasis: UnitOrganisasi[];
    jabatans: Jabatan[];
    filters: {
        search?: string;
        status?: string;
        role?: string;
        unit?: string;
    };
};

type UnitOrganisasiDisplay = {
    bidang: string | null;
    sub_bidang: string | null;
    upt: string | null;
} | null;

type PenggunaFormData = {
    name: string;
    username: string;
    email: string;
    password: string;
    nip: string;
    nik: string;
    unit_organisasi_id: string;
    jabatan_id: string;
    status: 'active' | 'inactive';
    roles: string[];
};

const emptyForm: PenggunaFormData = {
    name: '',
    username: '',
    email: '',
    password: '',
    nip: '',
    nik: '',
    unit_organisasi_id: '',
    jabatan_id: '',
    status: 'active',
    roles: [],
};

function statusVariant(status: Pengguna['status']) {
    return status === 'active' ? 'success' : 'secondary';
}

function statusLabel(status: Pengguna['status']) {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
}

function renderUnitOrganisasi(unit: UnitOrganisasiDisplay) {
    if (!unit || (!unit.bidang && !unit.sub_bidang && !unit.upt)) {
        return <span className="text-muted-foreground">—</span>;
    }

    if (unit.upt) {
        return (
            <span className="block truncate" title={unit.upt}>
                {unit.upt}
            </span>
        );
    }

    if (unit.sub_bidang) {
        return (
            <div className="flex flex-col leading-tight">
                <span
                    className="truncate font-medium text-foreground"
                    title={unit.bidang ?? ''}
                >
                    {unit.bidang}
                </span>
                <span
                    className="truncate text-xs text-muted-foreground"
                    title={unit.sub_bidang}
                >
                    {unit.sub_bidang}
                </span>
            </div>
        );
    }

    return (
        <span className="block truncate" title={unit.bidang ?? ''}>
            {unit.bidang}
        </span>
    );
}

function PenggunaFormDialog({
    open,
    mode,
    pengguna,
    roles,
    unitOrganisasis,
    jabatans,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    pengguna: Pengguna | null;
    roles: string[];
    unitOrganisasis: UnitOrganisasi[];
    jabatans: Jabatan[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<PenggunaFormData>(emptyForm);
    const [kategori, setKategori] = useState<'' | 'bidang' | 'upt'>('');
    const [selectedBidangId, setSelectedBidangId] = useState<string>('');

    const bidangList = unitOrganisasis.filter((u) => u.tipe === 'bidang');
    const uptList = unitOrganisasis.filter((u) => u.tipe === 'upt');
    const subBidangList = unitOrganisasis.filter(
        (u) =>
            u.tipe === 'sub_bidang' && String(u.parent_id) === selectedBidangId,
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            pengguna
                ? {
                      name: pengguna.name,
                      username: pengguna.username ?? '',
                      email: pengguna.email,
                      password: '',
                      nip: pengguna.nip ?? '',
                      nik: pengguna.nik ?? '',
                      unit_organisasi_id: pengguna.unit_organisasi_id
                          ? String(pengguna.unit_organisasi_id)
                          : '',
                      jabatan_id: pengguna.jabatan_id
                          ? String(pengguna.jabatan_id)
                          : '',
                      status: pengguna.status,
                      roles: pengguna.roles,
                  }
                : emptyForm,
        );

        if (pengguna?.unit_organisasi_id) {
            const current = unitOrganisasis.find(
                (u) => u.id === pengguna.unit_organisasi_id,
            );

            if (current?.tipe === 'upt') {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setKategori('upt');
                setSelectedBidangId('');
            } else if (current?.tipe === 'bidang') {
                setKategori('bidang');
                setSelectedBidangId(String(current.id));
            } else if (current?.tipe === 'sub_bidang') {
                setKategori('bidang');
                setSelectedBidangId(String(current.parent_id));
            }
        } else {
            setKategori('');
            setSelectedBidangId('');
        }

        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleKategoriChange = (value: 'bidang' | 'upt') => {
        setKategori(value);
        setSelectedBidangId('');
        form.setData('unit_organisasi_id', '');
    };

    const handleBidangChange = (bidangId: string) => {
        setSelectedBidangId(bidangId);
        form.setData('unit_organisasi_id', bidangId);
    };

    const handleSubBidangChange = (value: string) => {
        form.setData(
            'unit_organisasi_id',
            value === '__none__' ? selectedBidangId : value,
        );
    };

    const selectRole = (role: string) => {
        form.setData('roles', [role]);
        form.clearErrors('roles');
    };

    const formRef = useRef<HTMLFormElement>(null);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.data.name.trim()) {
            toast.warning('Harap isi kolom "Nama" yang wajib diisi.');
            focusFirstInvalidField(formRef.current);
            document.getElementById('name')?.focus();

            return;
        }

        if (!form.data.username.trim()) {
            toast.warning('Harap isi kolom "Nama Pengguna" yang wajib diisi.');
            document.getElementById('username')?.focus();

            return;
        }

        if (!form.data.email.trim()) {
            toast.warning('Harap isi kolom "Email" yang wajib diisi.');
            document.getElementById('email')?.focus();

            return;
        }

        if (mode === 'create' && !form.data.password.trim()) {
            toast.warning('Harap isi kolom "Password" yang wajib diisi.');
            document.getElementById('password')?.focus();

            return;
        }

        if (form.data.roles.length === 0 || !form.data.roles[0]) {
            form.setError('roles', 'Role wajib dipilih.');
            toast.warning('Harap pilih role untuk pengguna ini.');

            return;
        }

        if (mode === 'edit' && pengguna) {
            form.put(update.url({ pengguna: pengguna.id }), {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
                onError: () =>
                    toast.error(
                        'Terjadi kesalahan saat memperbarui data pengguna.',
                        {
                            description:
                                'Periksa kembali kolom yang ditandai merah.',
                        },
                    ),
            });

            return;
        }

        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
            onError: () =>
                toast.error('Terjadi kesalahan saat menyimpan data pengguna.', {
                    description: 'Periksa kembali kolom yang ditandai merah.',
                }),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-xl">
                <DialogHeader className="shrink-0 border-b border-border/50 p-6 pb-4">
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create'
                            ? 'Tambah Pengguna'
                            : 'Edit Pengguna'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {mode === 'create'
                            ? 'Isi data pengguna baru. Kolom dengan tanda bintang (*) wajib diisi.'
                            : 'Perbarui data pengguna. Kosongkan password jika tidak ingin mengubah.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    ref={formRef}
                    onSubmit={submit}
                    noValidate
                    className="flex-1 space-y-4 overflow-y-auto p-6"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nama <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                required
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Nama lengkap"
                                maxLength={255}
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">
                                Nama Pengguna{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="username"
                                required
                                value={form.data.username}
                                onChange={(e) =>
                                    form.setData('username', e.target.value)
                                }
                                placeholder="Username login"
                                maxLength={255}
                            />
                            <InputError message={form.errors.username} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                placeholder="email@example.com"
                                maxLength={255}
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">
                                Status{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(
                                    value: PenggunaFormData['status'],
                                ) => form.setData('status', value)}
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.status} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nip">NIP</Label>
                            <Input
                                id="nip"
                                value={form.data.nip}
                                onChange={(e) =>
                                    form.setData(
                                        'nip',
                                        e.target.value.replace(/[^0-9]/g, ''),
                                    )
                                }
                                placeholder="Nomor Induk Pegawai"
                                maxLength={18}
                            />
                            <InputError message={form.errors.nip} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nik">NIK</Label>
                            <Input
                                id="nik"
                                value={form.data.nik}
                                onChange={(e) =>
                                    form.setData(
                                        'nik',
                                        e.target.value.replace(/[^0-9]/g, ''),
                                    )
                                }
                                placeholder="Nomor Induk Kependudukan"
                                maxLength={16}
                            />
                            <InputError message={form.errors.nik} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {mode === 'edit' ? (
                                <>
                                    Password Baru{' '}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        (kosongkan jika tidak diubah)
                                    </span>
                                </>
                            ) : (
                                <>
                                    Password{' '}
                                    <span className="text-destructive">*</span>
                                </>
                            )}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required={mode === 'create'}
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            placeholder="Min. 8 karakter"
                            autoComplete="new-password"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Kategori Unit</Label>
                            <Select
                                value={kategori}
                                onValueChange={handleKategoriChange}
                                disabled={unitOrganisasis.length === 0}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            unitOrganisasis.length === 0
                                                ? 'Belum ada data unit organisasi'
                                                : 'Pilih kategori'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {unitOrganisasis.length === 0 ? (
                                        <SelectItem disabled value="__empty__">
                                            Belum ada data unit organisasi
                                        </SelectItem>
                                    ) : (
                                        <>
                                            <SelectItem value="bidang">
                                                Bidang
                                            </SelectItem>
                                            <SelectItem value="upt">
                                                UPT
                                            </SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {kategori === 'bidang' && (
                            <div className="space-y-2">
                                <Label>Bidang</Label>
                                <Select
                                    value={selectedBidangId}
                                    onValueChange={handleBidangChange}
                                    disabled={bidangList.length === 0}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                bidangList.length === 0
                                                    ? 'Belum ada data bidang'
                                                    : 'Pilih bidang'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bidangList.length === 0 ? (
                                            <SelectItem
                                                disabled
                                                value="__empty__"
                                            >
                                                Belum ada data bidang
                                            </SelectItem>
                                        ) : (
                                            bidangList.map((b) => (
                                                <SelectItem
                                                    key={b.id}
                                                    value={String(b.id)}
                                                >
                                                    {b.nama}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {kategori === 'bidang' && selectedBidangId && (
                            <div className="space-y-2">
                                <Label>Sub Bidang</Label>
                                <Select
                                    value={
                                        form.data.unit_organisasi_id ===
                                        selectedBidangId
                                            ? '__none__'
                                            : form.data.unit_organisasi_id
                                    }
                                    onValueChange={handleSubBidangChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih sub bidang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">
                                            Tidak ada (Kepala Bidang)
                                        </SelectItem>
                                        {subBidangList.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={String(s.id)}
                                            >
                                                {s.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {kategori === 'upt' && (
                            <div className="space-y-2 sm:col-span-2">
                                <Label>UPT</Label>
                                <Select
                                    value={form.data.unit_organisasi_id}
                                    onValueChange={(v) =>
                                        form.setData('unit_organisasi_id', v)
                                    }
                                    disabled={uptList.length === 0}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                uptList.length === 0
                                                    ? 'Belum ada data UPT'
                                                    : 'Pilih UPT'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uptList.length === 0 ? (
                                            <SelectItem
                                                disabled
                                                value="__empty__"
                                            >
                                                Belum ada data UPT
                                            </SelectItem>
                                        ) : (
                                            uptList.map((u) => (
                                                <SelectItem
                                                    key={u.id}
                                                    value={String(u.id)}
                                                >
                                                    {u.nama}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <InputError message={form.errors.unit_organisasi_id} />

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="jabatan_id">Jabatan</Label>
                            <Select
                                value={form.data.jabatan_id}
                                onValueChange={(v) =>
                                    form.setData('jabatan_id', v)
                                }
                                disabled={jabatans.length === 0}
                            >
                                <SelectTrigger
                                    id="jabatan_id"
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder={
                                            jabatans.length === 0
                                                ? 'Belum ada data jabatan'
                                                : 'Pilih jabatan'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {jabatans.length === 0 ? (
                                        <SelectItem disabled value="__empty__">
                                            Belum ada data jabatan
                                        </SelectItem>
                                    ) : (
                                        jabatans.map((j) => (
                                            <SelectItem
                                                key={j.id}
                                                value={String(j.id)}
                                            >
                                                {j.nama}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.jabatan_id} />
                        </div>
                    </div>

                    {roles.length > 0 && (
                        <div className="space-y-2">
                            <Label>
                                Role <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => selectRole(role)}
                                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                            form.data.roles.includes(role)
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                            <InputError message={form.errors.roles} />
                        </div>
                    )}

                    <DialogFooter className="border-t border-border/50 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={form.processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && (
                                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            )}
                            {mode === 'create' ? 'Simpan' : 'Perbarui'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DetailDialog({
    pengguna,
    onOpenChange,
}: {
    pengguna: Pengguna | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={pengguna !== null} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Pengguna
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi lengkap pengguna.
                    </DialogDescription>
                </DialogHeader>

                {pengguna && (
                    <div className="grid gap-3 text-sm">
                        <DetailRow label="Nama" value={pengguna.name} />
                        <DetailRow
                            label="Nama Pengguna"
                            value={pengguna.username || '-'}
                        />
                        <DetailRow label="Email" value={pengguna.email} />
                        <DetailRow
                            label="Password"
                            value="•••••••• (Tersimpan aman & terenkripsi)"
                        />
                        {pengguna.nip && (
                            <DetailRow label="NIP" value={pengguna.nip} mono />
                        )}
                        <DetailRow
                            label="NIK"
                            value={pengguna.nik || '-'}
                            mono
                        />
                        {pengguna.unit_organisasi?.upt ? (
                            <DetailRow
                                label="UPT"
                                value={pengguna.unit_organisasi.upt}
                            />
                        ) : pengguna.unit_organisasi?.sub_bidang ? (
                            <>
                                <DetailRow
                                    label="Bidang"
                                    value={
                                        pengguna.unit_organisasi.bidang || '-'
                                    }
                                />
                                <DetailRow
                                    label="Sub Bidang"
                                    value={pengguna.unit_organisasi.sub_bidang}
                                />
                            </>
                        ) : pengguna.unit_organisasi?.bidang ? (
                            <DetailRow
                                label="Bidang"
                                value={pengguna.unit_organisasi.bidang}
                            />
                        ) : (
                            <DetailRow label="Unit Organisasi" value="-" />
                        )}
                        <DetailRow
                            label="Jabatan"
                            value={pengguna.jabatan || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={pengguna.created_at || '-'}
                        />
                        <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <StatusBadge
                                variant={statusVariant(pengguna.status)}
                            >
                                {statusLabel(pengguna.status)}
                            </StatusBadge>
                        </div>
                        {pengguna.roles.length > 0 && (
                            <div className="flex items-start justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Role
                                </span>
                                <div className="flex flex-wrap justify-end gap-1">
                                    {pengguna.roles.map((r) => (
                                        <Badge
                                            key={r}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {r}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={
                    mono
                        ? 'text-right font-mono text-xs'
                        : 'text-right font-medium'
                }
            >
                {value}
            </span>
        </div>
    );
}

function StatValue({ value }: { value: number }) {
    return (
        <div className="text-2xl font-semibold tracking-normal text-foreground">
            {value.toLocaleString('id-ID')}
        </div>
    );
}

export default function PenggunaIndex({
    users,
    stats,
    roles,
    unit_organisasis,
    jabatans,
    filters = {},
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedPengguna, setSelectedPengguna] = useState<Pengguna | null>(
        null,
    );
    const [detailPengguna, setDetailPengguna] = useState<Pengguna | null>(null);
    const [deletePengguna, setDeletePengguna] = useState<Pengguna | null>(null);
    const [deleting, setDeleting] = useState(false);

    const updateFilters = (
        newParams: Record<string, string | null | undefined>,
    ) => {
        const params = { ...filters, ...newParams };

        Object.keys(params).forEach((key) => {
            const value = params[key as keyof typeof params];

            if (value === undefined || value === '' || value === null) {
                delete params[key as keyof typeof params];
            }
        });

        router.get(index().url, params, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const t = setTimeout(() => {
            if (search !== (filters.search || '')) {
                updateFilters({ search });
            }
        }, 500);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const openCreateDialog = () => {
        setSelectedPengguna(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (pengguna: Pengguna) => {
        setSelectedPengguna(pengguna);
        setFormMode('edit');
        setFormOpen(true);
    };

    const clearFilters = () => {
        setSearch('');
        router.get(index().url, {}, { preserveState: true, replace: true });
    };

    const confirmDelete = () => {
        if (!deletePengguna) {
            return;
        }

        setDeleting(true);

        router.delete(destroy({ pengguna: deletePengguna.id }).url, {
            preserveScroll: true,
            onError: () => {
                toast.error('Pengguna gagal dihapus.', {
                    description: 'Terjadi kesalahan, silakan coba lagi.',
                });
            },
            onSuccess: () => {
                setDeletePengguna(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(
        filters.search || filters.status || filters.role || filters.unit,
    );

    return (
        <RouteGuard permission="admin-pengguna.view">
            <Head title="Pengguna" />

            <PageContainer>
                <PageHeader
                    title="Pengguna"
                    description="Manajemen akun pengguna sistem LARAS."
                    breadcrumb={[
                        { title: 'ADMINISTRASI' },
                        { title: 'Pengguna', href: index.url() },
                    ]}
                    actions={
                        <Can permission="user.create">
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Pengguna
                            </Button>
                        </Can>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <ContentCard title="Total Pengguna">
                        <StatValue value={stats.total} />
                    </ContentCard>
                    <ContentCard title="Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>
                    <ContentCard title="Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Pengguna"
                    description="Seluruh akun pengguna yang terdaftar di sistem"
                >
                    <div className="space-y-4">
                        <DataToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Cari nama, email, atau NIP..."
                            filters={
                                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                    <div className="w-full sm:w-auto">
                                        <Select
                                            value={filters.unit || '__all__'}
                                            onValueChange={(value) =>
                                                updateFilters({
                                                    unit:
                                                        value === '__all__'
                                                            ? null
                                                            : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="h-9 w-full border-border/60 sm:w-[200px]">
                                                <SelectValue placeholder="Semua Unit" />
                                            </SelectTrigger>
                                            <SelectContent
                                                align="start"
                                                collisionPadding={16}
                                                className="max-h-[280px] w-[min(320px,calc(100vw-2rem))]"
                                            >
                                                <SelectItem value="__all__">
                                                    Semua Unit
                                                </SelectItem>
                                                {unit_organisasis.map((u) => (
                                                    <SelectItem
                                                        key={u.id}
                                                        value={String(u.id)}
                                                        className="whitespace-normal"
                                                    >
                                                        {u.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {hasFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="mr-1 h-4 w-4" />
                                            Reset Filter
                                        </Button>
                                    )}
                                </div>
                            }
                        />

                        {users.data.length === 0 ? (
                            <EmptyTable
                                title="Tidak ada pengguna ditemukan"
                                description="Tidak ada data pengguna yang cocok dengan pencarian Anda."
                                icon={Users}
                            />
                        ) : (
                            <>
                                {/* Mobile card view */}
                                <div className="flex flex-col gap-3 md:hidden">
                                    {users.data.map((pengguna) => (
                                        <div
                                            key={pengguna.id}
                                            className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className="truncate text-sm font-semibold text-foreground"
                                                        title={pengguna.name}
                                                    >
                                                        {pengguna.name}
                                                    </p>
                                                    <p
                                                        className="truncate text-xs text-muted-foreground"
                                                        title={pengguna.email}
                                                    >
                                                        {pengguna.email}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 flex-col items-end gap-1">
                                                    <StatusBadge
                                                        variant={statusVariant(
                                                            pengguna.status,
                                                        )}
                                                    >
                                                        {statusLabel(
                                                            pengguna.status,
                                                        )}
                                                    </StatusBadge>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                                                {pengguna.username && (
                                                    <span className="font-mono">
                                                        {pengguna.username}
                                                    </span>
                                                )}
                                                {pengguna.roles.length > 0 && (
                                                    <span className="font-medium text-foreground">
                                                        {pengguna.roles.join(
                                                            ', ',
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/60 pt-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() =>
                                                        setDetailPengguna(
                                                            pengguna,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                    Detail
                                                </Button>
                                                <Can permission="user.update">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() =>
                                                            openEditDialog(
                                                                pengguna,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                        Edit
                                                    </Button>
                                                </Can>
                                                <Can permission="user.delete">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-destructive hover:text-destructive"
                                                        onClick={() => {
                                                            setDeletePengguna(
                                                                pengguna,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Can>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop table view */}
                                <div className="hidden overflow-hidden rounded-md border border-border/60 md:block">
                                    <Table className="w-full table-fixed">
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-[18%] font-semibold">
                                                    Nama
                                                </TableHead>
                                                <TableHead className="w-[13%] font-semibold">
                                                    Nama Pengguna
                                                </TableHead>
                                                <TableHead className="w-[17%] font-semibold">
                                                    Email
                                                </TableHead>
                                                <TableHead className="w-[11%] font-semibold">
                                                    NIP
                                                </TableHead>
                                                <TableHead className="w-[11%] font-semibold">
                                                    NIK
                                                </TableHead>
                                                <TableHead className="w-[11%] font-semibold">
                                                    Role
                                                </TableHead>
                                                <TableHead className="w-[11%] font-semibold">
                                                    Unit
                                                </TableHead>
                                                <TableHead className="w-[5%] font-semibold">
                                                    Status
                                                </TableHead>
                                                <TableHead className="w-[4%] text-right font-semibold">
                                                    Aksi
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.data.map((pengguna) => (
                                                <TableRow
                                                    key={pengguna.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <TableCell className="p-3">
                                                        <span
                                                            className="block truncate font-medium text-foreground"
                                                            title={
                                                                pengguna.name
                                                            }
                                                        >
                                                            {pengguna.name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        <span
                                                            className="block truncate font-mono text-xs text-muted-foreground"
                                                            title={
                                                                pengguna.username ??
                                                                ''
                                                            }
                                                        >
                                                            {pengguna.username ||
                                                                '—'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        <span
                                                            className="block truncate text-xs text-muted-foreground"
                                                            title={
                                                                pengguna.email
                                                            }
                                                        >
                                                            {pengguna.email}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        <span
                                                            className="block truncate font-mono text-xs text-muted-foreground"
                                                            title={
                                                                pengguna.nip ??
                                                                ''
                                                            }
                                                        >
                                                            {pengguna.nip ||
                                                                '—'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        <span
                                                            className="block truncate font-mono text-xs text-muted-foreground"
                                                            title={
                                                                pengguna.nik ??
                                                                ''
                                                            }
                                                        >
                                                            {pengguna.nik ||
                                                                '—'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="p-3">
                                                        <span
                                                            className="block truncate text-xs"
                                                            title={pengguna.roles.join(
                                                                ', ',
                                                            )}
                                                        >
                                                            {pengguna.roles.join(
                                                                ', ',
                                                            ) || '—'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="overflow-hidden p-3 text-xs">
                                                        {renderUnitOrganisasi(
                                                            pengguna.unit_organisasi,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            variant={statusVariant(
                                                                pengguna.status,
                                                            )}
                                                            className="w-fit"
                                                        >
                                                            {statusLabel(
                                                                pengguna.status,
                                                            )}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <span className="sr-only">
                                                                        Menu
                                                                        aksi
                                                                    </span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-40"
                                                            >
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        setDetailPengguna(
                                                                            pengguna,
                                                                        )
                                                                    }
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    Detail
                                                                </DropdownMenuItem>
                                                                <Can permission="user.update">
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                pengguna,
                                                                            )
                                                                        }
                                                                        className="flex cursor-pointer items-center gap-2"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                </Can>
                                                                <Can permission="user.delete">
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setDeletePengguna(
                                                                                pengguna,
                                                                            );
                                                                        }}
                                                                        className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Hapus
                                                                    </DropdownMenuItem>
                                                                </Can>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <DataTablePagination
                                    data={users}
                                    itemName="pengguna"
                                />
                            </>
                        )}
                    </div>
                </ContentCard>
            </PageContainer>

            <PenggunaFormDialog
                open={formOpen}
                mode={formMode}
                pengguna={selectedPengguna}
                roles={roles}
                unitOrganisasis={unit_organisasis}
                jabatans={jabatans}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                pengguna={detailPengguna}
                onOpenChange={(open) => !open && setDetailPengguna(null)}
            />
            <ConfirmDialog
                isOpen={deletePengguna !== null}
                onClose={() => {
                    setDeletePengguna(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Pengguna"
                description={`Hapus pengguna "${deletePengguna?.name || ''}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Hapus"
                loading={deleting}
                destructive
            />
        </RouteGuard>
    );
}
