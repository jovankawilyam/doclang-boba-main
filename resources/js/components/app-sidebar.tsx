import { Link, usePage } from '@inertiajs/react';
import {
    BookOpenText,
    FileText,
    LayoutGrid,
    Smartphone,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavMiddle } from '@/components/nav-middle';
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
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
        icon: LayoutGrid,
        children: [
            {
                title: 'WhatsApp Gateway',
                href: '/admin/whatsapp',
                icon: Smartphone,
            },
        ],
    },
];

const middleNavItems: NavItem[] = [
    {
        title: 'Kuitansi',
        href: '/documents/kuitansi',
        icon: FileText,
    },
    {
        title: 'Kutipan RL',
        href: '/documents/rl',
        icon: BookOpenText,
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
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const visibleMiddleNavItems = middleNavItems.filter(
        (item) => item.href !== '/admin' || auth.user.role === 'super_admin',
    );

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
                <NavMiddle items={visibleMiddleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
