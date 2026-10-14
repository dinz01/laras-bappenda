import { Head, router, useForm } from '@inertiajs/react';
import {
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Can } from '@/components/Can';
import { ContentCard } from '@/components/Cards/content-card';
import { ConfirmDialog } from '@/components/Dialogs/confirm-dialog';
import InputError from '@/components/input-error';
import { PageContainer } from '@/components/Layout/page-container';
import { PageHeader } from '@/components/Layout/page-header';
import { RouteGuard } from '@/components/RouteGuard';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { destroy, index, store, update } from '@/routes/admin/role';

type Role = {
    id: number;
    name: string;
    guard_name: string;
    permissions: string[];
    users_count: number;
    permissions_count: number;
    created_at: string | null;
};

type Stats = {
    total: number;
    with_permissions: number;
    with_users: number;
};

type IndexProps = {
    roles: Role[];
    stats: Stats;
    permissions: string[];
};

type RoleFormData = {
    name: string;
    permissions: string[];
};

const emptyForm: RoleFormData = {
    name: '',
    permissions: [],
};

// Definisi Kategori Menu & Modul di dalamnya sesuai urutan sidebar
type MenuCategory = {
    id: string;
    label: string;
    modules: {
        id: string;
        label: string;
    }[];
};

const menuCategories: MenuCategory[] = [
    {
        id: 'utama',
        label: 'UTAMA',
        modules: [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'repositori-arsip', label: 'Repositori Arsip' },
            { id: 'arsip-inaktif', label: 'Arsip Inaktif' },
            { id: 'nasib-akhir-arsip', label: 'Nasib Akhir Arsip' },
        ],
    },
    {
        id: 'pengelolaan',
        label: 'PENGELOLAAN',
        modules: [
            { id: 'kelola-arsip', label: 'Kelola Arsip' },
            { id: 'verifikasi-arsip', label: 'Verifikasi Arsip' },
            { id: 'kelola-tte', label: 'Kelola TTE' },
            { id: 'peminjaman', label: 'Peminjaman Arsip' },
        ],
    },
    {
        id: 'master',
        label: 'MASTER DATA',
        modules: [
            { id: 'master-unit-organisasi', label: 'Unit Organisasi' },
            { id: 'master-jabatan', label: 'Jabatan' },
            { id: 'master-klasifikasi-arsip', label: 'Klasifikasi Arsip' },
            { id: 'master-lokasi-arsip', label: 'Lokasi Arsip' },
            { id: 'master-jenis-arsip', label: 'Jenis Arsip' },
            { id: 'master-kategori-arsip', label: 'Kategori Arsip' },
            { id: 'master-sifat-arsip', label: 'Sifat Arsip' },
            { id: 'master-tingkat-akses-arsip', label: 'Tingkat Akses Arsip' },
            {
                id: 'master-tingkat-perkembangan-arsip',
                label: 'Tingkat Perkembangan Arsip',
            },
            { id: 'master-kondisi-arsip', label: 'Kondisi Arsip' },
            { id: 'master-nasib-akhir', label: 'Nasib Akhir' },
        ],
    },
    {
        id: 'administrasi',
        label: 'ADMINISTRASI',
        modules: [
            { id: 'admin-pengguna', label: 'Pengguna' },
            { id: 'admin-role', label: 'Role' },
            { id: 'admin-permission', label: 'Permission' },
            { id: 'admin-audit-log', label: 'Log Audit' },
            { id: 'admin-recycle-bin', label: 'Riwayat Arsip Dihapus' },
        ],
    },
    {
        id: 'akses-dokumen',
        label: 'AKSES DOKUMEN',
        modules: [{ id: 'dokumen-arsip', label: 'Unduh Berkas Arsip' }],
    },
    {
        id: 'pengaturan',
        label: 'PENGATURAN & LAINNYA',
        modules: [{ id: 'profile', label: 'Profil Pengguna' }],
    },
];

// Mapping label modul lookup cepat
const moduleLabelMap: Record<string, string> = {};
menuCategories.forEach((cat) => {
    cat.modules.forEach((mod) => {
        moduleLabelMap[mod.id] = mod.label;
    });
});

