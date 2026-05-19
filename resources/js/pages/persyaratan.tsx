import { Head, Link } from '@inertiajs/react';
import {
    FileCheck,
    ClipboardList,
    ShieldCheck,
    AlertCircle,
    Info,
    FileDown,
    MapPin,
    ChevronLeft,
} from 'lucide-react';
import React from 'react';

const Persyaratan: React.FC = () => {
    const data = [
        {
            title: 'Pemberian Kuitansi Pembayaran Harga Lelang',
            icon: <ClipboardList className="h-6 w-6 text-[#1E56A0]" />,
            items: [
                'Fotokopi KTP Pemohon / Pemenang',
                'Surat Kuasa asli (jika dikuasakan)',
                'Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*',
                'Bukti asli Pelunasan Harga Lelang',
            ],
            note: '*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum',
        },
        {
            title: 'Pemberian Kutipan Risalah Lelang',
            icon: <FileCheck className="h-6 w-6 text-[#1E56A0]" />,
            items: [
                'Fotokopi KTP Pemohon / Pemenang',
                'Surat Kuasa asli (jika dikuasakan)',
                'Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*',
                'Kuitansi Pembayaran Harga Lelang asli',
                'Asli Bukti Validasi SSPD BPHTB yang telah disetujui**',
                'Meterai sebanyak 2 buah',
            ],
            note: '*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum\n**Validasi BPHTB untuk objek lelang berupa tanah dan/atau bangunan',
            info: 'Hardcopy dokumen persyaratan harap dilampirkan pada saat pengambilan fisik berkas.',
        },
        {
            title: 'Validasi PPh (1 Bidang)',
            icon: <ShieldCheck className="h-6 w-6 text-[#1E56A0]" />,
            items: [
                'Fotokopi KTP Pemohon / Pemenang',
                'Surat Kuasa asli (jika dikuasakan)',
                'Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*',
                'Kuitansi Pembayaran Harga Lelang asli',
                'Slip asli / Setor PPh',
                'Slip asli / Setor PBB atau berkas BPHTB yang menunjukkan NOP dan luas Tanah/Bangunan yang tepat',
                'Bukti Pelunasan',
            ],
            note: '*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum',
            warning:
                'Layanan validasi PPh penyelesaiannya menunggu hasil proses konfirmasi resmi dengan Kantor Pelayanan Pajak (KPP).',
        },
    ];

    return (
        // Konsisten menggunakan bg-[#F8FAFC] yang cerah dan bersih layaknya form.tsx
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
            <Head title="Persyaratan Dokumen - Doclang Boba" />

            {/* STICKY NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-6 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center gap-4">
                    <Link
                        href="/"
                        className="rounded-full p-2 transition-colors hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <span className="font-black tracking-widest text-[#1E56A0] uppercase">
                        Doclang Boba
                    </span>
                </div>
            </nav>

            <div className="mx-auto mt-12 max-w-3xl px-4">
                {/* HEADER TITLE SECTION */}
                <div className="mb-10 space-y-3 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black tracking-widest text-[#1E56A0] uppercase">
                        <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                        KPKNL BOGOR
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                        Persyaratan Dokumen
                    </h1>
                    <p className="mx-auto max-w-xl text-sm font-medium text-slate-500">
                        Lengkapi berkas Anda untuk mempercepat proses layanan
                        pasca lelang.
                    </p>

                    {/* REVISI SENIOR: Penempatan Tombol Unduh PDF yang Terpusat & Seimbang di Bagian Atas */}
                    <div className="flex justify-center pt-2">
                        <a
                            href="pdf/syarat_layanan_lelang.pdf"
                            download
                            className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3.5 text-xs font-black text-slate-700 shadow-md transition-all hover:border-[#1E56A0] hover:text-[#1E56A0] active:scale-95"
                        >
                            <FileDown className="h-4 w-4 text-[#1E56A0]" />
                            Unduh Dokumen PDF Resmi
                        </a>
                    </div>
                </div>

                {/* CONTENT CARDS (Linear kebawah, Box Putih Solid, Shadow Khas form.tsx) */}
                <div className="space-y-8">
                    {data.map((section, idx) => (
                        <div
                            key={idx}
                            className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl"
                        >
                            {/* Signature Aksen Terang Khas Form */}
                            <div className="h-2 bg-[#1E56A0]"></div>

                            <div className="space-y-6 p-8 md:p-10">
                                {/* Judul Section & Ikon */}
                                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[#1E56A0]">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl leading-snug font-black text-slate-900">
                                        {section.title}
                                    </h2>
                                </div>

                                {/* Grid Items / Daftar Berkas dengan Background Lembut */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {section.items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-slate-800"
                                        >
                                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1E56A0]" />
                                            <span className="text-sm leading-relaxed font-bold">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bagian Catatan, Info, & Warning */}
                                <div className="space-y-3 pt-2">
                                    {section.note && (
                                        <p className="px-1 text-[11px] leading-relaxed font-semibold text-slate-400 italic">
                                            {section.note}
                                        </p>
                                    )}

                                    {/* Info Alert Box */}
                                    {section.info && (
                                        <div className="flex items-start gap-3 rounded-2xl border-l-4 border-blue-500 bg-blue-50 p-4 text-xs font-bold text-blue-800">
                                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                            <p className="leading-relaxed">
                                                {section.info}
                                            </p>
                                        </div>
                                    )}

                                    {/* Warning Alert Box */}
                                    {section.warning && (
                                        <div className="flex items-start gap-3 rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-xs font-bold text-amber-800">
                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                            <p className="leading-relaxed">
                                                {section.warning}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* BOTTOM CALL TO ACTION BOX */}
                <div className="relative mt-12 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 left-0 h-2 bg-[#1E56A0]"></div>

                    <div className="relative z-10 flex flex-col items-center justify-between gap-6 pt-2 md:flex-row">
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-lg font-black text-slate-900">
                                Dokumen Sudah Lengkap?
                            </h3>
                            <p className="max-w-md text-xs leading-relaxed font-medium text-slate-500">
                                Harap pastikan semua dokumen dalam keadaan
                                bersih dan terbaca jelas sebelum diunggah ke
                                sistem.
                            </p>
                        </div>
                        <Link
                            href="/form"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E56A0] px-6 py-4 text-sm font-black text-white shadow-xl transition-all hover:bg-[#0F3D7A] active:scale-95 md:w-auto"
                        >
                            Mulai Isi Form Pengajuan
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Persyaratan;
