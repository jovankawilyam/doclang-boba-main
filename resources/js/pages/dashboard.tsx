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
    tidak_valid: number;
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

const emptyDocStats: DocCategoryStats = {
    total: 0,
    siap_diambil: 0,
    proses: 0,
    selesai: 0,
    tidak_valid: 0,
};

const formatStat = (value: number | undefined) =>
    new Intl.NumberFormat('id-ID').format(value ?? 0);

export default function Dashboard({
    admins = [],
    stats,
    docStats,
    docStatsKutipan,
    docStatsValidasi,
}: Props) {
    const statCards = [
        {
            title: 'Super Admin',
            value: formatStat(stats?.super_admin),
            icon: Shield,
        },
        {
            title: 'Admin',
            value: formatStat(stats?.admin),
            icon: Users,
        },
        {
            title: 'Total User',
            value: formatStat(stats?.total),
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
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                {/* Grid Statistik User (Kecil/Ringkas) */}
                <div className="grid gap-4 md:grid-cols-3">
                    {statCards.map((stat, index) => (
                        <Card
                            key={index}
                            className="rounded-2xl border-slate-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/20">
                                    <stat.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {stat.title}
                                    </p>
                                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Grid Monitoring Dokumen (Utama & Besar) */}
                <div className="grid gap-6 md:grid-cols-3">
                    <DocumentStatCard
                        title="Kuitansi"
                        stats={docStats ?? emptyDocStats}
                        icon={FileText}
                    />
                    <DocumentStatCard
                        title="Kutipan RL"
                        stats={docStatsKutipan ?? emptyDocStats}
                        icon={FileText}
                    />
                    <DocumentStatCard
                        title="Validasi PPh"
                        stats={docStatsValidasi ?? emptyDocStats}
                        icon={FileText}
                    />
                </div>

                {/* Daftar Admin Aktif (Tabel Bersih) */}
                <Card className="rounded-3xl border-none bg-white shadow-sm transition-all hover:shadow-md dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 px-6 py-5 dark:border-slate-800/60">
                        <CardTitle className="flex items-center justify-between text-xl font-semibold text-slate-800 dark:text-slate-100">
                            Administrator Aktif
                            <Link href="/admin/create">
                                <Button
                                    size="sm"
                                    className="gap-2 rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Tambah Admin
                                </Button>
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 text-slate-500 dark:bg-slate-800/30 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">
                                            Nama
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {admins.map((admin) => (
                                        <tr
                                            key={admin.id}
                                            className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                {admin.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full border-slate-200 font-normal text-slate-600 dark:border-slate-700 dark:text-slate-300"
                                                >
                                                    {admin.role ===
                                                    'super_admin'
                                                        ? 'Super Admin'
                                                        : 'Admin'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {admin.is_active ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1.5 rounded-full border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1.5 rounded-full border-slate-200 bg-slate-100 px-2.5 py-0.5 text-slate-500 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                                    >
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
                                                        className="h-8 rounded-full px-4 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                                    >
                                                        Kelola
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-slate-500"
                                            >
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

function DocumentStatCard({
    title,
    stats,
    icon: Icon,
}: {
    title: string;
    stats: DocCategoryStats;
    icon: any;
}) {
    return (
        <Card className="flex flex-col overflow-hidden rounded-3xl border-slate-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 dark:border-slate-800 dark:bg-slate-800/30">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-6">
                <div className="flex flex-col items-center justify-center py-4">
                    <p className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                        Total
                    </p>
                    <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        {formatStat(stats.total)}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 py-4 dark:bg-blue-900/20">
                    <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Siap Diambil
                    </p>
                    <p className="text-5xl font-extrabold tracking-tight text-blue-600 dark:text-blue-500">
                        {formatStat(stats.siap_diambil)}
                    </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <div className="flex flex-col items-center text-center">
                        <p className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Proses
                        </p>
                        <p className="text-xl font-bold text-amber-500 dark:text-amber-400">
                            {formatStat(stats.proses)}
                        </p>
                    </div>
                    <div className="flex flex-col items-center border-l border-slate-100 text-center dark:border-slate-800">
                        <p className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Selesai
                        </p>
                        <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
                            {formatStat(stats.selesai)}
                        </p>
                    </div>
                    <div className="flex flex-col items-center border-l border-slate-100 text-center dark:border-slate-800">
                        <p className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Tidak Valid
                        </p>
                        <p className="text-xl font-bold text-red-500 dark:text-red-400">
                            {formatStat(stats.tidak_valid)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
