import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Search,
    CheckCircle2,
    Clock,
    FileText,
    Inbox,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard, login } from '@/routes';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface DocumentItem {
    id: number;
    nomor_pengajuan: string;
    status_proses: 'siap_diambil' | 'proses' | 'selesai';
    catatan: string | null;
}

function TableRow({
    title,
    status,
}: {
    title: string;
    status: DocumentItem['status_proses'] | string;
}) {
    const getStatusStyles = (s: string) => {
        switch (s) {
            case 'selesai':
                return {
                    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900',
                    icon: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
                    label: 'Selesai',
                };
            case 'siap_diambil':
                return {
                    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900',
                    icon: <Inbox className="mr-1.5 h-4 w-4" />,
                    label: 'Siap Diambil',
                };
            case 'tidak_valid':
                return {
                    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900',
                    icon: <XCircle className="mr-1.5 h-4 w-4" />,
                    label: 'Tidak Valid',
                };
            default:
                return {
                    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900',
                    icon: <Clock className="mr-1.5 h-4 w-4" />,
                    label: 'Dalam Proses',
                };
        }
    };

    const style = getStatusStyles(status as string);

    return (
        <tr className="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50">
            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                {title}
            </td>
            <td className="px-6 py-4 text-sm">
                <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                >
                    {style.icon}
                    {style.label}
                </span>
            </td>
        </tr>
    );
}

const formatStat = (value: number | undefined) =>
    new Intl.NumberFormat('id-ID').format(value ?? 0);

