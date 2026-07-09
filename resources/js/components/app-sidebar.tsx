import { Link } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    BookOpen,
    FileStack,
    LayoutDashboard,
    Trash2,
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
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Repositori Arsip',
        href: '#',
        icon: Archive,
    },
    {
        title: 'Record Center',
        href: '#',
        icon: FileStack,
    },
    {
        title: 'Retensi Arsip',
        href: '#',
        icon: BookOpen,
    },
    {
        title: 'Pemusnahan',
        href: '#',
        icon: Trash2,
    },
    {
        title: 'Permohonan',
        href: '#',
        icon: ArchiveRestore,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
