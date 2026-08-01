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
import { dashboard } from '@/routes';
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

// Label grup (resource prefix)
const groupLabels: Record<string, string> = {
    dashboard:  'Dashboard',
    profile:    'Profil',
    arsip:      'Arsip',
    dokumen:    'Dokumen',
    workflow:   'Alur Kerja',
    master:     'Data Master',
    user:       'Pengguna',
    role:       'Role',
    permission: 'Permission',
    auditlog:   'Log Audit',
};

// Label aksi (suffix setelah titik)
const actionLabels: Record<string, string> = {
    view:     'Lihat',
    create:   'Tambah',
    update:   'Ubah',
    delete:   'Hapus',
    restore:  'Pulihkan',
    upload:   'Unggah',
    download: 'Unduh',
    verify:   'Verifikasi',
    approve:  'Setujui',
    reject:   'Tolak',
};

function formatPermLabel(perm: string): string {
    const [, action] = perm.split('.');
    return actionLabels[action ?? ''] ?? action ?? perm;
}

function formatGroupLabel(group: string): string {
    return groupLabels[group] ?? group;
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

    const filteredPerms = permissions.filter((p) =>
        p.toLowerCase().includes(permSearch.toLowerCase()),
    );

    // Group permissions by prefix
    const grouped = filteredPerms.reduce<Record<string, string[]>>(
        (acc, perm) => {
            const group = perm.split('.')[0] ?? 'other';
            (acc[group] ??= []).push(perm);

            return acc;
        },
        {},
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'edit' && role) {
            form.put(update({ role: role.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    setPermSearch('');
                    onOpenChange(false);
                },
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
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="border-border/60 sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {mode === 'create' ? 'Tambah Role' : 'Edit Role'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Tentukan nama dan permission yang dimiliki role ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
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
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Permission</Label>
                                <span className="text-xs text-muted-foreground">
                                    {form.data.permissions.length} dipilih
                                </span>
                            </div>
                            <Input
                                placeholder="Cari permission..."
                                value={permSearch}
                                onChange={(e) => setPermSearch(e.target.value)}
                                className="h-8 text-sm"
                            />
                            <div className="max-h-60 space-y-3 overflow-y-auto rounded-md border border-border/60 p-3">
                                {Object.entries(grouped).map(
                                    ([group, perms]) => (
                                        <div key={group}>
                                            <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                {formatGroupLabel(group)}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {perms.map((perm) => (
                                                    <button
                                                        key={perm}
                                                        type="button"
                                                        onClick={() =>
                                                            togglePermission(
                                                                perm,
                                                            )
                                                        }
                                                        className={`rounded border px-2 py-0.5 text-xs transition-colors ${form.data.permissions.includes(
                                                            perm,
                                                        )
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {formatPermLabel(perm)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )}
                                {filteredPerms.length === 0 && (
                                    <p className="py-4 text-center text-xs text-muted-foreground">
                                        Tidak ada permission yang cocok.
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

    const grouped = role.permissions.reduce<Record<string, string[]>>(
        (acc, perm) => {
            const group = perm.split('.')[0] ?? 'other';
            (acc[group] ??= []).push(perm);

            return acc;
        },
        {},
    );

    return (
        <Dialog open={role !== null} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Detail Role
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Informasi dan permission yang dimiliki role ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <span className="text-muted-foreground">Nama</span>
                        <span className="font-semibold">{role.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <span className="text-muted-foreground">Pengguna</span>
                        <Badge variant="secondary">{role.users_count}</Badge>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <span className="text-muted-foreground">
                            Permission
                        </span>
                        <Badge variant="secondary">
                            {role.permissions_count}
                        </Badge>
                    </div>

                    {Object.keys(grouped).length > 0 && (
                        <div className="space-y-3">
                            {Object.entries(grouped).map(([group, perms]) => (
                                <div key={group}>
                                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        {formatGroupLabel(group)}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {perms.map((perm) => (
                                            <Badge
                                                key={perm}
                                                variant="outline"
                                                className="text-xs"
                                                title={perm}
                                            >
                                                {formatPermLabel(perm)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
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
    const [deleteError, setDeleteError] = useState<string | null>(null);
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
        setDeleteError(null);

        router.delete(destroy({ role: deleteRole.id }).url, {
            preserveScroll: true,
            onError: (errors) => {
                setDeleteError(errors.role || 'Role gagal dihapus.');
            },
            onSuccess: () => setDeleteRole(null),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <RouteGuard permission="role.view">
            <Head title="Role" />

            <PageContainer>
                <PageHeader
                    title="Role"
                    description="Manajemen peran pengguna dan hak akses sistem."
                    breadcrumb={[
                        { title: 'Dashboard', href: dashboard.url() },
                        { title: 'Administrasi', href: '#' },
                        { title: 'Role', href: index.url() },
                    ]}
                    actions={
                        <Can permission="role.create">
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
                        <div className="overflow-hidden rounded-md border border-border/60">
                            <Table>
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
                                                                        title={p}
                                                                    >
                                                                        {formatGroupLabel(p.split('.')[0] ?? p)}{' '}·{' '}{formatPermLabel(p)}
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
                                                        <Can permission="role.update">
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
                                                        <Can permission="role.delete">
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setDeleteError(
                                                                        null,
                                                                    );
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
                    setDeleteError(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Role"
                description={
                    deleteError ||
                    `Hapus role "${deleteRole?.name || ''}"? Tindakan ini tidak dapat dibatalkan.`
                }
                confirmLabel="Hapus"
                loading={deleting}
                destructive
            />
        </RouteGuard>
    );
}
