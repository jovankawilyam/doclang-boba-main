import {
    FileCheck,
    ClipboardList,
    ShieldCheck,
    AlertCircle,
    Info,
    FileDown,
    MapPin,
} from 'lucide-react';
import React from 'react';

const Persyaratan: React.FC = () => {
    const data = [
        {
            title: 'Pemberian Kuitansi Pembayaran Harga Lelang',
            icon: <ClipboardList className="h-6 w-6 text-indigo-600" />,
            items: [
                'Fotokopi KTP',
                'Surat Kuasa (jika dikuasakan)',
                'Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*',
                'Bukti Pelunasan',
            ],
            note: '*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum',
        },
        {
            title: 'Pemberian Kutipan Risalah Lelang',
            icon: <FileCheck className="h-6 w-6 text-indigo-600" />,
            items: [
                'Fotokopi KTP',
                'Surat Kuasa (jika dikuasakan)',
                'Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*',
                'Kuitansi Pembayaran Harga Lelang',
                'Asli Bukti Validasi SSPD BPHTB yang telah disetujui**',
                'Meterai sebanyak 2 buah',
            ],
            note: '*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum\n**Validasi BPHTB untuk objek lelang berupa tanah dan/atau bangunan',
            info: 'Hardcopy dokumen persyaratan harap dilampirkan pada saat pengambilan',
        },
        {
            title: 'Validasi PPh (1 Bidang)',
            icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
            items: [
                'Fotokopi KTP',
                'Surat Kuasa (jika dikuasakan)',
                'Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*',
                'Kuitansi Pembayaran Harga Lelang',
                'Slip setor PPh',
                'Slip setor PBB atau berkas BPHTB yang menunjukkan NOP dan luas Tanah/Bangunan yang tepat',
                'Bukti Pelunasan',
            ],
            note: '*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum',
            warning:
                'Layanan validasi PPh penyelesaiannya menunggu hasil proses konfirmasi dengan Kantor Pelayanan Pajak',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-12 md:px-8 dark:bg-zinc-950">
            <div className="mx-auto max-w-4xl">
                {/* HEADER SECTION */}
                <div className="mb-12 flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end dark:border-zinc-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                            <MapPin className="h-4 w-4" />
                            KPKNL BOGOR
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl dark:text-white">
                            Persyaratan Dokumen
                        </h1>
                        <p className="max-w-xl text-lg text-slate-500 dark:text-slate-400">
                            Lengkapi berkas Anda untuk mempercepat proses
                            layanan pasca lelang.
                        </p>
                    </div>

                    {/* TOMBOL DOWNLOAD PDF UTAMA */}
                    <a
                        href="pdf/syarat_layanan_lelang.pdf"
                        download
                        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 bg-white px-6 py-4 font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white active:scale-95 dark:bg-zinc-900 dark:text-indigo-400"
                    >
                        <FileDown className="h-5 w-5" />
                        Unduh PDF
                    </a>
                </div>

                {/* CONTENT CARDS */}
                <div className="space-y-6">
                    {data.map((section, idx) => (
                        <div
                            key={idx}
                            className="group rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-900"
                        >
                            <div className="flex flex-col gap-8 md:flex-row">
                                {/* Side Icon */}
                                <div className="hidden flex-col items-center md:flex">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                        {section.icon}
                                    </div>
                                    <div className="mt-4 h-full w-px bg-slate-100 dark:bg-zinc-800"></div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {section.title}
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {section.items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 rounded-xl border border-transparent bg-slate-50/50 p-3 text-slate-600 transition-colors hover:border-slate-200 dark:bg-zinc-800/50 dark:text-slate-300 dark:hover:border-zinc-700"
                                            >
                                                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                                                <span className="text-sm leading-relaxed">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Additional Notices */}
                                    <div className="mt-4 space-y-3">
                                        {section.note && (
                                            <p className="px-1 text-[11px] leading-relaxed text-slate-400 italic">
                                                {section.note}
                                            </p>
                                        )}
                                        {section.info && (
                                            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs font-semibold text-blue-700 dark:border-blue-900/20 dark:bg-blue-900/10 dark:text-blue-300">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                {section.info}
                                            </div>
                                        )}
                                        {section.warning && (
                                            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-xs font-semibold text-amber-700 dark:border-amber-900/20 dark:bg-amber-900/10 dark:text-amber-300">
                                                <Info className="h-4 w-4 shrink-0" />
                                                {section.warning}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FINAL CTA BOX */}
                <div className="relative mt-16 overflow-hidden rounded-[3rem] bg-[#0F3D7A] p-8 text-white md:p-12">
                    {/* Decorative Background Circles */}
                    <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-bold text-cyan-400 italic">
                                Penting!
                            </h3>
                            <p className="max-w-sm text-indigo-100">
                                Harap pastikan semua dokumen dalam keadaan
                                bersih dan terbaca dengan jelas sebelum
                                diserahkan.
                            </p>
                        </div>
                        <button className="w-full rounded-2xl bg-cyan-400 px-8 py-4 font-black text-[#0F3D7A] shadow-xl shadow-cyan-900/20 transition-all hover:bg-cyan-500 active:scale-95 md:w-auto">
                            KONSULTASI PETUGAS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Persyaratan;
