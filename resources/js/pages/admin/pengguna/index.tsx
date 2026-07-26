import { Head, Link, router, useForm } from '@inertiajs/react';
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
import { useEffect, useState } from 'react';
import { ContentCard } from '@/components/Cards/content-card';
import { StatusBadge } from '@/components/Common/status-badge';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import InputError from '@/components/input-error';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
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
import { dashboard } from '@/routes';
import {
    destroy,
    index,
    store,
    update,
} from '@/routes/admin/pengguna';

type Pengguna = {
    id: number;
    name: string;
    email: string;
    nip: string | null;
    status: 'active' | 'inactive';
    unit_organisasi: string | null;
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

type UnitOrganisasi = { id: number; nama: string };
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
    };
};

type PenggunaFormData = {
    name: string;
    email: string;
    password: string;
    unit_organisasi_id: string;
    jabatan_id: string;
    status: 'active' | 'inactive';
    roles: string[];
};

const emptyForm: PenggunaFormData = {
    name: '',
    email: '',
    password: '',
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

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            pengguna
                ? {
                      name: pengguna.name,
                      email: pengguna.email,
                      password: '',
                      unit_organisasi_id: '',
                      jabatan_id: '',
                      status: pengguna.status,
                      roles: pengguna.roles,
                  }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, pengguna]);

    const toggleRole = (role: string) => {
        const current = form.data.roles;
        form.setData(
            'roles',
            current.includes(role)
                ? current.filter((r) => r !== role)
                : [...current, role],
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && pengguna) {
            form.put(update({ pengguna: pengguna.id }).url, {
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
            });

            return;
        }

        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {mode === 'create'
                            ? 'Isi data pengguna baru.'
                            : 'Perbarui data pengguna. Kosongkan password jika tidak ingin mengubah.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
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
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value: PenggunaFormData['status']) =>
                                    form.setData('status', value)
                                }
                            >
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.status} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
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
                        <Label htmlFor="password">
                            {mode === 'edit'
                                ? 'Password Baru (kosongkan jika tidak diubah)'
                                : 'Password'}
                        </Label>
                        <Input
                            id="password"
                            type="password"
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
                        <div className="space-y-2">
                            <Label htmlFor="unit_organisasi_id">
                                Unit Organisasi
                            </Label>
                            <Select
                                value={form.data.unit_organisasi_id}
                                onValueChange={(v) =>
                                    form.setData('unit_organisasi_id', v)
                                }
                            >
                                <SelectTrigger id="unit_organisasi_id" className="w-full">
                                    <SelectValue placeholder="Pilih unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unitOrganisasis.map((u) => (
                                        <SelectItem
                                            key={u.id}
                                            value={String(u.id)}
                                        >
                                            {u.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.unit_organisasi_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jabatan_id">Jabatan</Label>
                            <Select
                                value={form.data.jabatan_id}
                                onValueChange={(v) =>
                                    form.setData('jabatan_id', v)
                                }
                            >
                                <SelectTrigger id="jabatan_id" className="w-full">
                                    <SelectValue placeholder="Pilih jabatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jabatans.map((j) => (
                                        <SelectItem
                                            key={j.id}
                                            value={String(j.id)}
                                        >
                                            {j.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.jabatan_id} />
                        </div>
                    </div>

                    {roles.length > 0 && (
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => toggleRole(role)}
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

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={form.processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
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
                        <DetailRow label="Email" value={pengguna.email} />
                        {pengguna.nip && (
                            <DetailRow label="NIP" value={pengguna.nip} mono />
                        )}
                        <DetailRow
                            label="Unit Organisasi"
                            value={pengguna.unit_organisasi || '-'}
                        />
                        <DetailRow
                            label="Jabatan"
                            value={pengguna.jabatan || '-'}
                        />
                        <DetailRow
                            label="Dibuat Pada"
                            value={pengguna.created_at || '-'}
                        />
                        <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
                            <span className="text-muted-foreground">Status</span>
                            <StatusBadge variant={statusVariant(pengguna.status)}>
                                {statusLabel(pengguna.status)}
                            </StatusBadge>
                        </div>
                        {pengguna.roles.length > 0 && (
                            <div className="flex items-start justify-between gap-4">
                                <span className="text-muted-foreground">Role</span>
                                <div className="flex flex-wrap justify-end gap-1">
                                    {pengguna.roles.map((r) => (
                                        <Badge key={r} variant="outline" className="text-xs">
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
    const [selectedPengguna, setSelectedPengguna] = useState<Pengguna | null>(null);
    const [detailPengguna, setDetailPengguna] = useState<Pengguna | null>(null);
    const [deletePengguna, setDeletePengguna] = useState<Pengguna | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
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
        setDeleteError(null);

        router.delete(destroy({ pengguna: deletePengguna.id }).url, {
            preserveScroll: true,
            onError: (errors) => {
                setDeleteError(errors.pengguna || 'Pengguna gagal dihapus.');
            },
            onSuccess: () => setDeletePengguna(null),
            onFinish: () => setDeleting(false),
        });
    };

    const hasFilters = Boolean(filters.search || filters.status || filters.role);

    return (
        <>
            <Head title="Pengguna" />

            <PageContainer>
                <PageHeader
                    title="Pengguna"
                    description="Manajemen akun pengguna sistem LARAS."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Pengguna', href: index.url() },
                    ]}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Pengguna
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <ContentCard title="Total Pengguna">
                        <StatValue value={stats.total} />
                    </ContentCard>
                    <ContentCard title="Aktif">
                        <StatValue value={stats.aktif} />
                    </ContentCard>
                    <ContentCard title="Nonaktif">
                        <StatValue value={stats.nonaktif} />
                    </ContentCard>
                    <ContentCard title="Ditambahkan Bulan Ini">
                        <StatValue value={stats.bulan_ini} />
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
                                hasFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Reset Filter
                                    </Button>
                                )
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
                                <div className="overflow-hidden rounded-md border border-border/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="font-semibold">
                                                    Nama
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Email
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Role
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Unit
                                                </TableHead>
                                                <TableHead className="w-[110px] font-semibold">
                                                    Status
                                                </TableHead>
                                                <TableHead className="w-[80px] text-right font-semibold">
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
                                                    <TableCell className="font-medium">
                                                        {pengguna.name}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {pengguna.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {pengguna.roles.length === 0 ? (
                                                                <span className="text-xs text-muted-foreground">
                                                                    —
                                                                </span>
                                                            ) : (
                                                                pengguna.roles.map(
                                                                    (r) => (
                                                                        <Badge
                                                                            key={r}
                                                                            variant="outline"
                                                                            className="text-xs"
                                                                        >
                                                                            {r}
                                                                        </Badge>
                                                                    ),
                                                                )
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {pengguna.unit_organisasi ||
                                                            '—'}
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
                                                                        Menu aksi
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
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setDeleteError(
                                                                            null,
                                                                        );
                                                                        setDeletePengguna(
                                                                            pengguna,
                                                                        );
                                                                    }}
                                                                    className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Menampilkan {users.from || 0} hingga{' '}
                                        {users.to || 0} dari {users.total}{' '}
                                        pengguna
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!users.prev_page_url}
                                            asChild={Boolean(
                                                users.prev_page_url,
                                            )}
                                        >
                                            {users.prev_page_url ? (
                                                <Link
                                                    href={users.prev_page_url}
                                                    preserveState
                                                >
                                                    Sebelumnya
                                                </Link>
                                            ) : (
                                                <span>Sebelumnya</span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!users.next_page_url}
                                            asChild={Boolean(
                                                users.next_page_url,
                                            )}
                                        >
                                            {users.next_page_url ? (
                                                <Link
                                                    href={users.next_page_url}
                                                    preserveState
                                                >
                                                    Selanjutnya
                                                </Link>
                                            ) : (
                                                <span>Selanjutnya</span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
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
                    setDeleteError(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Pengguna"
                description={
                    deleteError ||
                    `Hapus pengguna "${deletePengguna?.name || ''}"? Tindakan ini tidak dapat dibatalkan.`
                }
                confirmLabel="Hapus"
                loading={deleting}
                destructive
            />
        </>
    );
}
