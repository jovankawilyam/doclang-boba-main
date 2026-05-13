import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock3,
    FileCheck2,
    FileText,
    Inbox,
    Server,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface Statistics {
    kuitansi?: DocCategoryStats;
    kutipan_rl?: DocCategoryStats;
    validasi_pph?: DocCategoryStats;
}

interface Props {
    admins?: Admin[];
    stats?: DashboardStats;
    statistics?: Statistics;
    docStats?: DocCategoryStats;
    docStatsKutipan?: DocCategoryStats;
    docStatsValidasi?: DocCategoryStats;
    todayDocumentTotal?: number;
}

const emptyStats: DocCategoryStats = {
    total: 0,
    siap_diambil: 0,
    proses: 0,
    selesai: 0,
    tidak_valid: 0,
};

const formatNumber = (value: number | undefined) =>
    new Intl.NumberFormat('id-ID').format(value ?? 0);

const percent = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

export default function Dashboard({
    admins = [],
    stats,
    statistics,
    docStats,
    docStatsKutipan,
    docStatsValidasi,
    todayDocumentTotal = 0,
}: Props) {
    const categories = [
        {
            key: 'kuitansi',
            label: 'Kuitansi',
            description: 'Kuitansi Pasca Lelang',
            stats: statistics?.kuitansi ?? docStats ?? emptyStats,
        },
        {
            key: 'kutipan_rl',
            label: 'Kutipan RL',
            description: 'Risalah Lelang',
            stats: statistics?.kutipan_rl ?? docStatsKutipan ?? emptyStats,
        },
        {
            key: 'validasi_pph',
            label: 'Validasi PPh',
            description: 'Validasi Pajak Penghasilan',
            stats: statistics?.validasi_pph ?? docStatsValidasi ?? emptyStats,
        },
    ];

    const totals = categories.reduce(
        (sum, item) => ({
            total: sum.total + item.stats.total,
            proses: sum.proses + item.stats.proses,
            siap_diambil: sum.siap_diambil + item.stats.siap_diambil,
            selesai: sum.selesai + item.stats.selesai,
            tidak_valid: sum.tidak_valid + item.stats.tidak_valid,
        }),
        { ...emptyStats },
    );

    const activeAdmins = admins.filter((admin) => admin.is_active).length;
    const completionRate = percent(totals.selesai, totals.total);
    const validRate = percent(totals.total - totals.tidak_valid, totals.total);

    const topCards = [
        {
            label: 'Total Dokumen Masuk',
            value: totals.total,
            helper: `${formatNumber(todayDocumentTotal)} dokumen masuk hari ini`,
            icon: FileText,
            tone: 'border-blue-200/30 bg-blue-400/20 text-blue-50',
        },
        {
            label: 'Dokumen Selesai',
            value: totals.selesai,
            helper: `${completionRate}% dari total dokumen`,
            icon: FileCheck2,
            tone: 'border-emerald-200/30 bg-emerald-400/20 text-emerald-50',
        },
        {
            label: 'Status Sistem',
            value: validRate,
            suffix: '%',
            helper: `${formatNumber(activeAdmins || stats?.total)} admin aktif`,
            icon: Server,
            tone: 'border-cyan-200/30 bg-cyan-400/20 text-cyan-50',
        },
    ];

    const statusCards = [
        {
            label: 'Proses',
            value: totals.proses,
            icon: Clock3,
            className: 'border-amber-300/30 bg-amber-500/20 text-amber-100',
        },
        {
            label: 'Siap Diambil',
            value: totals.siap_diambil,
            icon: Inbox,
            className: 'border-cyan-300/30 bg-cyan-500/20 text-cyan-100',
        },
        {
            label: 'Selesai',
            value: totals.selesai,
            icon: CheckCircle2,
            className:
                'border-emerald-300/30 bg-emerald-500/20 text-emerald-100',
        },
        {
            label: 'Tidak Valid',
            value: totals.tidak_valid,
            icon: XCircle,
            className: 'border-rose-300/30 bg-rose-500/20 text-rose-100',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />

            <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-semibold tracking-wide text-cyan-100 uppercase">
                            KPKNL Bogor
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                            Dashboard Doclang Boba
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-blue-100">
                            Ringkasan operasional dokumen pasca lelang untuk
                            pemantauan cepat saat admin masuk sistem.
                        </p>
                    </div>
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-cyan-50 shadow-xl backdrop-blur-xl">
                        <Activity className="h-4 w-4" />
                        Sinkron dari statistik agregat
                    </div>
                </header>

                <section className="grid gap-5 md:grid-cols-3">
                    {topCards.map((card) => (
                        <TopStatCard key={card.label} {...card} />
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
                    <GlassPanel title="Rincian Dokumen Per Kategori">
                        <div className="space-y-5">
                            {categories.map((category) => (
                                <CategoryRow
                                    key={category.key}
                                    category={category}
                                    totalDocuments={totals.total}
                                />
                            ))}
                        </div>
                    </GlassPanel>

                    <GlassPanel title="Distribusi Status Global">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {statusCards.map((status) => (
                                <StatusBox
                                    key={status.label}
                                    {...status}
                                    total={totals.total}
                                />
                            ))}
                        </div>
                    </GlassPanel>
                </section>
            </main>
        </AppLayout>
    );
}

function TopStatCard({
    label,
    value,
    suffix = '',
    helper,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    suffix?: string;
    helper: string;
    icon: typeof FileText;
    tone: string;
}) {
    return (
        <Card className="rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
            <CardContent className="flex items-start justify-between gap-5 p-6">
                <div>
                    <p className="text-sm font-medium text-blue-100">{label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                        {formatNumber(value)}
                        {suffix}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-50 backdrop-blur-lg">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {helper}
                    </p>
                </div>
                <div
                    className={`rounded-2xl border p-3 shadow-[0_0_24px_rgba(125,211,252,0.25)] ${tone}`}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    );
}

function GlassPanel({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function CategoryRow({
    category,
    totalDocuments,
}: {
    category: {
        label: string;
        description: string;
        stats: DocCategoryStats;
    };
    totalDocuments: number;
}) {
    const share = percent(category.stats.total, totalDocuments);

    return (
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-base font-semibold text-white">
                        {category.label}
                    </p>
                    <p className="text-sm font-medium text-blue-100">
                        {category.description}
                    </p>
                </div>
                <p className="text-2xl font-bold text-white">
                    {formatNumber(category.stats.total)}
                </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                    className="h-full rounded-full bg-cyan-200"
                    style={{ width: `${share}%` }}
                />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-medium text-blue-100">
                <MiniStat label="Proses" value={category.stats.proses} />
                <MiniStat label="Siap" value={category.stats.siap_diambil} />
                <MiniStat label="Selesai" value={category.stats.selesai} />
                <MiniStat label="Invalid" value={category.stats.tidak_valid} />
            </div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl bg-white/10 px-3 py-2">
            <p className="font-semibold text-white">{formatNumber(value)}</p>
            <p>{label}</p>
        </div>
    );
}

function StatusBox({
    label,
    value,
    icon: Icon,
    className,
    total,
}: {
    label: string;
    value: number;
    icon: typeof FileText;
    className: string;
    total: number;
}) {
    return (
        <div className={`rounded-2xl border p-5 ${className}`}>
            <div className="flex items-center justify-between">
                <Icon className="h-5 w-5" />
                <span className="text-xs font-semibold">
                    {percent(value, total)}%
                </span>
            </div>
            <p className="mt-5 text-3xl font-bold text-white">
                {formatNumber(value)}
            </p>
            <p className="mt-1 text-sm font-medium">{label}</p>
        </div>
    );
}
