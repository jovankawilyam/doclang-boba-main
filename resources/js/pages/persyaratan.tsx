import React from 'react';
import { FileCheck, ClipboardList, ShieldCheck, AlertCircle, Info, ChevronRight, FileDown, MapPin } from 'lucide-react';

const Persyaratan: React.FC = () => {
    const data = [
        {
            title: "Pemberian Kuitansi Pembayaran Harga Lelang",
            icon: <ClipboardList className="w-6 h-6 text-indigo-600" />,
            items: [
                "Fotokopi KTP",
                "Surat Kuasa (jika dikuasakan)",
                "Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
                "Bukti Pelunasan"
            ],
            note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum"
        },
        {
            title: "Pemberian Kutipan Risalah Lelang",
            icon: <FileCheck className="w-6 h-6 text-indigo-600" />,
            items: [
                "Fotokopi KTP",
                "Surat Kuasa (jika dikuasakan)",
                "Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
                "Kuitansi Pembayaran Harga Lelang",
                "Asli Bukti Validasi SSPD BPHTB yang telah disetujui**",
                "Meterai sebanyak 2 buah"
            ],
            note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum\n**Validasi BPHTB untuk objek lelang berupa tanah dan/atau bangunan",
            info: "Hardcopy dokumen persyaratan harap dilampirkan pada saat pengambilan"
        },
        {
            title: "Validasi PPh (1 Bidang)",
            icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
            items: [
                "Fotokopi KTP",
                "Surat Kuasa (jika dikuasakan)",
                "Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*",
                "Kuitansi Pembayaran Harga Lelang",
                "Slip setor PPh",
                "Slip setor PBB atau berkas BPHTB yang menunjukkan NOP dan luas Tanah/Bangunan yang tepat",
                "Bukti Pelunasan"
            ],
            note: "*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum",
            warning: "Layanan validasi PPh penyelesaiannya menunggu hasil proses konfirmasi dengan Kantor Pelayanan Pajak"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 dark:border-zinc-800 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs">
                            <MapPin className="w-4 h-4" />
                            KPKNL BOGOR
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Persyaratan Dokumen
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
                            Lengkapi berkas Anda untuk mempercepat proses layanan pasca lelang.
                        </p>
                    </div>

                    {/* TOMBOL DOWNLOAD PDF UTAMA */}
                    <a 
                        href="pdf/syarat_layanan_lelang.pdf" 
                        download
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-zinc-900 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <FileDown className="w-5 h-5" />
                        Unduh PDF
                    </a>
                </div>

                {/* CONTENT CARDS */}
                <div className="space-y-6">
                    {data.map((section, idx) => (
                        <div key={idx} className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-zinc-800 transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Side Icon */}
                                <div className="hidden md:flex flex-col items-center">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        {section.icon}
                                    </div>
                                    <div className="w-px h-full bg-slate-100 dark:bg-zinc-800 mt-4"></div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {section.title}
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {section.items.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-colors">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                <span className="text-sm leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Additional Notices */}
                                    <div className="space-y-3 mt-4">
                                        {section.note && (
                                            <p className="text-[11px] text-slate-400 italic leading-relaxed px-1">
                                                {section.note}
                                            </p>
                                        )}
                                        {section.info && (
                                            <div className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-semibold border border-blue-100 dark:border-blue-900/20">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                {section.info}
                                            </div>
                                        )}
                                        {section.warning && (
                                            <div className="flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 rounded-2xl text-xs font-semibold border border-amber-100 dark:border-amber-900/20">
                                                <Info className="w-4 h-4 shrink-0" />
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
                <div className="mt-16 overflow-hidden relative bg-[#0F3D7A] rounded-[3rem] p-8 md:p-12 text-white">
                    {/* Decorative Background Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="text-center md:text-left space-y-2">
                            <h3 className="text-2xl font-bold italic text-cyan-400">Penting!</h3>
                            <p className="text-indigo-100 max-w-sm">
                                Harap pastikan semua dokumen dalam keadaan bersih dan terbaca dengan jelas sebelum diserahkan.
                            </p>
                        </div>
                        <button className="w-full md:w-auto px-8 py-4 bg-cyan-400 hover:bg-cyan-500 text-[#0F3D7A] rounded-2xl font-black transition-all shadow-xl shadow-cyan-900/20 active:scale-95">
                            KONSULTASI PETUGAS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Persyaratan;