// Label aksi (suffix setelah titik)
const actionLabels: Record<string, string> = {
    view: 'Lihat',
    create: 'Tambah',
    update: 'Ubah',
    delete: 'Hapus',
    restore: 'Pulihkan',
    'force-delete': 'Hapus Permanen',
    download: 'Unduh Berkas',
    verify: 'Verifikasi',
    reject: 'Tolak / Revisi',
    sign: 'Tanda Tangan Elektronik',
};

// Override label per permission spesifik
const permLabelOverrides: Record<string, string> = {
    'kelola-arsip.update': 'Edit',
    'verifikasi-arsip.update': 'Edit',
    'kelola-tte.update': 'Edit',
    'peminjaman.approve': 'Setujui / Tolak',
};

// Permission yang disembunyikan dari UI role (tetap ada di DB)
const HIDDEN_PERMS = new Set([
    'kelola-arsip.upload-file',
    'verifikasi-arsip.reject',
    'peminjaman.create',
    'peminjaman.reject',
    'peminjaman.return',
]);

function formatPermLabel(perm: string): string {
    if (permLabelOverrides[perm]) {
        return permLabelOverrides[perm];
    }

    const parts = perm.split('.');
    const action = parts[1] ?? perm;

    return actionLabels[action] ?? action;
}

function getModuleLabel(moduleId: string): string {
    return (
        moduleLabelMap[moduleId] ?? moduleId.replace(/-/g, ' ').toUpperCase()
    );
}

