import { Link } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    ClipboardCheck,
    FilePlus2,
    FileSignature,
    FolderArchive,
    LayoutDashboard,
    Settings2,
    ShieldCheck,
    Trash2,
    Workflow,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePermission } from '@/hooks/use-permission';
import { dashboard } from '@/routes';
import { index as auditLogIndex } from '@/routes/admin/audit-log';
import { index as penggunaIndex } from '@/routes/admin/pengguna';
import { index as permissionIndex } from '@/routes/admin/permission';
import { index as recycleBinIndex } from '@/routes/admin/recycle-bin';
import { index as roleIndex } from '@/routes/admin/role';
import { index as arsipIndex } from '@/routes/arsip';
import { index as arsipInaktifIndex } from '@/routes/arsip-inaktif';
import { index as kelolaArsipIndex } from '@/routes/kelola-arsip';
import { index as kelolaTteIndex } from '@/routes/kelola-tte';
import { index as jabatanIndex } from '@/routes/master/jabatan';
import { index as jenisArsipIndex } from '@/routes/master/jenis-arsip';
import { index as kategoriArsipIndex } from '@/routes/master/kategori-arsip';
import { index as klasifikasiArsipIndex } from '@/routes/master/klasifikasi-arsip';
import { index as kondisiArsipIndex } from '@/routes/master/kondisi-arsip';
import { index as lokasiArsipIndex } from '@/routes/master/lokasi-arsip';
import { index as nasibAkhirIndex } from '@/routes/master/nasib-akhir';
import { index as sifatArsipIndex } from '@/routes/master/sifat-arsip';
import { index as tingkatAksesArsipIndex } from '@/routes/master/tingkat-akses-arsip';
import { index as tingkatPerkembanganArsipIndex } from '@/routes/master/tingkat-perkembangan-arsip';
import { index as unitOrganisasiIndex } from '@/routes/master/unit-organisasi';
import { index as nasibAkhirArsipIndex } from '@/routes/nasib-akhir-arsip';
import { index as peminjamanIndex } from '@/routes/peminjaman';
import { index as verifikasiArsipIndex } from '@/routes/verifikasi-arsip';
import type { NavItem } from '@/types';

const utamaNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
        permission: 'dashboard.view',
    },
    {
        title: 'Repositori Arsip',
        href: arsipIndex.url(),
        permission: 'repositori-arsip.view',
    },
    {
        title: 'Arsip Inaktif',
        href: arsipInaktifIndex.url(),
        permission: 'arsip-inaktif.view',
    },
    {
        title: 'Nasib Akhir Arsip',
        href: nasibAkhirArsipIndex.url(),
        permission: 'nasib-akhir-arsip.view',
    },
];

const pengelolaanNavItems: NavItem[] = [
    {
        title: 'Kelola Arsip',
        href: kelolaArsipIndex.url(),
        permission: 'kelola-arsip.view',
    },
    {
        title: 'Verifikasi Arsip',
        href: verifikasiArsipIndex.url(),
        permission: 'verifikasi-arsip.view',
    },
    {
        title: 'Kelola TTE',
        href: kelolaTteIndex.url(),
        permission: 'kelola-tte.view',
    },
    {
        title: 'Peminjaman Arsip',
        href: peminjamanIndex.url(),
        permission: 'peminjaman.view',
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Unit Organisasi',
        href: unitOrganisasiIndex.url(),
        permission: 'master-unit-organisasi.view',
    },
    {
        title: 'Jabatan',
        href: jabatanIndex.url(),
        permission: 'master-jabatan.view',
    },
    {
        title: 'Klasifikasi Arsip',
        href: klasifikasiArsipIndex.url(),
        permission: 'master-klasifikasi-arsip.view',
    },
    {
        title: 'Lokasi Arsip',
        href: lokasiArsipIndex.url(),
        permission: 'master-lokasi-arsip.view',
    },
    {
        title: 'Jenis Arsip',
        href: jenisArsipIndex.url(),
        permission: 'master-jenis-arsip.view',
    },
    {
        title: 'Kategori Arsip',
        href: kategoriArsipIndex.url(),
        permission: 'master-kategori-arsip.view',
    },
    {
        title: 'Sifat Arsip',
        href: sifatArsipIndex.url(),
        permission: 'master-sifat-arsip.view',
    },
    {
        title: 'Tingkat Akses Arsip',
        href: tingkatAksesArsipIndex.url(),
        permission: 'master-tingkat-akses-arsip.view',
    },
    {
        title: 'Tingkat Perkembangan Arsip',
        href: tingkatPerkembanganArsipIndex.url(),
        permission: 'master-tingkat-perkembangan-arsip.view',
    },
    {
        title: 'Kondisi Arsip',
        href: kondisiArsipIndex.url(),
        permission: 'master-kondisi-arsip.view',
    },
    {
        title: 'Nasib Akhir',
        href: nasibAkhirIndex.url(),
        permission: 'master-nasib-akhir.view',
    },
];

