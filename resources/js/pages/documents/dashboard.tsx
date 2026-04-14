import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Shield,
    UserPlus,
    FileText,
    TrendingUp,
    Calendar,
    Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];



interface Admin {
    id: number;
    name: string;
    role: string;
    is_active: boolean;
}

interface DocCategoryStats {
    total: number;
    siap_diambil: number;
    proses: number;
    selesai: number;
}

interface DashboardStats {
    super_admin: number;
    admin: number;
    total: number;
}

interface Props {
    admins?: Admin[];
    stats?: DashboardStats;
    docStats: DocCategoryStats;
    docStatsKutipan?: DocCategoryStats;
    docStatsValidasi?: DocCategoryStats;
}

export default function Dashboard({ admins = [], stats, docStats, docStatsKutipan, docStatsValidasi }: Props) {
    const statCards = [
        {
            title: 'Super Admin',
            value: String(stats?.super_admin ?? 0),
            icon: Shield,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            title: 'Admin',
            value: String(stats?.admin ?? 0),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            title: 'Total Admin',
            value: String(stats?.total ?? 0),
            icon: Activity,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Doclang Boba" />

            <div className="flex flex-col gap-6 p-6">

                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Selamat datang di Doclang Boba Management System
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {stat.title}
                                        </p>
                                        <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                                        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                                            <TrendingUp className="h-3 w-3" />
                                            <span>+12% dari bulan lalu</span>
                                        </div>
                                    </div>
                                    <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions & Admin List */}
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Tambah Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                <Link
                                    href="/admin/create"
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Tambah Admin</p>
                                            <p className="text-sm text-muted-foreground">Tambah data admin baru</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link
                                    href="/admin"
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Kelola Admin</p>
                                            <p className="text-sm text-muted-foreground">Lihat dan kelola semua admin</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Users className="h-4 w-4" />
                                    </Button>
                                    
                                </Link>
                                <Link
                                    href="/documents/kutipan-rl"
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Kelola Kutipan RL</p>
                                            <p className="text-sm text-muted-foreground">Lihat dan kelola Kutipan RL</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin List Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Daftar Admin
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="pb-2 font-medium">Nama</th>
                                            <th className="pb-2 font-medium">Role</th>
                                            <th className="pb-2 font-medium">Status</th>
                                            <th className="pb-2 font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((admin) => (
                                            <tr key={admin.id} className="border-b">
                                                <td className="py-3 text-sm font-medium">{admin.name}</td>
                                                <td className="py-3 text-sm">
                                                    <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                                                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-sm">
                                                    <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                                                        {admin.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3">
                                                    <Link href="/admin">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 gap-1"
                                                        >
                                                            <Users className="h-3 w-3" />
                                                            Kelola
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Document Stats Sections */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold tracking-tight">Monitoring Dokumen Pasca Lelang</h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Status Proses Keseluruhan */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <DocumentStatCard title="Status Dokumen" stats={docStats} icon={FileText} />
                        </div>
                        {/* Kutipan RL Stats */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <DocumentStatCard title="Status Kutipan RL" stats={docStatsKutipan ?? { total: 0, siap_diambil: 0, proses: 0, selesai: 0 }} icon={FileText} />
                        </div>
                        {/* Validasi PPh Stats */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <DocumentStatCard title="Status Validasi PPh" stats={docStatsValidasi ?? { total: 0, siap_diambil: 0, proses: 0, selesai: 0 }} icon={FileText} />
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

function DocumentStatCard({ title, stats, icon: Icon }: { title: string, stats: DocCategoryStats, icon: any }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Siap Diambil</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.siap_diambil}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground">Proses</p>
                        <p className="font-semibold text-amber-600">{stats.proses}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Selesai</p>
                        <p className="font-semibold text-green-600">{stats.selesai}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
