import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePermission } from '@/hooks/use-permission';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    label = 'Platform',
    icon: GroupIcon,
    defaultOpen = true,
}: {
    items: NavItem[];
    label?: string;
    icon?: LucideIcon;
    defaultOpen?: boolean;
}) {
    const { can } = usePermission();
    const { isCurrentUrl } = useCurrentUrl();
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const visibleItems = items.filter(
        (item) => !item.permission || can(item.permission),
    );

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel
                asChild
                className="group/label flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase transition-colors select-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <button
                    type="button"
                    className="flex w-full items-center gap-2"
                >
                    {GroupIcon && (
                        <GroupIcon className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                            isOpen ? '' : '-rotate-90'
                        }`}
                    />
                </button>
            </SidebarGroupLabel>

            {isOpen && (
                <SidebarMenu>
                    {visibleItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                                className="pl-3"
                            >
                                <Link href={item.href} prefetch>
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            )}
        </SidebarGroup>
    );
}
