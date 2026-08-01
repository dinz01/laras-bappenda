import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Archive,
    ArchiveRestore,
    BookOpen,
    Building2,
    ClipboardCheck,
    ClipboardList,
    FileKey2,
    FilePlus2,
    FileSignature,
    FileStack,
    Key,
    Layers,
    FileText,
    Flag,
    FolderOpen,
    LayoutDashboard,
    Lock,
    MapPin,
    ScrollText,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as auditLogIndex } from '@/routes/admin/audit-log';
import { index as penggunaIndex } from '@/routes/admin/pengguna';
import { index as permissionIndex } from '@/routes/admin/permission';
import { index as recycleBinIndex } from '@/routes/admin/recycle-bin';
import { index as roleIndex } from '@/routes/admin/role';
import { index as arsipIndex } from '@/routes/arsip';
import { index as kelolaArsipIndex } from '@/routes/kelola-arsip';
import { index as kelolaTteIndex } from '@/routes/kelola-tte';
import { index as verifikasiArsipIndex } from '@/routes/verifikasi-arsip';
import { index as jabatanIndex } from '@/routes/master/jabatan';
import { index as jenisArsipIndex } from '@/routes/master/jenis-arsip';
import { index as klasifikasiArsipIndex } from '@/routes/master/klasifikasi-arsip';
import { index as kondisiArsipIndex } from '@/routes/master/kondisi-arsip';
import { index as lokasiArsipIndex } from '@/routes/master/lokasi-arsip';
import { index as mediaArsipIndex } from '@/routes/master/media-arsip';
import { index as metodePenyusutanArsipIndex } from '@/routes/master/metode-penyusutan-arsip';
import { index as retensiArsipIndex } from '@/routes/master/retensi-arsip';
import { index as sifatArsipIndex } from '@/routes/master/sifat-arsip';
import { index as statusArsipIndex } from '@/routes/master/status-arsip';
import { index as tingkatAksesArsipIndex } from '@/routes/master/tingkat-akses-arsip';
import { index as tingkatPerkembanganArsipIndex } from '@/routes/master/tingkat-perkembangan-arsip';
import { index as unitOrganisasiIndex } from '@/routes/master/unit-organisasi';
import { index as pemusnahanIndex } from '@/routes/pemusnahan';
import { index as permohonanIndex } from '@/routes/permohonan';
import { index as recordCenterIndex } from '@/routes/record-center';
import type { NavItem } from '@/types';

const utamaNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
        icon: LayoutDashboard,
        permission: 'dashboard.view',
    },
    {
        title: 'Repositori Arsip',
        href: arsipIndex.url(),
        icon: Archive,
        permission: 'arsip.view',
    },
    {
        title: 'Kelola Arsip',
        href: kelolaArsipIndex.url(),
        icon: FilePlus2,
        permission: 'arsip.create',
    },
    {
        title: 'Verifikasi Arsip',
        href: verifikasiArsipIndex.url(),
        icon: ClipboardCheck,
        permission: 'workflow.approve',
    },
    {
        title: 'Kelola TTE',
        href: kelolaTteIndex.url(),
        icon: FileSignature,
        permission: 'workflow.tte',
    },
];

const pengelolaanNavItems: NavItem[] = [
    {
        title: 'Record Center',
        href: recordCenterIndex.url(),
        icon: FileStack,
        permission: 'arsip.view',
    },
    {
        title: 'Retensi Arsip',
        href: retensiArsipIndex.url(),
        icon: BookOpen,
        permission: 'master.view',
    },
    {
        title: 'Pemusnahan',
        href: pemusnahanIndex.url(),
        icon: Trash2,
        permission: 'arsip.delete',
    },
    {
        title: 'Permohonan',
        href: permohonanIndex.url(),
        icon: ArchiveRestore,
        permission: 'workflow.view',
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Unit Organisasi',
        href: unitOrganisasiIndex.url(),
        icon: Building2,
        permission: 'master.view',
    },
    {
        title: 'Jabatan',
        href: jabatanIndex.url(),
        icon: UserCog,
        permission: 'master.view',
    },
    {
        title: 'Klasifikasi Arsip',
        href: klasifikasiArsipIndex.url(),
        icon: FolderOpen,
        permission: 'master.view',
    },
    {
        title: 'Lokasi Arsip',
        href: lokasiArsipIndex.url(),
        icon: MapPin,
        permission: 'master.view',
    },
    {
        title: 'Jenis Arsip',
        href: jenisArsipIndex.url(),
        icon: FileText,
        permission: 'master.view',
    },
    {
        title: 'Media Arsip',
        href: mediaArsipIndex.url(),
        icon: ScrollText,
        permission: 'master.view',
    },
    {
        title: 'Sifat Arsip',
        href: sifatArsipIndex.url(),
        icon: Lock,
        permission: 'master.view',
    },
    {
        title: 'Status Arsip',
        href: statusArsipIndex.url(),
        icon: Flag,
        permission: 'master.view',
    },
    {
        title: 'Tingkat Akses Arsip',
        href: tingkatAksesArsipIndex.url(),
        icon: Key,
        permission: 'master.view',
    },
    {
        title: 'Tingkat Perkembangan Arsip',
        href: tingkatPerkembanganArsipIndex.url(),
        icon: Layers,
        permission: 'master.view',
    },
    {
        title: 'Kondisi Arsip',
        href: kondisiArsipIndex.url(),
        icon: Activity,
        permission: 'master.view',
    },
    {
        title: 'Metode Penyusutan Arsip',
        href: metodePenyusutanArsipIndex.url(),
        icon: FileText,
        permission: 'master.view',
    },
];

const administrasiNavItems: NavItem[] = [
    {
        title: 'Pengguna',
        href: penggunaIndex.url(),
        icon: Users,
        permission: 'user.view',
    },
    {
        title: 'Role',
        href: roleIndex.url(),
        icon: ShieldCheck,
        permission: 'role.view',
    },
    {
        title: 'Permission',
        href: permissionIndex.url(),
        icon: FileKey2,
        permission: 'permission.view',
    },
    {
        title: 'Audit Log',
        href: auditLogIndex.url(),
        icon: ClipboardList,
        permission: 'auditlog.view',
    },
    {
        title: 'Riwayat Arsip Dihapus',
        href: recycleBinIndex.url(),
        icon: Trash2,
        permission: 'arsip.restore',
    },
];

export function AppSidebar() {
    const { auth } = usePage<{
        auth: { user: { roles?: string[] } | null };
    }>().props;
    const isOperatorUnit = auth.user?.roles?.includes('Operator Unit Pengolah') ?? false;

    const filteredUtamaNavItems = isOperatorUnit
        ? utamaNavItems.filter((item) => item.title !== 'Repositori Arsip')
        : utamaNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredUtamaNavItems} label="Utama" />
                <NavMain items={pengelolaanNavItems} label="Pengelolaan" />
                <NavMain items={masterNavItems} label="Master Data" />
                <NavMain items={administrasiNavItems} label="Administrasi" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