function RoleFormDialog({
    open,
    mode,
    role,
    permissions,
    onOpenChange,
}: {
    open: boolean;
    mode: 'create' | 'edit';
    role: Role | null;
    permissions: string[];
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<RoleFormData>(emptyForm);
    const [permSearch, setPermSearch] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setData(
            role
                ? { name: role.name, permissions: role.permissions }
                : emptyForm,
        );
        form.clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, role]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setPermSearch('');
        }

        onOpenChange(nextOpen);
    };

    const togglePermission = (perm: string) => {
        const current = form.data.permissions;
        form.setData(
            'permissions',
            current.includes(perm)
                ? current.filter((p) => p !== perm)
                : [...current, perm],
        );
    };

    const toggleGroup = (groupPerms: string[]) => {
        const current = form.data.permissions;
        const allSelected = groupPerms.every((p) => current.includes(p));

        if (allSelected) {
            form.setData(
                'permissions',
                current.filter((p) => !groupPerms.includes(p)),
            );
        } else {
            const next = Array.from(new Set([...current, ...groupPerms]));
            form.setData('permissions', next);
        }
    };

    const toggleCategory = (catPerms: string[]) => {
        const current = form.data.permissions;
        const allSelected = catPerms.every((p) => current.includes(p));

        if (allSelected) {
            form.setData(
                'permissions',
                current.filter((p) => !catPerms.includes(p)),
            );
        } else {
            const next = Array.from(new Set([...current, ...catPerms]));
            form.setData('permissions', next);
        }
    };

    const selectAll = () => {
        form.setData('permissions', [...permissions]);
    };

    const deselectAll = () => {
        form.setData('permissions', []);
    };

    const filteredPerms = permissions.filter(
        (p) =>
            p.toLowerCase().includes(permSearch.toLowerCase()) ||
            getModuleLabel(p.split('.')[0] ?? '')
                .toLowerCase()
                .includes(permSearch.toLowerCase()) ||
            formatPermLabel(p).toLowerCase().includes(permSearch.toLowerCase()),
    );

    // Group permissions by module id
    const permsByModule = filteredPerms.reduce<Record<string, string[]>>(
        (acc, perm) => {
            const group = perm.split('.')[0] ?? 'other';
            (acc[group] ??= []).push(perm);

            return acc;
        },
        {},
    );

    // Strukturkan per kategori menu
    const structuredCategories = menuCategories
        .map((cat) => {
            const modulesInCat = cat.modules
                .map((m) => ({
                    ...m,
                    perms: permsByModule[m.id] ?? [],
                }))
                .filter((m) => m.perms.length > 0);

            const allCatPerms = modulesInCat.flatMap((m) => m.perms);

            return {
                ...cat,
                modules: modulesInCat,
                allPerms: allCatPerms,
            };
        })
        .filter((cat) => cat.modules.length > 0);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.data.name.trim()) {
            toast.warning('Harap isi kolom "Nama Role" yang wajib diisi.');
            document.getElementById('role-name')?.focus();

            return;
        }

        if (mode === 'edit' && role) {
            form.put(update({ role: role.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setPermSearch('');
                    onOpenChange(false);
                },
                onError: () =>
                    toast.error('Terjadi kesalahan saat memperbarui role.', {
                        description: 'Periksa kembali data yang dimasukkan.',
                    }),
            });

            return;
        }

        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setPermSearch('');
                onOpenChange(false);
            },
            onError: () =>
                toast.error('Terjadi kesalahan saat menyimpan role.', {
                    description: 'Periksa kembali data yang dimasukkan.',
                }),
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col border-border/60 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create' ? 'Tambah Role' : 'Edit Role'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Tentukan nama dan hak akses fitur per kelompok menu
                        untuk role ini.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={submit}
                    noValidate
                    className="flex flex-1 flex-col space-y-4 overflow-hidden"
                >
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Nama Role</Label>
                        <Input
                            id="role-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="Contoh: Arsiparis"
                            maxLength={255}
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    {permissions.length > 0 && (
                        <div className="flex flex-1 flex-col space-y-2 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Hak Akses Menu (
                                    {form.data.permissions.length} dipilih)
                                </Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={selectAll}
                                    >
                                        Pilih Semua
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-muted-foreground"
                                        onClick={deselectAll}
                                    >
                                        Batal Semua
                                    </Button>
                                </div>
                            </div>

                            <Input
                                placeholder="Cari menu, modul, atau aksi..."
                                value={permSearch}
                                onChange={(e) => setPermSearch(e.target.value)}
                                className="h-8 text-sm"
                            />

                            <div className="max-h-[380px] flex-1 space-y-5 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-3.5">
                                {structuredCategories.map((category) => {
                                    const catSelectedCount =
                                        category.allPerms.filter((p) =>
                                            form.data.permissions.includes(p),
                                        ).length;
                                    const isAllCatSelected =
                                        catSelectedCount ===
                                        category.allPerms.length;

                                    return (
                                        <div
                                            key={category.id}
                                            className="space-y-2.5"
                                        >
                                            {/* Header Kategori Menu */}
                                            <div className="flex items-center justify-between border-b border-border/60 px-0.5 pb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold tracking-wider text-foreground">
                                                        {category.label}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            catSelectedCount > 0
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        className="h-4 px-1.5 text-[10px] font-normal"
                                                    >
                                                        {catSelectedCount}/
                                                        {
                                                            category.allPerms
                                                                .length
                                                        }
                                                    </Badge>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 px-1.5 text-[11px] font-medium text-primary hover:bg-primary/10 hover:text-primary"
                                                    onClick={() =>
                                                        toggleCategory(
                                                            category.allPerms,
                                                        )
                                                    }
                                                >
                                                    {isAllCatSelected
                                                        ? 'Kosongkan Kategori'
                                                        : 'Pilih Semua Kategori'}
                                                </Button>
                                            </div>

                                            {/* Modul-Modul di bawah Kategori */}
                                            <div className="grid gap-2 pl-1">
                                                {category.modules.map((mod) => {
                                                    const modSelectedCount =
                                                        mod.perms.filter((p) =>
                                                            form.data.permissions.includes(
                                                                p,
                                                            ),
                                                        ).length;
                                                    const isAllModSelected =
                                                        modSelectedCount ===
                                                        mod.perms.length;

                                                    return (
                                                        <div
                                                            key={mod.id}
                                                            className="space-y-2 rounded-lg border border-border/50 bg-background/90 p-2.5 shadow-2xs"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-medium text-foreground">
                                                                        {
                                                                            mod.label
                                                                        }
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        (
                                                                        {
                                                                            modSelectedCount
                                                                        }
                                                                        /
                                                                        {
                                                                            mod
                                                                                .perms
                                                                                .length
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-5 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                                                                    onClick={() =>
                                                                        toggleGroup(
                                                                            mod.perms,
                                                                        )
                                                                    }
                                                                >
                                                                    {isAllModSelected
                                                                        ? 'Batal'
                                                                        : 'Pilih Modul'}
                                                                </Button>
                                                            </div>

                                                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                                {mod.perms
                                                                    .filter(
                                                                        (
                                                                            perm,
                                                                        ) =>
                                                                            !HIDDEN_PERMS.has(
                                                                                perm,
                                                                            ),
                                                                    )
                                                                    .map(
                                                                        (
                                                                            perm,
                                                                        ) => {
                                                                            const isChecked =
                                                                                form.data.permissions.includes(
                                                                                    perm,
                                                                                );

                                                                            return (
                                                                                <button
                                                                                    key={
                                                                                        perm
                                                                                    }
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        togglePermission(
                                                                                            perm,
                                                                                        )
                                                                                    }
                                                                                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                                                                                        isChecked
                                                                                            ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                                                                                            : 'border-border/70 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground'
                                                                                    }`}
                                                                                >
                                                                                    <span>
                                                                                        {formatPermLabel(
                                                                                            perm,
                                                                                        )}
                                                                                    </span>
                                                                                </button>
                                                                            );
                                                                        },
                                                                    )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {structuredCategories.length === 0 && (
                                    <p className="py-6 text-center text-xs text-muted-foreground">
                                        Tidak ada kelompok menu atau permission
                                        yang cocok.
                                    </p>
                                )}
                            </div>
                            <InputError message={form.errors.permissions} />
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
    role,
    onOpenChange,
}: {
    role: Role | null;
    onOpenChange: (open: boolean) => void;
}) {
    if (!role) {
        return null;
    }

    const permsByModule = role.permissions.reduce<Record<string, string[]>>(
        (acc, perm) => {
            const group = perm.split('.')[0] ?? 'other';
            (acc[group] ??= []).push(perm);

            return acc;
        },
        {},
    );

    const structuredCategories = menuCategories
        .map((cat) => {
            const modulesInCat = cat.modules
                .map((m) => ({
                    ...m,
                    perms: permsByModule[m.id] ?? [],
                }))
                .filter((m) => m.perms.length > 0);

            return {
                ...cat,
                modules: modulesInCat,
            };
        })
        .filter((cat) => cat.modules.length > 0);

    return (
        <Dialog open={role !== null} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col border-border/60 sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Role
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi dan daftar hak akses per kelompok menu untuk
                        role ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                        <span className="text-muted-foreground">Nama Role</span>
                        <span className="font-semibold text-foreground">
                            {role.name}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                        <span className="text-muted-foreground">
                            Total Pengguna
                        </span>
                        <Badge variant="secondary">{role.users_count}</Badge>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                        <span className="text-muted-foreground">
                            Total Permission
                        </span>
                        <Badge variant="secondary">
                            {role.permissions_count}
                        </Badge>
                    </div>

                    {structuredCategories.length > 0 ? (
                        <div className="space-y-4 pt-1">
                            {structuredCategories.map((cat) => (
                                <div key={cat.id} className="space-y-2">
                                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        {cat.label}
                                    </p>
                                    <div className="grid gap-2 pl-1">
                                        {cat.modules.map((mod) => (
                                            <div
                                                key={mod.id}
                                                className="space-y-1.5 rounded-md border border-border/40 bg-muted/20 p-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {mod.label}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {mod.perms.length} aksi
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {mod.perms
                                                        .filter(
                                                            (perm) =>
                                                                !HIDDEN_PERMS.has(
                                                                    perm,
                                                                ),
                                                        )
                                                        .map((perm) => (
                                                            <Badge
                                                                key={perm}
                                                                variant="outline"
                                                                className="bg-background text-xs"
                                                                title={perm}
                                                            >
                                                                {formatPermLabel(
                                                                    perm,
                                                                )}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                            Role ini belum memiliki hak akses permission apapun.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StatValue({ value }: { value: number }) {
    return (
        <div className="text-2xl font-semibold tracking-normal text-foreground">
            {value.toLocaleString('id-ID')}
        </div>
    );
}

export default function RoleIndex({ roles, stats, permissions }: IndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [detailRole, setDetailRole] = useState<Role | null>(null);
    const [deleteRole, setDeleteRole] = useState<Role | null>(null);
    const [deleting, setDeleting] = useState(false);

    const openCreateDialog = () => {
        setSelectedRole(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const openEditDialog = (role: Role) => {
        setSelectedRole(role);
        setFormMode('edit');
        setFormOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteRole) {
            return;
        }

        setDeleting(true);

        router.delete(destroy({ role: deleteRole.id }).url, {
            preserveScroll: true,
            onError: () => {
                toast.error('Role gagal dihapus.', {
                    description:
                        'Terjadi kesalahan atau role sedang digunakan.',
                });
            },
            onSuccess: () => {
                setDeleteRole(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <RouteGuard permission="admin-role.view">
            <Head title="Role" />

            <PageContainer>
                <PageHeader
                    title="Role"
                    description="Manajemen peran pengguna dan hak akses sistem."
                    breadcrumb={[
                        { title: 'ADMINISTRASI' },
                        { title: 'Role', href: index.url() },
                    ]}
                    actions={
                        <Can permission="admin-role.create">
                            <Button size="sm" onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Role
                            </Button>
                        </Can>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <ContentCard title="Total Role">
                        <StatValue value={stats.total} />
                    </ContentCard>
                    <ContentCard title="Memiliki Permission">
                        <StatValue value={stats.with_permissions} />
                    </ContentCard>
                    <ContentCard title="Memiliki Pengguna">
                        <StatValue value={stats.with_users} />
                    </ContentCard>
                </div>

                <ContentCard
                    title="Daftar Role"
                    description="Seluruh role yang tersedia di sistem"
                >
                    {roles.length === 0 ? (
                        <EmptyTable
                            title="Belum ada role"
                            description="Tambahkan role pertama untuk memulai."
                            icon={ShieldCheck}
                        />
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-border/60">
                            <Table className="min-w-[650px]">
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead className="font-semibold">
                                            Nama Role
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            Permission
                                        </TableHead>
                                        <TableHead className="w-[120px] font-semibold">
                                            Pengguna
                                        </TableHead>
                                        <TableHead className="w-[170px] font-semibold">
                                            Dibuat Pada
                                        </TableHead>
                                        <TableHead className="w-[80px] text-right font-semibold">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow
                                            key={role.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="font-medium">
                                                {role.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions_count ===
                                                    0 ? (
                                                        <span className="text-xs text-muted-foreground">
                                                            —
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {role.permissions
                                                                .slice(0, 3)
                                                                .map((p) => (
                                                                    <Badge
                                                                        key={p}
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                        title={
                                                                            p
                                                                        }
                                                                    >
                                                                        {getModuleLabel(
                                                                            p.split(
                                                                                '.',
                                                                            )[0] ??
                                                                                p,
                                                                        )}{' '}
                                                                        ·{' '}
                                                                        {formatPermLabel(
                                                                            p,
                                                                        )}
                                                                    </Badge>
                                                                ))}
                                                            {role.permissions_count >
                                                                3 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    +
                                                                    {role.permissions_count -
                                                                        3}{' '}
                                                                    lainnya
                                                                </Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {role.users_count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {role.created_at || '—'}
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
                                                                setDetailRole(
                                                                    role,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Detail
                                                        </DropdownMenuItem>
                                                        <Can permission="admin-role.update">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        role,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center gap-2"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </Can>
                                                        <Can permission="admin-role.delete">
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setDeleteRole(
                                                                        role,
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
                    )}
                </ContentCard>
            </PageContainer>

            <RoleFormDialog
                open={formOpen}
                mode={formMode}
                role={selectedRole}
                permissions={permissions}
                onOpenChange={setFormOpen}
            />
            <DetailDialog
                role={detailRole}
                onOpenChange={(open) => !open && setDetailRole(null)}
            />
            <ConfirmDialog
                isOpen={deleteRole !== null}
                onClose={() => {
                    setDeleteRole(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Role"
                description={`Hapus role "${deleteRole?.name || ''}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Hapus"
                loading={deleting}
                destructive
            />
        </RouteGuard>
    );
}
