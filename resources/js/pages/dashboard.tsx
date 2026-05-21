import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    Clock3,
    FileCheck2,
    FileText,
    Inbox,
    ShieldCheck,
    Users,
    XCircle,
} from 'lucide-react';
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

interface Statistics {
    kuitansi?: DocCategoryStats;
    kutipan_rl?: DocCategoryStats;
    validasi_pph?: DocCategoryStats;
}

interface RecentDocument {
    id: number;
    id_pengajuan: string;
    kode_lot_lelang: string;
    nama_pemohon: string;
    jenis_layanan: 'kuitansi' | 'risalah_lelang' | 'validasi_pph';
    status_proses: StatusKey;
    created_at: string | null;
    tanggal_masuk_pengambilan_dokumen: string | null;
}

interface Props {
    admins?: Admin[];
    stats?: DashboardStats;
    statistics?: Statistics;
    docStats?: DocCategoryStats;
    docStatsKutipan?: DocCategoryStats;
    docStatsValidasi?: DocCategoryStats;
    todayDocumentTotal?: number;
    recentDocuments?: RecentDocument[];
}

type StatusKey = 'proses' | 'siap_diambil' | 'selesai' | 'tidak_valid';

const emptyStats: DocCategoryStats = {
    total: 0,
    siap_diambil: 0,
    proses: 0,
    selesai: 0,
    tidak_valid: 0,
};

const statusLabels: Record<StatusKey, string> = {
    proses: 'Proses',
    siap_diambil: 'Siap Diambil',
    selesai: 'Selesai',
    tidak_valid: 'Tidak Valid',
};

const serviceLabels: Record<RecentDocument['jenis_layanan'], string> = {
    kuitansi: 'Kuitansi',
    risalah_lelang: 'Kutipan RL',
    validasi_pph: 'Validasi PPh',
};

const formatNumber = (value: number | undefined) =>
    new Intl.NumberFormat('id-ID').format(value ?? 0);

const percent = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

const formatDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

const statusTone: Record<StatusKey, string> = {
    proses: 'border-amber-200 bg-amber-50 text-amber-800',
    siap_diambil: 'border-sky-200 bg-sky-50 text-sky-800',
    selesai: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    tidak_valid: 'border-rose-200 bg-rose-50 text-rose-800',
};

