import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, FileText, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
        // Use the raw URL string here so the sidebar Link becomes a plain
        // anchor href and is reliably clickable inside the sidebar slot.
        href: dashboard.url(),
        icon: LayoutGrid,
    },
    {
        title: 'Kuitansi',
        href: '/documents/kuitansi',
        icon: FileText,
    },
    {
        title: 'Kutipan RL',
        href: '/documents/rl',
        icon: FileText,
    },

    {
        title: 'Validasi PPh',
        href: '/documents/validasi-pph',
        icon: FileText,
    },
    {
        title: 'Manajemen Admin',
        href: '/admin',
        icon: Users,
    },
   
    
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
