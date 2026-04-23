import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Shield,
    UserPlus,
    FileText,
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
        },
        {
            title: 'Admin',
            value: String(stats?.admin ?? 0),
            icon: Users,
        },
        {
            title: 'Total User',
            value: String(stats?.total ?? 0),
            icon: Activity,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />
            <div className="flex h-full flex-col gap-8 p-4 md:p-8">
                
                {/* Header dengan Sapaan & Tanggal */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Grid Statistik User (Kecil/Ringkas) */}
                <div className="grid gap-4 md:grid-cols-3">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="rounded-2xl shadow-sm transition-all hover:shadow-md border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/20">
                                    <stat.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                                    <p className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Grid Monitoring Dokumen (Utama & Besar) */}
                <div className="grid gap-6 md:grid-cols-3">
                    <DocumentStatCard title="Kuitansi" stats={docStats} icon={FileText} />
                    <DocumentStatCard title="Kutipan RL" stats={docStatsKutipan ?? { total: 0, siap_diambil: 0, proses: 0, selesai: 0 }} icon={FileText} />
                    <DocumentStatCard title="Validasi PPh" stats={docStatsValidasi ?? { total: 0, siap_diambil: 0, proses: 0, selesai: 0 }} icon={FileText} />
                </div>

                {/* Daftar Admin Aktif (Tabel Bersih) */}
                <Card className="rounded-3xl border-none shadow-sm transition-all hover:shadow-md bg-white dark:bg-slate-900">
                    <CardHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
                        <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                            Administrator Aktif
                            <Link href="/admin/create">
                                <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Tambah Admin
                                </Button>
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Nama</th>
                                        <th className="px-6 py-4 font-medium">Role</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                {admin.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="rounded-full font-normal border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {admin.is_active ? (
                                                    <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 gap-1.5 px-2.5 py-0.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 gap-1.5 px-2.5 py-0.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                                        Nonaktif
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href="/admin">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-full px-4"
                                                    >
                                                        Kelola
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                                Tidak ada data admin.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function DocumentStatCard({ title, stats, icon: Icon }: { title: string, stats: DocCategoryStats, icon: any }) {
    return (
        <Card className="rounded-3xl shadow-sm transition-all hover:shadow-md border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col bg-white dark:bg-slate-900">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 pb-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Siap Diambil</p>
                    <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">
                        {stats.siap_diambil}
                    </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                    <div className="flex flex-col items-center text-center">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Proses</p>
                        <p className="text-xl font-bold text-amber-500 dark:text-amber-400">{stats.proses}</p>
                    </div>
                    <div className="flex flex-col items-center text-center border-l border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Selesai</p>
                        <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400">{stats.selesai}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
