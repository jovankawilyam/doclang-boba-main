import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    FileText,
    Inbox,
    Search,
    XCircle,
} from 'lucide-react';
import {
    type FormEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard, login } from '@/routes';
import '@fortawesome/fontawesome-free/css/all.min.css';

type ServiceKey = 'kuitansi' | 'kutipan_rl' | 'validasi_pph';

interface DocumentItem {
    id: number;
    nomor_pengajuan: string;
    status_proses: 'proses' | 'siap_diambil' | 'selesai' | 'tidak_valid';
    catatan: string | null;
}

type ServiceStats = {
    total?: number;
    proses?: number;
    siap_diambil?: number;
    selesai?: number;
    tidak_valid?: number;
};

type Statistics = Partial<Record<ServiceKey, ServiceStats>>;

type WelcomeProps = {
    document: DocumentItem | null;
    search: string | null;
    document_rl: DocumentItem | null;
    search_rl: string | null;
    document_validasi: DocumentItem | null;
    search_validasi: string | null;
    statistics: Statistics;
};

type ServiceConfig = {
    key: ServiceKey;
    label: string;
    shortLabel: string;
    title: string;
    description: string;
    placeholder: string;
    accent: string;
    ring: string;
};

const services: ServiceConfig[] = [
    {
        key: 'kuitansi',
        label: 'Kuitansi',
        shortLabel: 'Kuitansi',
        title: 'Pelacakan Dokumen Kuitansi',
        description: 'Pantau status pengajuan kuitansi pasca lelang.',
        placeholder: 'Contoh: 123/KPHL/2026',
        accent: 'text-[#123C69] dark:text-blue-700',
        ring: 'border-[#C7D2E3] bg-[#F4F7FB] dark:border-slate-200 dark:bg-white',
    },
    {
        key: 'kutipan_rl',
        label: 'Kutipan RL',
        shortLabel: 'Kutipan RL',
        title: 'Pelacakan Kutipan Risalah Lelang',
        description: 'Cek progres penerbitan kutipan risalah lelang.',
        placeholder: 'Contoh: 123/K-RL/2026',
        accent: 'text-[#123C69] dark:text-blue-700',
        ring: 'border-[#C7D2E3] bg-[#F4F7FB] dark:border-slate-200 dark:bg-white',
    },
    {
        key: 'validasi_pph',
        label: 'Validasi PPh',
        shortLabel: 'Validasi PPh',
        title: 'Pelacakan Validasi PPh',
        description: 'Lihat status validasi PPh untuk dokumen lelang.',
        placeholder: 'Contoh: 123/V-PPh/2026',
        accent: 'text-[#123C69] dark:text-blue-700',
        ring: 'border-[#C7D2E3] bg-[#F4F7FB] dark:border-slate-200 dark:bg-white',
    },
];

const serviceByKey = services.reduce(
    (acc, service) => ({ ...acc, [service.key]: service }),
    {} as Record<ServiceKey, ServiceConfig>,
);

const formatStat = (value: number | undefined) =>
    new Intl.NumberFormat('id-ID').format(value ?? 0);

const getStatusStyles = (status: DocumentItem['status_proses'] | string) => {
    switch (status) {
        case 'selesai':
            return {
                badge: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-200 dark:bg-emerald-50 dark:text-emerald-800',
                icon: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
                label: 'Selesai',
            };
        case 'siap_diambil':
            return {
                badge: 'border-[#C7D2E3] bg-[#EEF3FA] text-[#123C69] dark:border-blue-200 dark:bg-blue-50 dark:text-blue-700',
                icon: <Inbox className="mr-1.5 h-4 w-4" />,
                label: 'Siap Diambil',
            };
        case 'tidak_valid':
            return {
                badge: 'border-red-200 bg-red-50 text-red-800 dark:border-red-200 dark:bg-red-50 dark:text-red-800',
                icon: <XCircle className="mr-1.5 h-4 w-4" />,
                label: 'Tidak Valid',
            };
        default:
            return {
                badge: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-200 dark:bg-amber-50 dark:text-amber-800',
                icon: <Clock className="mr-1.5 h-4 w-4" />,
                label: 'Dalam Proses',
            };
    }
};