const administrasiNavItems: NavItem[] = [
    {
        title: 'Pengguna',
        href: penggunaIndex.url(),
        permission: 'admin-pengguna.view',
    },
    {
        title: 'Role',
        href: roleIndex.url(),
        permission: 'admin-role.view',
    },
    {
        title: 'Permission',
        href: permissionIndex.url(),
        permission: 'admin-permission.view',
    },
    {
        title: 'Audit Log',
        href: auditLogIndex.url(),
        permission: 'admin-audit-log.view',
    },
    {
        title: 'Riwayat Arsip Dihapus',
        href: recycleBinIndex.url(),
        permission: 'admin-recycle-bin.view',
    },
];

export function AppSidebar() {
    const { state } = useSidebar();
    const { can } = usePermission();
    const { isCurrentUrl } = useCurrentUrl();
    const isCollapsed = state === 'collapsed';

    const minimizedItems = [
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
            permission: 'repositori-arsip.view',
        },
        {
            title: 'Arsip Inaktif',
            href: arsipInaktifIndex.url(),
            icon: FolderArchive,
            permission: 'arsip-inaktif.view',
        },
        {
            title: 'Nasib Akhir Arsip',
            href: nasibAkhirArsipIndex.url(),
            icon: Trash2,
            permission: 'nasib-akhir-arsip.view',
        },
        {
            title: 'Kelola Arsip',
            href: kelolaArsipIndex.url(),
            icon: FilePlus2,
            permission: 'kelola-arsip.view',
        },
        {
            title: 'Verifikasi Arsip',
            href: verifikasiArsipIndex.url(),
            icon: ClipboardCheck,
            permission: 'verifikasi-arsip.view',
        },
        {
            title: 'Kelola TTE',
            href: kelolaTteIndex.url(),
            icon: FileSignature,
            permission: 'kelola-tte.view',
        },
        {
            title: 'Peminjaman Arsip',
            href: peminjamanIndex.url(),
            icon: ArchiveRestore,
            permission: 'peminjaman.view',
        },
    ].filter((item) => !item.permission || can(item.permission));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="h-14 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            asChild
                        >
                            <Link href={dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isCollapsed ? (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarMenu>
                            {minimizedItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ) : (
                    <>
                        <NavMain
                            items={utamaNavItems}
                            label="Utama"
                            icon={LayoutDashboard}
                        />
                        <NavMain
                            items={pengelolaanNavItems}
                            label="Pengelolaan"
                            icon={Workflow}
                        />
                        <NavMain
                            items={masterNavItems}
                            label="Master Data"
                            icon={Settings2}
                            defaultOpen={false}
                        />
                        <NavMain
                            items={administrasiNavItems}
                            label="Administrasi"
                            icon={ShieldCheck}
                            defaultOpen={false}
                        />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
