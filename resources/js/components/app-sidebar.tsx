import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Archive,
    ArchiveRestore,
    BookOpen,
    Building2,
    ClipboardList,
    FileKey2,
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
import { index as jabatanIndex } from '@/routes/master/jabatan';
import { index as jenisArsipIndex } from '@/routes/master/jenis-arsip';
import { index as klasifikasiArsipIndex } from '@/routes/master/klasifikasi-arsip';
import { index as kondisiArsipIndex } from '@/routes/master/kondisi-arsip';
import { index as lokasiArsipIndex } from '@/routes/master/lokasi-arsip';
import { index as mediaArsipIndex } from '@/routes/master/media-arsip';
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
    },
    {
        title: 'Repositori Arsip',
        href: arsipIndex.url(),
        icon: Archive,
    },
];

const pengelolaanNavItems: NavItem[] = [
    {
        title: 'Record Center',
        href: recordCenterIndex.url(),
        icon: FileStack,
    },
    {
        title: 'Retensi Arsip',
        href: retensiArsipIndex.url(),
        icon: BookOpen,
    },
    {
        title: 'Pemusnahan',
        href: pemusnahanIndex.url(),
        icon: Trash2,
    },
    {
        title: 'Permohonan',
        href: permohonanIndex.url(),
        icon: ArchiveRestore,
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Unit Organisasi',
        href: unitOrganisasiIndex.url(),
        icon: Building2,
    },
    {
        title: 'Jabatan',
        href: jabatanIndex.url(),
        icon: UserCog,
    },
    {
        title: 'Klasifikasi Arsip',
        href: klasifikasiArsipIndex.url(),
        icon: FolderOpen,
    },
    {
        title: 'Lokasi Arsip',
        href: lokasiArsipIndex.url(),
        icon: MapPin,
    },
    {
        title: 'Jenis Arsip',
        href: jenisArsipIndex.url(),
        icon: FileText,
    },
    {
        title: 'Media Arsip',
        href: mediaArsipIndex.url(),
        icon: ScrollText,
    },
    {
        title: 'Sifat Arsip',
        href: sifatArsipIndex.url(),
        icon: Lock,
    },
    {
        title: 'Status Arsip',
        href: statusArsipIndex.url(),
        icon: Flag,
    },
    {
        title: 'Tingkat Akses Arsip',
        href: tingkatAksesArsipIndex.url(),
        icon: Key,
    },
    {
        title: 'Tingkat Perkembangan Arsip',
        href: tingkatPerkembanganArsipIndex.url(),
        icon: Layers,
    },
    {
        title: 'Kondisi Arsip',
        href: kondisiArsipIndex.url(),
        icon: Activity,
    },
];

const administrasiNavItems: NavItem[] = [
    {
        title: 'Pengguna',
        href: penggunaIndex.url(),
        icon: Users,
    },
    {
        title: 'Role',
        href: roleIndex.url(),
        icon: ShieldCheck,
    },
    {
        title: 'Permission',
        href: permissionIndex.url(),
        icon: FileKey2,
    },
    {
        title: 'Audit Log',
        href: auditLogIndex.url(),
        icon: ClipboardList,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRoles = (auth?.user as { roles?: string[] } | null)?.roles ?? [];
    const isSuperAdmin = userRoles.includes('Super Administrator');

    const adminItems = [...administrasiNavItems];

    if (isSuperAdmin) {
        adminItems.push({
            title: 'Riwayat Arsip Dihapus',
            href: recycleBinIndex.url(),
            icon: Trash2,
        });
    }

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
                <NavMain items={utamaNavItems} label="Utama" />
                <NavMain items={pengelolaanNavItems} label="Pengelolaan" />
                <NavMain items={masterNavItems} label="Master Data" />
                <NavMain items={adminItems} label="Administrasi" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