export default function Dashboard({
    admins = [],
    stats,
    statistics,
    docStats,
    docStatsKutipan,
    docStatsValidasi,
    todayDocumentTotal = 0,
    recentDocuments = [],
}: Props) {
    const categories = [
        {
            key: 'kuitansi',
            label: 'Kuitansi',
            href: '/documents/kuitansi',
            stats: statistics?.kuitansi ?? docStats ?? emptyStats,
        },
        {
            key: 'kutipan_rl',
            label: 'Kutipan RL',
            href: '/documents/rl',
            stats: statistics?.kutipan_rl ?? docStatsKutipan ?? emptyStats,
        },
        {
            key: 'validasi_pph',
            label: 'Validasi PPh',
            href: '/documents/validasi-pph',
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
    const pendingWork = totals.proses + totals.tidak_valid;

    const summaryCards = [
        {
            label: 'Dokumen Masuk',
            value: totals.total,
            helper: `${formatNumber(todayDocumentTotal)} masuk hari ini`,
            icon: FileText,
        },
        {
            label: 'Butuh Tindak Lanjut',
            value: pendingWork,
            helper: `${formatNumber(totals.proses)} proses, ${formatNumber(totals.tidak_valid)} tidak valid`,
            icon: ClipboardList,
        },
        {
            label: 'Siap Diambil',
            value: totals.siap_diambil,
            helper: 'Prioritas konfirmasi pengambilan',
            icon: Inbox,
        },
        {
            label: 'Selesai',
            value: totals.selesai,
            helper: `${completionRate}% dari total dokumen`,
            icon: FileCheck2,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />

            <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 text-slate-950 md:p-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                KPKNL Bogor
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                                Dashboard Operasional Doclang Boba
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Pantau antrean layanan, status dokumen, dan
                                aktivitas terbaru dari satu layar kerja.
                            </p>
                        </div>
                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <StatusSummary
                                icon={ShieldCheck}
                                label="Admin Aktif"
                                value={`${formatNumber(activeAdmins)} / ${formatNumber(stats?.total)}`}
                            />
                            <StatusSummary
                                icon={Users}
                                label="Super Admin"
                                value={formatNumber(stats?.super_admin)}
                            />
                        </div>
                    </header>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Card
                                    key={card.label}
                                    className="rounded-lg border-slate-200 bg-white shadow-sm"
                                >
                                    <CardContent className="flex items-start justify-between gap-4 p-5">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                {card.label}
                                            </p>
                                            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                                                {formatNumber(card.value)}
                                            </p>
                                            <p className="mt-2 text-xs font-medium text-slate-500">
                                                {card.helper}
                                            </p>
                                        </div>
                                        <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-slate-700">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-200 p-5">
                                <CardTitle className="text-base font-semibold text-slate-950">
                                    Ringkasan Layanan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {categories.map((category) => (
                                        <ServiceRow
                                            key={category.key}
                                            label={category.label}
                                            href={category.href}
                                            stats={category.stats}
                                            totalDocuments={totals.total}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-200 p-5">
                                <CardTitle className="text-base font-semibold text-slate-950">
                                    Distribusi Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
                                <StatusBox
                                    icon={Clock3}
                                    label="Proses"
                                    value={totals.proses}
                                    total={totals.total}
                                    tone="border-amber-200 bg-amber-50 text-amber-800"
                                />
                                <StatusBox
                                    icon={Inbox}
                                    label="Siap Diambil"
                                    value={totals.siap_diambil}
                                    total={totals.total}
                                    tone="border-sky-200 bg-sky-50 text-sky-800"
                                />
                                <StatusBox
                                    icon={CheckCircle2}
                                    label="Selesai"
                                    value={totals.selesai}
                                    total={totals.total}
                                    tone="border-emerald-200 bg-emerald-50 text-emerald-800"
                                />
                                <StatusBox
                                    icon={XCircle}
                                    label="Tidak Valid"
                                    value={totals.tidak_valid}
                                    total={totals.total}
                                    tone="border-rose-200 bg-rose-50 text-rose-800"
                                />
                            </CardContent>
                        </Card>
                    </section>

                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold text-slate-950">
                                    Aktivitas Terbaru
                                </CardTitle>
                                <p className="mt-1 text-sm text-slate-500">
                                    Enam permohonan terakhir yang masuk ke
                                    sistem.
                                </p>
                            </div>
                            {totals.tidak_valid > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    {formatNumber(totals.tidak_valid)} perlu
                                    koreksi
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-5 py-3">Nomor</th>
                                            <th className="px-5 py-3">
                                                Pemohon
                                            </th>
                                            <th className="px-5 py-3">
                                                Layanan
                                            </th>
                                            <th className="px-5 py-3">
                                                Tanggal
                                            </th>
                                            <th className="px-5 py-3">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentDocuments.length === 0 ? (
                                            <tr>
                                                <td
                                                    className="px-5 py-8 text-center text-slate-500"
                                                    colSpan={5}
                                                >
                                                    Belum ada aktivitas dokumen.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentDocuments.map((document) => (
                                                <tr
                                                    key={document.id}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4 font-semibold text-slate-950">
                                                        {document.id_pengajuan}
                                                        <div className="text-xs font-normal text-slate-500">
                                                            {
                                                                document.kode_lot_lelang
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-700">
                                                        {document.nama_pemohon}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-700">
                                                        {
                                                            serviceLabels[
                                                                document
                                                                    .jenis_layanan
                                                            ]
                                                        }
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        {formatDate(
                                                            document.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <StatusPill
                                                            status={
                                                                document.status_proses
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </AppLayout>
    );
}

function StatusSummary({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof ShieldCheck;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-44 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <Icon className="h-4 w-4 text-slate-600" />
            <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-950">{value}</p>
            </div>
        </div>
    );
}

function ServiceRow({
    label,
    href,
    stats,
    totalDocuments,
}: {
    label: string;
    href: string;
    stats: DocCategoryStats;
    totalDocuments: number;
}) {
    const share = percent(stats.total, totalDocuments);

    return (
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_220px_120px] lg:items-center">
            <div>
                <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">{label}</p>
                    <Link
                        href={href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950"
                    >
                        Buka
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-slate-700"
                        style={{ width: `${share}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                    {share}% dari total dokumen
                </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <MiniMetric label="Proses" value={stats.proses} />
                <MiniMetric label="Selesai" value={stats.selesai} />
                <MiniMetric label="Siap" value={stats.siap_diambil} />
                <MiniMetric label="Tidak Valid" value={stats.tidak_valid} />
            </div>
            <div className="text-left lg:text-right">
                <p className="text-2xl font-semibold text-slate-950">
                    {formatNumber(stats.total)}
                </p>
                <p className="text-xs text-slate-500">total</p>
            </div>
        </div>
    );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md bg-slate-50 px-3 py-2">
            <p className="font-semibold text-slate-950">
                {formatNumber(value)}
            </p>
            <p className="text-slate-500">{label}</p>
        </div>
    );
}

function StatusBox({
    icon: Icon,
    label,
    value,
    total,
    tone,
}: {
    icon: typeof Clock3;
    label: string;
    value: number;
    total: number;
    tone: string;
}) {
    return (
        <div className={`rounded-lg border p-4 ${tone}`}>
            <div className="flex items-center justify-between gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-xs font-semibold">
                    {percent(value, total)}%
                </span>
            </div>
            <p className="mt-3 text-2xl font-semibold">{formatNumber(value)}</p>
            <p className="text-sm font-medium">{label}</p>
        </div>
    );
}

function StatusPill({ status }: { status: StatusKey }) {
    return (
        <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusTone[status]}`}
        >
            {statusLabels[status]}
        </span>
    );
}