export default function Welcome({
    document,
    search,
    document_rl,
    search_rl,
    document_validasi,
    search_validasi,
    statistics,
}: {
    document: DocumentItem | null;
    search: string | null;
    document_rl: DocumentItem | null;
    search_rl: string | null;
    document_validasi: DocumentItem | null;
    search_validasi: string | null;
    statistics: any;
}) {
    const {
        data: dataK,
        setData: setDataK,
        get: getK,
        processing: processingK,
    } = useForm({ search: search || '', category: 'kuitansi' });

    const {
        data: dataRL,
        setData: setDataRL,
        get: getRL,
        processing: processingRL,
    } = useForm({ search: search_rl || '', category: 'kutipan_rl' });

    const {
        data: dataV,
        setData: setDataV,
        get: getV,
        processing: processingV,
    } = useForm({ search: search_validasi || '', category: 'validasi_pph' });

    const { auth } = usePage().props as any;
    const [showNav, setShowNav] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [open, setOpen] = useState(false);

    const images = [
        '/images/profile-1.png',
        '/images/profile-2.png',
        '/images/profile-3.png',
        '/images/profile-4.jpeg',
    ];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((p) => (p + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                setShowNav(false);
            } else {
                setShowNav(true);
            }
            setLastScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const prevSlide = () =>
        setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    const nextSlide = () => setCurrent((c) => (c + 1) % images.length);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        getK('/', { preserveState: true, preserveScroll: true });
    };

    const handleSearchRL = (e: React.FormEvent) => {
        e.preventDefault();
        getRL('/', { preserveState: true, preserveScroll: true });
    };

    const handleSearchValidasi = (e: React.FormEvent) => {
        e.preventDefault();
        getV('/', { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans dark:bg-[#ffffff]">
            <Head title="Tracking Dokumen Pasca Lelang" />
            <nav
                className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm transition-transform duration-300 ${
                    showNav ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-9 md:px-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/image.png"
                            alt="Logo"
                            className="h-15 w-auto object-contain md:h-15"
                        />
                        <a href="#welcome"></a>
                        <div className="hidden flex-col leading-tight md:flex"></div>
                    </div>

                    <div className="hidden items-center gap-10 md:flex">
                        <a
                            href="#kuitansi"
                            className="text-sm font-extrabold text-gray-600 hover:text-indigo-600"
                        >
                            Kuitansi
                        </a>
                        <a
                            href="#kutipan"
                            className="text-sm font-extrabold text-gray-600 hover:text-indigo-600"
                        >
                            Kutipan RL
                        </a>
                        <a
                            href="#validasiPPh"
                            className="text-sm font-extrabold text-gray-600 hover:text-indigo-600"
                        >
                            Validasi PPh
                        </a>
                        <Link
                            href="/form"
                            className="text-sm font-extrabold text-gray-600 hover:text-indigo-600"
                        >
                            Doclang Boba
                        </Link>
                        <Link
                            href="/persyaratan"
                            className="text-sm font-extrabold text-gray-600 hover:text-indigo-600"
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
                                <Button className="bg-white-600 rounded-full px-5 text-black">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>

                    <button
                        className="text-xl text-gray-700 md:hidden"
                        onClick={() => setOpen(!open)}
                    >
                        ☰
                    </button>
                </div>

                {open && (
                    <div className="animate-in space-y-4 border-t bg-white px-8 pb-4 shadow-sm duration-800 fade-in slide-in-from-top-2 md:hidden">
                        <div className="flex justify-between">
                            <a
                                href="#kuitansi"
                                className="mt-4 text-sm text-black"
                            >
                                Kuitansi
                            </a>
                            <Link
                                href="/persyaratan"
                                className="mt-4 text-sm font-extrabold text-gray-600 hover:text-indigo-600"
                            >
                                Persyaratan
                            </Link>

                            <Link
                                href="/form"
                                className="mt-4 text-sm font-extrabold text-gray-600 hover:text-indigo-600"
                            >
                                Doclang Boba
                            </Link>
                        </div>

                        <a href="#kutipan" className="block text-sm text-card">
                            Kutipan RL
                        </a>

                        <a
                            href="#validasiPPh"
                            className="block text-sm text-card"
                        >
                            Validasi PPh
                        </a>

                        {auth?.user ? (
                            <Link href={dashboard()}>
                                <Button className="w-full rounded-full">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href={login()}>
                                <Button className="bg-white-600 w-full rounded-full text-black">
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
                        className="h-[590px] w-full object-cover object-[center_10%] transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20" />

                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white"
                    >
                        ‹
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white"
                    >
                        ›
                    </button>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-3 w-3 cursor-pointer rounded-full ${current === index ? 'bg-indigo-600' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </section>
            <section className="mx-auto mt-10 mb-20 flex min-h-[70vh] w-full max-w-4xl animate-in flex-col items-center justify-center px-4 text-center duration-1000 slide-in-from-bottom-10 fade-in">
                {/* Aksen Kecil agar lebih Modern */}
                <div className="mb-6 flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 dark:border-indigo-800 dark:bg-indigo-900/20">
                    <Search className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase md:text-xs dark:text-indigo-400">
                        Monitoring Layanan Pasca Lelang
                    </span>
                </div>

                {/* Headline Utama dengan Gradient yang sesuai tema Navbar/Card kamu */}
                <h1 className="mb-6 text-4xl leading-[1.1] font-black tracking-tight text-slate-900 md:text-7xl dark:text-black">
                    Lacak Status <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                        Dokumen Anda
                    </span>
                </h1>

                {/* Deskripsi: Dibuat lebih ramping di mobile agar enak dibaca */}
                <p className="mx-auto mb-10 max-w-2xl px-2 text-base leading-relaxed text-slate-600 md:text-xl dark:text-slate-400">
                    Masukkan nomor pengajuan untuk memantau progres kuitansi,
                    kutipan RL, hingga validasi PPh secara{' '}
                    <span className="font-semibold text-slate-900 dark:text-black">
                        real-time.
                    </span>
                </p>
            </section>
            {/* Dashboard Statistik (Read-only) */}
            {/* --- AWAL BAGIAN STATISTIK BARU (SESUAI GAMBAR) --- */}
            <section className="max-w-100xl mx-auto mb-20 w-full px-4 md:px-8">
                <div className="mb-10 text-center">
                    <div className="mb-4 overflow-hidden">
                        <h2 className="marquee-title text-3xl font-black tracking-tight whitespace-nowrap text-slate-900 md:text-5xl">
                            Dokumen Pasca Lelang Bogor Bageur
                        </h2>
                    </div>
                    <p className="font-bold text-slate-500">
                        Ringkasan statistik real-time dokumen pasca lelang.
                    </p>
                </div>
                {/* Container Biru Utama */}
                <section className="rounded-3xl border border-indigo-500/20 bg-[#1E56A0] p-8 shadow-2xl">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* 1. KUITANSI (BIRU) */}
                        <div className="rounded-2xl border-4 border-blue-500 bg-white/10 p-5 backdrop-blur-md">
                            <h3 className="mb-6 text-center text-4xl font-extrabold text-white">
                                Kuitansi
                            </h3>

                            <div className="space-y-3">
                                {/* Baris Atas: Total (Kiri) dan Group Kanan */}
                                <div className="flex items-stretch gap-3">
                                    {/* Box Total (Tinggi Penuh) */}
                                    <div className="flex w-1/3 flex-col items-center justify-center rounded-xl border-4 border-blue-500 bg-white p-4 text-center">
                                        <span className="text-xs font-medium text-blue-900">
                                            Total
                                        </span>
                                        <span className="text-4xl font-black text-blue-900">
                                            {formatStat(
                                                statistics?.kuitansi?.total,
                                            )}
                                        </span>
                                    </div>

                                    {/* Group Kanan */}
                                    <div className="w-2/3 space-y-3">
                                        {/* Siap Diambil (Lebar Penuh) */}
                                        <div className="flex flex-col items-center justify-center rounded-xl border-4 border-blue-500 bg-white p-4 text-center">
                                            <span className="text-xs font-medium text-blue-900">
                                                Siap Diambil
                                            </span>
                                            <span className="text-3xl font-black text-blue-900">
                                                {formatStat(
                                                    statistics?.kuitansi
                                                        ?.siap_diambil,
                                                )}
                                            </span>
                                        </div>
                                        {/* Proses & Selesai (Dua Kolom) */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col items-center justify-center rounded-xl border-4 border-blue-500 bg-white p-4 text-center">
                                                <span className="text-xs font-medium text-blue-900">
                                                    Proses
                                                </span>
                                                <span className="text-3xl font-black text-blue-900">
                                                    {formatStat(
                                                        statistics?.kuitansi
                                                            ?.proses,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center rounded-xl border-4 border-blue-500 bg-white p-4 text-center">
                                                <span className="text-xs font-medium text-blue-900">
                                                    Selesai
                                                </span>
                                                <span className="text-3xl font-black text-blue-900">
                                                    {formatStat(
                                                        statistics?.kuitansi
                                                            ?.selesai,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Baris Bawah: Tidak Valid */}
                                <div className="flex items-center justify-between rounded-xl border-4 border-blue-500 bg-white p-4">
                                    <span className="text-lg font-medium text-blue-900">
                                        Tidak Valid
                                    </span>
                                    <span className="text-3xl font-black text-blue-900">
                                        {formatStat(
                                            statistics?.kuitansi?.tidak_valid,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. KUTIPAN RL (ORANYE) */}
                        <div className="rounded-2xl border-4 border-orange-500 bg-white/10 p-5 backdrop-blur-md">
                            <h3 className="mb-6 text-center text-4xl font-extrabold text-white">
                                Kutipan RL
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-stretch gap-3">
                                    {/* Box Total */}
                                    <div className="flex w-1/3 flex-col items-center justify-center rounded-xl border-4 border-orange-500 bg-white p-4 text-center">
                                        <span className="text-xs font-medium text-orange-900">
                                            Total
                                        </span>
                                        <span className="text-4xl font-black text-orange-900">
                                            {formatStat(
                                                statistics?.kutipan_rl?.total,
                                            )}
                                        </span>
                                    </div>

                                    {/* Group Kanan */}
                                    <div className="w-2/3 space-y-3">
                                        {/* Siap Diambil */}
                                        <div className="flex flex-col items-center justify-center rounded-xl border-4 border-orange-500 bg-white p-4 text-center">
                                            <span className="text-xs font-medium text-orange-900">
                                                Siap Diambil
                                            </span>
                                            <span className="text-3xl font-black text-orange-900">
                                                {formatStat(
                                                    statistics?.kutipan_rl
                                                        ?.siap_diambil,
                                                )}
                                            </span>
                                        </div>
                                        {/* Proses & Selesai */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col items-center justify-center rounded-xl border-4 border-orange-500 bg-white p-4 text-center">
                                                <span className="text-xs font-medium text-orange-900">
                                                    Proses
                                                </span>
                                                <span className="text-3xl font-black text-orange-900">
                                                    {formatStat(
                                                        statistics?.kutipan_rl
                                                            ?.proses,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center rounded-xl border-4 border-orange-500 bg-white p-4 text-center">
                                                <span className="text-xs font-medium text-orange-900">
                                                    Selesai
                                                </span>
                                                <span className="text-3xl font-black text-orange-900">
                                                    {formatStat(
                                                        statistics?.kutipan_rl
                                                            ?.selesai,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tidak Valid */}
                                <div className="flex items-center justify-between rounded-xl border-4 border-orange-500 bg-white p-4">
                                    <span className="text-lg font-medium text-orange-900">
                                        Tidak Valid
                                    </span>
                                    <span className="text-3xl font-black text-orange-900">
                                        {formatStat(
                                            statistics?.kutipan_rl?.tidak_valid,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. VALIDASI PPH (HIJAU) */}
                        <div className="rounded-2xl border-4 border-green-500 bg-white/10 p-5 backdrop-blur-md">
                            <h3 className="mb-6 text-center text-4xl font-extrabold text-white">
                                Validasi PPh
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-stretch gap-3">
                                    {/* Box Total */}
                                    <div className="flex w-1/3 flex-col items-center justify-center rounded-xl border-4 border-green-500 bg-white p-4 text-center">
                                        <span className="text-xs font-medium text-emerald-900">
                                            Total
                                        </span>
                                        <span className="text-4xl font-black text-emerald-900">
                                            {formatStat(
                                                statistics?.validasi_pph?.total,
                                            )}
                                        </span>
                                    </div>

                                    {/* Group Kanan */}
                                    <div className="w-2/3 space-y-3">
                                        {/* Siap Diambil */}
                                        <div className="flex flex-col items-center justify-center rounded-xl border-4 border-green-500 bg-white p-4 text-center">
                                            <span className="text-xs font-medium text-emerald-900">
                                                Siap Diambil
                                            </span>
                                            <span className="text-3xl font-black text-emerald-900">
                                                {formatStat(
                                                    statistics?.validasi_pph
                                                        ?.siap_diambil,
                                                )}
                                            </span>
                                        </div>
                                        {/* Proses & Selesai */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col items-center justify-center rounded-xl border-4 border-green-500 bg-white p-4 text-center">
                                                <span className="text-xs font-medium text-emerald-900">
                                                    Proses
                                                </span>
                                                <span className="text-3xl font-black text-emerald-900">
                                                    {formatStat(
                                                        statistics?.validasi_pph
                                                            ?.proses,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center rounded-xl border-4 border-green-500 bg-white p-4 text-center">
                                                <span className="text-xs font-medium text-emerald-900">
                                                    Selesai
                                                </span>
                                                <span className="text-3xl font-black text-emerald-900">
                                                    {formatStat(
                                                        statistics?.validasi_pph
                                                            ?.selesai,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tidak Valid */}
                                <div className="flex items-center justify-between rounded-xl border-4 border-green-500 bg-white p-4">
                                    <span className="text-lg font-medium text-emerald-900">
                                        Tidak Valid
                                    </span>
                                    <span className="text-3xl font-black text-emerald-900">
                                        {formatStat(
                                            statistics?.validasi_pph
                                                ?.tidak_valid,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>{' '}
                    {/* Tutup Grid */}
                </section>{' '}
                {/* Tutup Container Biru */}
            </section>{' '}
            {/* Tutup Section Statistik */}
            {/* Kuitansi */}
            <main className="mx-6 mt-10 rounded-3xl">
                <section
                    id="kuitansi"
                    className="mt-20 w-full scroll-mt-40 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-[#1E56A0]"
                >
                    <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center">
                        <div className="flex w-full flex-col items-center">
                            <div className="mb-12 w-full max-w-2xl animate-in text-center duration-700 fade-in slide-in-from-bottom-8">
                                <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl dark:text-white">
                                    Pengajuan Kuitansi <br />
                                    <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                                        Siap Diambil
                                    </span>
                                </h1>
                                <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                    Masukkan Nomor Pengajuan Anda untuk melihat
                                    status pemrosesan dokumen secara real-time.
                                </p>
                                <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-2xl shadow-indigo-500/10 dark:border-slate-800">
                                    <CardContent className="p-2">
                                        <form
                                            onSubmit={handleSearch}
                                            className="flex flex-col gap-2 sm:flex-row"
                                        >
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Contoh: 123/KPHL/2026"
                                                    className="h-14 border-0 bg-transparent pr-4 pl-12 text-lg shadow-none ring-0 focus-visible:ring-0 dark:text-white"
                                                    value={dataK.search}
                                                    onChange={(e) =>
                                                        setDataK(
                                                            'search',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processingK}
                                                className="h-14 rounded-xl bg-indigo-600 px-8 text-base font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
                                            >
                                                {processingK
                                                    ? 'Mencari...'
                                                    : 'Lacak Sekarang'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {search && (
                                <div className="flex animate-in flex-col items-center delay-150 duration-500 fill-mode-both fade-in slide-in-from-bottom-12">
                                    {document ? (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-zinc-800">
                                                <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <FileText className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        Hasil Pencarian untuk:
                                                    </p>
                                                    <h2 className="font-mono text-2xl font-bold">
                                                        {
                                                            document.nomor_pengajuan
                                                        }
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full min-w-[450px] text-left text-sm">
                                                        <thead className="border-b border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                                                            <tr>
                                                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                                    Jenis
                                                                    Dokumen
                                                                </th>
                                                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                                    Status
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                                            <TableRow
                                                                title="Status Proses Dokumen"
                                                                status={
                                                                    document.status_proses
                                                                }
                                                            />
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            {document.catatan && (
                                                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                                    <p className="mb-1 text-sm font-medium text-slate-500">
                                                        Catatan Petugas:
                                                    </p>
                                                    <p className="text-slate-700 italic dark:text-slate-300">
                                                        "{document.catatan}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                                                <Search className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold">
                                                Dokumen Tidak Ditemukan
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                Kami tidak menemukan pengajuan
                                                dengan nomor{' '}
                                                <span className="font-mono font-medium text-slate-900 dark:text-white">
                                                    {search}
                                                </span>
                                                .
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex w-full justify-center md:w-1/2">
                            <img
                                src="/images/siapwbk.png"
                                alt="Ilustrasi"
                                className="object-contain drop-shadow-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Kutipan RL */}
                <section
                    id="kutipan"
                    className="mt-20 w-full scroll-mt-40 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-[#1E56A0]"
                >
                    <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center">
                        <div className="flex w-full justify-center md:w-1/2">
                            <img
                                src="/images/menujuwbk.png"
                                alt="Ilustrasi"
                                className="object-contain drop-shadow-xl"
                            />
                        </div>

                        <div className="flex w-full flex-col items-center">
                            <div className="mb-12 w-full max-w-2xl animate-in text-center duration-700 fade-in slide-in-from-bottom-8">
                                <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl dark:text-white">
                                    Pengajuan Kutipan RL <br />
                                    <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                                        Siap Diambil
                                    </span>
                                </h1>
                                <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                    Masukkan Nomor Pengajuan Anda untuk melihat
                                    status pemrosesan dokumen secara real-time.
                                </p>
                                <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-2xl shadow-indigo-500/10 dark:border-slate-800">
                                    <CardContent className="p-2">
                                        <form
                                            onSubmit={handleSearchRL}
                                            className="flex flex-col gap-2 sm:flex-row"
                                        >
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Contoh: 123/K-RL/2026"
                                                    className="h-14 border-0 bg-transparent pr-4 pl-12 text-lg shadow-none ring-0 focus-visible:ring-0 dark:text-white"
                                                    value={dataRL.search}
                                                    onChange={(e) =>
                                                        setDataRL(
                                                            'search',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processingRL}
                                                className="h-14 rounded-xl bg-indigo-600 px-8 text-base font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
                                            >
                                                {processingRL
                                                    ? 'Mencari...'
                                                    : 'Lacak Sekarang'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {search_rl && (
                                <div className="w-full max-w-3xl animate-in delay-150 duration-500 fill-mode-both fade-in slide-in-from-bottom-12">
                                    {document_rl ? (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-zinc-800">
                                                <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <FileText className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        Hasil Pencarian untuk:
                                                    </p>
                                                    <h2 className="font-mono text-2xl font-bold">
                                                        {
                                                            document_rl.nomor_pengajuan
                                                        }
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full min-w-[450px] text-left text-sm">
                                                        <thead className="border-b border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                                                            <tr>
                                                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                                    Jenis
                                                                    Dokumen
                                                                </th>
                                                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                                    Status
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                                            <TableRow
                                                                title="Status Proses Dokumen"
                                                                status={
                                                                    document_rl.status_proses
                                                                }
                                                            />
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            {document_rl.catatan && (
                                                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                                    <p className="mb-1 text-sm font-medium text-slate-500">
                                                        Catatan Petugas:
                                                    </p>
                                                    <p className="text-slate-700 italic dark:text-slate-300">
                                                        "{document_rl.catatan}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                                                <Search className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold">
                                                Dokumen Tidak Ditemukan
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                Kami tidak menemukan pengajuan
                                                dengan nomor{' '}
                                                <span className="font-mono font-medium text-slate-900 dark:text-white">
                                                    {search_rl}
                                                </span>
                                                .
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Validasi PPh */}
                <section
                    id="validasiPPh"
                    className="mt-20 w-full scroll-mt-40 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-[#1E56A0]"
                >
                    <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center">
                        <div className="flex w-full flex-col items-center">
                            <div className="mb-12 w-full max-w-2xl animate-in text-center duration-700 fade-in slide-in-from-bottom-8">
                                <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl dark:text-white">
                                    Pengajuan Validasi PPh <br />
                                    <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                                        Siap Diambil
                                    </span>
                                </h1>
                                <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                    Masukkan Nomor Pengajuan Anda untuk melihat
                                    status pemrosesan dokumen secara real-time.
                                </p>
                                <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-2xl shadow-indigo-500/10 dark:border-slate-800">
                                    <CardContent className="p-2">
                                        <form
                                            onSubmit={handleSearchValidasi}
                                            className="flex flex-col gap-2 sm:flex-row"
                                        >
                                            <div className="relative flex-1">
                                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Contoh: 123/V-PPh/2026"
                                                    className="h-14 border-0 bg-transparent pr-4 pl-12 text-lg shadow-none ring-0 focus-visible:ring-0 dark:text-white"
                                                    value={dataV.search}
                                                    onChange={(e) =>
                                                        setDataV(
                                                            'search',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processingV}
                                                className="h-14 rounded-xl bg-indigo-600 px-8 text-base font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
                                            >
                                                {processingV
                                                    ? 'Mencari...'
                                                    : 'Lacak Sekarang'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {search_validasi && (
                                <div className="w-full max-w-3xl animate-in delay-150 duration-500 fill-mode-both fade-in slide-in-from-bottom-12">
                                    {document_validasi ? (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-6 dark:border-zinc-800">
                                                <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <FileText className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        Hasil Pencarian untuk:
                                                    </p>
                                                    <h2 className="font-mono text-2xl font-bold">
                                                        {
                                                            document_validasi.nomor_pengajuan
                                                        }
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full min-w-[450px] text-left text-sm">
                                                        <thead className="border-b border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                                                            <tr>
                                                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                                    Jenis
                                                                    Dokumen
                                                                </th>
                                                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                                    Status
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                                                            <TableRow
                                                                title="Status Proses Dokumen"
                                                                status={
                                                                    document_validasi.status_proses
                                                                }
                                                            />
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            {document_validasi.catatan && (
                                                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                                                    <p className="mb-1 text-sm font-medium text-slate-500">
                                                        Catatan Petugas:
                                                    </p>
                                                    <p className="text-slate-700 italic dark:text-slate-300">
                                                        "
                                                        {
                                                            document_validasi.catatan
                                                        }
                                                        "
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                                                <Search className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold">
                                                Dokumen Tidak Ditemukan
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                Kami tidak menemukan pengajuan
                                                dengan nomor{' '}
                                                <span className="font-mono font-medium text-slate-900 dark:text-white">
                                                    {search_validasi}
                                                </span>
                                                .
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex w-full justify-center md:w-1/2">
                            <img
                                src="/images/layanan.png"
                                alt="Ilustrasi"
                                className="object-contain drop-shadow-xl"
                            />
                        </div>
                    </div>
                </section>
            </main>
            {/* FOOTER KPKNL */}
            {/* FOOTER KPKNL */}
            <section className="mt-45">
                <div className="w-full border-b border-white/10 bg-[#0F3D7A] px-6 py-10 text-center text-gray-100 md:px-12">
                    <p className="max-w-10xl mx-auto text-base leading-relaxed font-medium md:text-xl">
                        Bahwa dalam rangka mewujudkan Zona Integritas menuju
                        Wilayah Bebas dari Korupsi,
                        <strong className="font-extrabold text-white">
                            {' '}
                            KPKNL Bogor berkomitmen untuk meningkatkan kualitas
                            pelayanan{' '}
                        </strong>
                        dengan prinsip utama{' '}
                        <strong className="text-cyan-300">BAGeUR</strong>{' '}
                        (Bersih, Amanah, Gesit, Unggul dan Ramah)
                    </p>
                </div>

                <footer className="w-full bg-[#1E56A0] py-16 text-white">
                    <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-8">
                        {/* LEFT SECTION */}
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <img
                                    src="images/NAGARA-DANA-RAKCA.png"
                                    alt="Logo"
                                    className="h-20 w-20 object-contain"
                                />
                                <img
                                    src="images/kpknl-bogor.png"
                                    alt="Logo"
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

                        {/* RIGHT SECTION */}
                        <div className="flex flex-col items-start gap-8 md:items-end">
                            <div className="flex flex-col items-start md:items-end">
                                <p className="mb-2 text-lg font-black tracking-widest text-cyan-200 uppercase">
                                    Ikuti Kami
                                </p>
                                <div className="h-1.5 w-16 rounded-full bg-cyan-400"></div>
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
                                ].map((item, index) => (
                                    <a
                                        key={index}
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
                                <span className="text-cyan-300">
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