function TrackingResult({
    document,
    searchedValue,
    service,
}: {
    document: DocumentItem | null;
    searchedValue: string | null;
    service: ServiceConfig;
}) {
    if (!searchedValue) {
        return null;
    }

    if (!document) {
        return (
            <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-[#C7D2E3] bg-white p-6 text-center shadow-xl shadow-[#C7D2E3]/50 dark:border-slate-200 dark:bg-white dark:shadow-slate-200/70">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FA] dark:bg-blue-50">
                    <Search className="h-8 w-8 text-[#123C69] dark:text-blue-700" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-950 dark:text-slate-950">
                    Dokumen Tidak Ditemukan
                </h3>
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-600">
                    Nomor{' '}
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-900">
                        {searchedValue}
                    </span>{' '}
                    belum terdaftar pada layanan {service.label}. Periksa lagi
                    nomor tiket atau pilih jenis layanan yang sesuai.
                </p>
            </div>
        );
    }

    const statusStyle = getStatusStyles(document.status_proses);

    return (
        <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-2xl border border-[#C7D2E3] bg-white shadow-xl shadow-[#C7D2E3]/50 dark:border-slate-200 dark:bg-white dark:shadow-slate-200/70">
            <div className="flex flex-col gap-4 border-b border-[#D8E0EC] p-6 sm:flex-row sm:items-center dark:border-slate-200">
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${service.ring}`}
                >
                    <FileText className={`h-7 w-7 ${service.accent}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold tracking-widest text-slate-500 uppercase dark:text-slate-500">
                        Hasil Pencarian {service.label}
                    </p>
                    <h2 className="mt-1 font-mono text-2xl font-black break-words text-slate-950 sm:text-3xl dark:text-slate-950">
                        {document.nomor_pengajuan}
                    </h2>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                    <thead className="border-b border-[#D8E0EC] bg-[#F4F7FB] dark:border-slate-200 dark:bg-[#F4F7FB]">
                        <tr>
                            <th className="px-6 py-5 font-bold text-slate-700 dark:text-slate-700">
                                Jenis Dokumen
                            </th>
                            <th className="px-6 py-5 font-bold text-slate-700 dark:text-slate-700">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8E0EC] dark:divide-slate-200">
                        <tr className="transition-colors hover:bg-[#F4F7FB] dark:hover:bg-[#F4F7FB]">
                            <td className="px-6 py-5 font-semibold text-slate-900 dark:text-slate-900">
                                Status Proses Dokumen
                            </td>
                            <td className="px-6 py-5">
                                <span
                                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold ${statusStyle.badge}`}
                                >
                                    {statusStyle.icon}
                                    {statusStyle.label}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {document.catatan && (
                <div className="border-t border-[#D8E0EC] bg-[#F4F7FB] p-5 dark:border-slate-200 dark:bg-[#F4F7FB]">
                    <p className="mb-1 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-500">
                        Catatan Petugas
                    </p>
                    <p className="text-base leading-relaxed text-slate-700 italic dark:text-slate-700">
                        "{document.catatan}"
                    </p>
                </div>
            )}
        </div>
    );
}

export default function Welcome({
    document,
    search,
    document_rl,
    search_rl,
    document_validasi,
    search_validasi,
    statistics,
}: WelcomeProps) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    const [showNav, setShowNav] = useState(true);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(0);
    const [processing, setProcessing] = useState(false);
    const lastScrollYRef = useRef(0);

    const initialService = useMemo<ServiceKey>(() => {
        if (search_rl) return 'kutipan_rl';
        if (search_validasi) return 'validasi_pph';
        return 'kuitansi';
    }, [search_rl, search_validasi]);

    const [activeService, setActiveService] =
        useState<ServiceKey>(initialService);
    const [query, setQuery] = useState(() => {
        if (initialService === 'kutipan_rl') return search_rl ?? '';
        if (initialService === 'validasi_pph') return search_validasi ?? '';
        return search ?? '';
    });

    const images = useMemo(
        () => [
            '/images/profile-1.png',
            '/images/profile-2.png',
            '/images/profile-3.png',
            '/images/profile-4.jpeg',
        ],
        [],
    );

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrent((previous) => (previous + 1) % images.length);
        }, 4000);

        return () => window.clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setShowNav(
                !(
                    currentScrollY > lastScrollYRef.current &&
                    currentScrollY > 100
                ),
            );
            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const activeConfig = serviceByKey[activeService];
    const activeStats = statistics?.[activeService] ?? {};
    const activeDocument =
        activeService === 'kutipan_rl'
            ? document_rl
            : activeService === 'validasi_pph'
              ? document_validasi
              : document;
    const activeSearch =
        activeService === 'kutipan_rl'
            ? search_rl
            : activeService === 'validasi_pph'
              ? search_validasi
              : search;

    const statCards = [
        {
            label: 'Proses',
            value: activeStats.proses,
            icon: Clock,
            className:
                'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-200 dark:bg-amber-50 dark:text-amber-800',
        },
        {
            label: 'Siap',
            value: activeStats.siap_diambil,
            icon: Inbox,
            className:
                'border-[#C7D2E3] bg-[#EEF3FA] text-[#123C69] dark:border-blue-200 dark:bg-blue-50 dark:text-blue-700',
        },
        {
            label: 'Selesai',
            value: activeStats.selesai,
            icon: CheckCircle2,
            className:
                'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-200 dark:bg-emerald-50 dark:text-emerald-800',
        },
        {
            label: 'Tidak Valid',
            value: activeStats.tidak_valid,
            icon: XCircle,
            className:
                'border-red-200 bg-red-50 text-red-800 dark:border-red-200 dark:bg-red-50 dark:text-red-800',
        },
    ];

    const setService = useCallback(
        (service: ServiceKey) => {
            setActiveService(service);
            setQuery(
                service === 'kutipan_rl'
                    ? (search_rl ?? '')
                    : service === 'validasi_pph'
                      ? (search_validasi ?? '')
                      : (search ?? ''),
            );
            setOpen(false);
        },
        [search, search_rl, search_validasi],
    );

    const prevSlide = () =>
        setCurrent((value) => (value === 0 ? images.length - 1 : value - 1));
    const nextSlide = () => setCurrent((value) => (value + 1) % images.length);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProcessing(true);
        router.get(
            '/',
            { search: query, category: activeService },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] font-sans text-slate-900 dark:bg-[#F4F7FB] dark:text-slate-900">
            <Head title="Tracking Dokumen Pasca Lelang" />

            <nav
                className={`sticky top-0 z-50 w-full border-b border-[#D8E0EC] bg-white/95 shadow-sm backdrop-blur transition-transform duration-300 dark:border-slate-200 dark:bg-white/95 ${
                    showNav ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
                    <a href="/" className="cursor-pointer">
                        <img
                            src="/images/image.png"
                            alt="Logo"
                            className="h-14 w-auto object-contain"
                        />
                    </a>

                    <div className="hidden items-center gap-8 md:flex">
                        <a
                            href="#tracking"
                            className="text-base font-extrabold text-slate-600 hover:text-[#123C69] dark:text-slate-600 dark:hover:text-blue-700"
                        >
                            Lacak Dokumen
                        </a>
                        <Link
                            href="/form"
                            className="text-base font-extrabold text-slate-600 hover:text-[#123C69] dark:text-slate-600 dark:hover:text-blue-700"
                        >
                            Formulir
                        </Link>
                        <Link
                            href="/persyaratan"
                            className="text-base font-extrabold text-slate-600 hover:text-[#123C69] dark:text-slate-600 dark:hover:text-blue-700"
                        >
                            Persyaratan
                        </Link>
                        {auth?.user ? (
                            <Link href={dashboard()}>
                                <Button className="rounded-full px-5">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href={login()}>
                                <Button className="h-11 rounded-full border border-[#C7D2E3] bg-white px-6 text-base font-black text-[#123C69] hover:bg-[#F4F7FB]">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label="Buka menu"
                        className="rounded-lg border border-[#C7D2E3] px-3 py-2 text-2xl text-slate-700 hover:bg-slate-100 md:hidden dark:border-slate-200 dark:text-slate-700 dark:hover:bg-blue-50"
                        onClick={() => setOpen((value) => !value)}
                    >
                        ☰
                    </button>
                </div>

                {open && (
                    <div className="space-y-3 border-t border-[#D8E0EC] bg-white px-6 py-5 shadow-sm md:hidden dark:border-slate-200 dark:bg-white">
                        <a
                            href="#tracking"
                            onClick={() => setOpen(false)}
                            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-black text-slate-700 dark:bg-[#F4F7FB] dark:text-slate-700"
                        >
                            Lacak Dokumen
                        </a>
                        <Link
                            href="/persyaratan"
                            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-black text-slate-700 dark:bg-[#F4F7FB] dark:text-slate-700"
                        >
                            Persyaratan
                        </Link>
                        <Link
                            href="/form"
                            className="block rounded-xl bg-[#F4F7FB] px-4 py-3 text-base font-black text-slate-700 dark:bg-[#F4F7FB] dark:text-slate-700"
                        >
                            Formulir
                        </Link>
                        {auth?.user ? (
                            <Link href={dashboard()}>
                                <Button className="w-full rounded-full">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href={login()}>
                                <Button className="h-12 w-full rounded-full border border-[#C7D2E3] bg-white text-base font-black text-[#123C69] hover:bg-[#F4F7FB]">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </nav>

            <section className="w-full">
                <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen">
                    <img
                        src={images[current]}
                        alt="slider"
                        className="h-[360px] w-full object-cover object-[center_10%] transition-all duration-700 md:h-[590px]"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <button
                        type="button"
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white transition hover:bg-black/70"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white transition hover:bg-black/70"
                    >
                        ›
                    </button>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                    {images.map((image, index) => (
                        <button
                            key={image}
                            type="button"
                            aria-label={`Slide ${index + 1}`}
                            onClick={() => setCurrent(index)}
                            className={`h-3 w-3 rounded-full transition ${
                                current === index
                                    ? 'bg-blue-700 dark:bg-blue-700'
                                    : 'bg-slate-300'
                            }`}
                        />
                    ))}
                </div>
            </section>

            <section className="mx-auto mt-10 flex w-full max-w-5xl flex-col items-center px-4 text-center md:mt-14">
                <div className="mb-5 flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-5 py-2 dark:border-blue-100 dark:bg-blue-50">
                    <Search className="h-4 w-4 text-blue-700 dark:text-blue-700" />
                    <span className="text-xs font-bold tracking-widest text-blue-700 uppercase md:text-sm dark:text-blue-700">
                        Monitoring Layanan Pasca Lelang
                    </span>
                </div>

                <h1 className="mb-5 text-4xl leading-[1.12] font-black tracking-tight text-slate-950 md:text-7xl dark:text-slate-950">
                    Lacak Status <br />
                    <span className="text-blue-700 dark:text-blue-700">
                        Dokumen Anda
                    </span>
                </h1>

                <p className="mx-auto max-w-3xl px-2 text-lg leading-relaxed text-slate-700 md:text-2xl dark:text-slate-700">
                    Pilih jenis layanan, masukkan nomor tiket, lalu tekan tombol
                    <span className="font-black text-blue-700 dark:text-blue-700">
                        {' '}
                        Lacak Sekarang
                    </span>
                    .
                </p>
            </section>

            <main
                id="tracking"
                className="mx-auto mt-10 w-full max-w-7xl px-4 md:px-8"
            >
                <section className="rounded-3xl border border-[#C7D2E3] bg-white p-4 shadow-2xl shadow-[#C7D2E3]/50 md:p-6 dark:border-slate-200 dark:bg-white dark:shadow-slate-200/70">
                    <div className="mb-4 rounded-2xl border border-[#D8E0EC] bg-[#F8FAFC] p-4 dark:border-slate-200 dark:bg-[#F8FAFC]">
                        <p className="mb-3 text-base font-black text-slate-950 dark:text-slate-950">
                            1. Pilih jenis layanan
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {services.map((service) => {
                                const selected = service.key === activeService;

                                return (
                                    <button
                                        key={service.key}
                                        type="button"
                                        onClick={() => setService(service.key)}
                                        aria-pressed={selected}
                                        className={`rounded-xl border px-4 py-4 text-base font-black transition sm:text-sm md:text-base ${
                                            selected
                                                ? 'border-blue-700 bg-blue-700 text-white shadow-sm dark:border-blue-700 dark:bg-blue-700 dark:text-white'
                                                : 'border-[#C7D2E3] bg-white text-slate-700 hover:border-blue-700 hover:bg-blue-50 dark:border-slate-200 dark:bg-white dark:text-slate-700 dark:hover:border-blue-700'
                                        }`}
                                    >
                                        {service.shortLabel}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
                        <div
                            className={`rounded-2xl border p-5 md:p-6 ${activeConfig.ring}`}
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-base font-black text-slate-950 dark:text-slate-950">
                                        2. Lihat ringkasan status
                                    </p>
                                    <h2
                                        className={`mt-1 text-3xl font-black ${activeConfig.accent}`}
                                    >
                                        {activeConfig.label}
                                    </h2>
                                </div>
                                <div className="rounded-2xl border border-[#D8E0EC] bg-white px-5 py-3 text-right shadow-sm dark:border-slate-200 dark:bg-white">
                                    <p className="text-xs font-black tracking-widest text-slate-500 uppercase dark:text-slate-500">
                                        Total
                                    </p>
                                    <p className="text-5xl font-black text-slate-950 dark:text-slate-950">
                                        {formatStat(activeStats.total)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                                {statCards.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.label}
                                            className={`rounded-xl border bg-white/90 p-4 shadow-sm backdrop-blur dark:bg-white ${item.className}`}
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <span className="text-sm font-black uppercase">
                                                    {item.label}
                                                </span>
                                                <Icon className="h-5 w-5 shrink-0" />
                                            </div>
                                            <p className="text-4xl font-black">
                                                {formatStat(item.value)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#C7D2E3] bg-[#F8FAFC] p-5 md:p-6 dark:border-slate-200 dark:bg-[#F8FAFC]">
                            <div className="mb-5">
                                <p className="text-base font-black text-blue-700 dark:text-blue-700">
                                    3. Masukkan nomor tiket
                                </p>
                                <h2 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl dark:text-slate-950">
                                    {activeConfig.title}
                                </h2>
                                <p className="mt-3 text-lg leading-relaxed text-slate-700 dark:text-slate-700">
                                    {activeConfig.description}
                                </p>
                            </div>

                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col gap-3"
                            >
                                <label
                                    htmlFor="tracking-number"
                                    className="text-base font-black text-slate-800 dark:text-slate-800"
                                >
                                    Nomor tiket / nomor pengajuan
                                </label>
                                <div className="relative flex-1 rounded-xl bg-white shadow-sm dark:bg-white">
                                    <Search className="absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="tracking-number"
                                        type="text"
                                        placeholder={activeConfig.placeholder}
                                        className="h-16 border-[#C7D2E3] bg-transparent pr-4 pl-14 text-lg font-semibold shadow-none focus-visible:ring-blue-200 dark:border-slate-200 dark:text-slate-900"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-16 rounded-xl bg-blue-700 px-7 text-lg font-black text-white transition hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800"
                                >
                                    {processing
                                        ? 'Mencari...'
                                        : 'Lacak Sekarang'}
                                </Button>
                                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-600">
                                    Pastikan jenis layanan di atas sudah sesuai
                                    dengan tiket Anda.
                                </p>
                            </form>
                        </div>
                    </div>
                </section>

                <TrackingResult
                    document={activeDocument}
                    searchedValue={activeSearch}
                    service={activeConfig}
                />
            </main>

            <section className="mt-20">
                <div className="w-full border-b border-blue-700 bg-blue-500 px-6 py-10 text-center text-white md:px-12">
                    <p className="mx-auto max-w-7xl text-base leading-relaxed font-medium md:text-xl">
                        Bahwa dalam rangka mewujudkan Zona Integritas menuju
                        Wilayah Bebas dari Korupsi,
                        <strong className="font-extrabold text-slate-950">
                            {' '}
                            KPKNL Bogor berkomitmen untuk meningkatkan kualitas
                            pelayanan{' '}
                        </strong>
                        dengan prinsip utama{' '}
                        <strong className="text-blue-700">BAGeUR</strong>{' '}
                        (Bersih, Amanah, Gesit, Unggul dan Ramah)
                    </p>
                </div>

                <footer className="w-full bg-blue-800 py-16 text-white">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-8">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <img
                                    src="images/NAGARA-DANA-RAKCA.png"
                                    alt="Logo Nagara Dana Rakca"
                                    className="h-20 w-20 object-contain"
                                />
                                <img
                                    src="images/kpknl-bogor.png"
                                    alt="Logo KPKNL Bogor"
                                    className="h-20 w-20 object-contain"
                                />
                            </div>
                            <div className="space-y-4 text-base leading-relaxed font-semibold md:text-lg">
                                <p className="text-xl font-bold md:text-2xl">
                                    © 2026 KPKNL Bogor
                                </p>
                                <p className="opacity-90">
                                    Jalan Veteran No. 45, Panaragan, Kecamatan
                                    Bogor Tengah, Kota Bogor, Jawa Barat 16125
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-8 md:items-end">
                            <div className="flex flex-col items-start md:items-end">
                                <p className="mb-2 text-lg font-black tracking-widest text-blue-100 uppercase">
                                    Ikuti Kami
                                </p>
                                <div className="h-1.5 w-16 rounded-full bg-white" />
                            </div>
                            <div className="flex gap-5">
                                {[
                                    {
                                        name: 'facebook',
                                        url: 'https://www.facebook.com/kpknlbogor',
                                        color: 'hover:bg-[#1877F2]',
                                    },
                                    {
                                        name: 'instagram',
                                        url: 'https://www.instagram.com/kpknl.bogor',
                                        color: 'hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
                                    },
                                    {
                                        name: 'tiktok',
                                        url: 'https://www.tiktok.com/@kpknl.bogor',
                                        color: 'hover:bg-black',
                                    },
                                ].map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 ${item.color} hover:-translate-y-2 hover:shadow-2xl active:scale-90`}
                                    >
                                        <i
                                            className={`fa-brands fa-${item.name} text-2xl transition-transform group-hover:scale-110`}
                                        />
                                    </a>
                                ))}
                            </div>
                            <p className="text-left text-xs leading-loose font-black tracking-widest text-blue-100 uppercase md:text-right md:text-sm">
                                Kantor Pelayanan Kekayaan Negara dan Lelang
                                Bogor <br />
                                <span className="text-blue-100">
                                    @kpknlbogor
                                </span>
                            </p>
                        </div>
                    </div>
                </footer>
            </section>

            <FloatingWhatsApp />
        </div>
    );
}
