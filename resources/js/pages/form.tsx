"use client";

import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Send, ArrowRight, Upload, AlertCircle, UserCheck, Users } from 'lucide-react';

const FormPage = () => {
    const [step, setStep] = useState(1);
    const [userRole, setUserRole] = useState<"pemenang" | "kuasa" | "">("");
    const [errors, setErrors] = useState<string[]>([]);
    
    const [formData, setFormData] = useState({
        // Data Pemohon (Step 1)
        email: "", namaPemohon: "", jenisIdentitas: "KTP", nomorIdentitas: "", alamatPemohon: "", nomorWa: "",
        // Data Pemberi Kuasa (Hanya jika pilih Kuasa)
        namaPemberiKuasa: "", jenisIdentitasPemberi: "KTP", nomorIdentitasPemberi: "", alamatPemberiKuasa: "", nomorWaPemberi: "",
        // Data Lelang (Step 3)
        kodeLot: "", jenisLayanan: "", tanggalPelunasan: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep1 = () => {
        const errs = [];
        if (!formData.email) errs.push("Email wajib diisi");
        if (!formData.namaPemohon) errs.push("Nama Pemohon wajib diisi");
        if (!formData.nomorIdentitas) errs.push("Nomor Identitas wajib diisi");
        if (!formData.alamatPemohon) errs.push("Alamat wajib diisi");
        if (!formData.nomorWa) errs.push("Nomor WhatsApp wajib diisi");
        
        setErrors(errs);
        if (errs.length === 0) { setStep(2); window.scrollTo(0, 0); }
    };

    const validateFinal = () => {
        const errs = [];
        if (userRole === "kuasa") {
            if (!formData.namaPemberiKuasa) errs.push("Nama Pemberi Kuasa wajib diisi");
            if (!formData.nomorIdentitasPemberi) errs.push("Nomor Identitas Pemberi Kuasa wajib diisi");
        }
        if (!formData.kodeLot) errs.push("Kode Lot Lelang wajib diisi");
        if (!formData.jenisLayanan) errs.push("Jenis Layanan wajib dipilih");
        if (!formData.tanggalPelunasan) errs.push("Tanggal Pelunasan wajib diisi");

        setErrors(errs);
        if (errs.length === 0) alert("Data berhasil dikirim!");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
            <Head title="Form Doclang Boba" />

            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-200 py-6 px-6 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <span className="font-black text-indigo-600 uppercase tracking-widest">Doclang Boba Form</span>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto mt-12 px-4">
                {/* VALIDATION BOX */}
                {errors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl animate-bounce-short">
                        <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
                            <AlertCircle className="w-5 h-5" /> <span>Periksa kembali data anda:</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-600 font-medium">
                            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                        </ul>
                    </div>
                )}

                {/* PROGRESS BAR */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-2 w-16 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-indigo-600 to-cyan-500"></div>
                    
                    <div className="p-8 md:p-12">
                        {/* STEP 1: IDENTITAS PEMOHON */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-2xl font-black text-slate-900 mb-6">1. Identitas Pemohon</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">Email *</label>
                                        <input name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold focus:border-indigo-600 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">Nama Pemohon *</label>
                                        <input name="namaPemohon" value={formData.namaPemohon} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold focus:border-indigo-600 outline-none" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700">Jenis Identitas *</label>
                                            <select name="jenisIdentitas" value={formData.jenisIdentitas} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold">
                                                <option value="KTP">KTP</option>
                                                <option value="SIM">SIM</option>
                                                <option value="NPWP">NPWP</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700">Nomor Identitas *</label>
                                            <input name="nomorIdentitas" value={formData.nomorIdentitas} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold focus:border-indigo-600 outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">Alamat Pemohon *</label>
                                        <textarea name="alamatPemohon" value={formData.alamatPemohon} onChange={handleChange} rows={2} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold focus:border-indigo-600 outline-none"></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">Nomor WhatsApp *</label>
                                        <input name="nomorWa" value={formData.nomorWa} onChange={handleChange} placeholder="08..." className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold focus:border-indigo-600 outline-none" />
                                    </div>
                                </div>
                                <button onClick={validateStep1} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg transition-all">
                                    Lanjut Pilih Peran <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: PILIH PERAN */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
                                <h2 className="text-2xl font-black text-slate-900">2. Pilih Peran Anda</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button 
                                        onClick={() => { setUserRole("pemenang"); setStep(3); }}
                                        className="group p-8 rounded-[2rem] border-4 border-gray-100 hover:border-indigo-600 transition-all bg-white hover:bg-indigo-50 flex flex-col items-center gap-4"
                                    >
                                        <UserCheck className="w-12 h-12 text-indigo-600 group-hover:scale-110 transition-transform" />
                                        <span className="font-black text-slate-800">Pemenang Lelang</span>
                                    </button>
                                    <button 
                                        onClick={() => { setUserRole("kuasa"); setStep(3); }}
                                        className="group p-8 rounded-[2rem] border-4 border-gray-100 hover:border-indigo-600 transition-all bg-white hover:bg-indigo-50 flex flex-col items-center gap-4"
                                    >
                                        <Users className="w-12 h-12 text-indigo-600 group-hover:scale-110 transition-transform" />
                                        <span className="font-black text-slate-800">Penerima Kuasa</span>
                                    </button>
                                </div>
                                <button onClick={() => setStep(1)} className="text-slate-400 font-bold hover:text-indigo-600 transition-colors">Kembali ke Identitas Pemohon</button>
                            </div>
                        )}

                        {/* STEP 3: DETAIL LELANG & KUASA */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-2xl font-black text-slate-900 mb-6">3. Detail Pengajuan ({userRole === "pemenang" ? "Pemenang" : "Kuasa"})</h2>
                                
                                {userRole === "kuasa" && (
                                    <div className="p-6 bg-indigo-50/50 rounded-[2rem] border-2 border-indigo-100 space-y-5">
                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Data Pemberi Kuasa</p>
                                        <input name="namaPemberiKuasa" onChange={handleChange} placeholder="Nama Pemberi Kuasa *" className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-slate-900 font-bold" />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400">Jenis Identitas Pemberi Kuasa *</label>
                                            <select name="jenisIdentitasPemberi" onChange={handleChange} className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-slate-900 font-bold text-sm">
                                                <option value="KTP">KTP</option>
                                                <option value="SIM">SIM</option>
                                                <option value="Akta Pendirian">Akta Pendirian Perusahaan (Badan Hukum)</option>
                                            </select>
                                        </div>
                                        <input name="nomorIdentitasPemberi" onChange={handleChange} placeholder="Nomor Identitas Pemberi Kuasa *" className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-slate-900 font-bold" />
                                        <textarea name="alamatPemberiKuasa" onChange={handleChange} placeholder="Alamat Pemberi Kuasa *" className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-slate-900 font-bold" rows={2}></textarea>
                                        <input name="nomorWaPemberi" onChange={handleChange} placeholder="Nomor WhatsApp Pemberi Kuasa *" className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-slate-900 font-bold" />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                            <label className="p-4 bg-white border border-dashed border-indigo-300 rounded-xl cursor-pointer">
                                                <Upload className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                                                <span className="text-[10px] font-black text-slate-500">ID Pemberi Kuasa (PDF/IMG 15MB)</span>
                                                <input type="file" className="hidden" />
                                            </label>
                                            <label className="p-4 bg-white border border-dashed border-indigo-300 rounded-xl cursor-pointer">
                                                <Upload className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                                                <span className="text-[10px] font-black text-slate-500">Surat Kuasa (PDF/IMG 15MB)</span>
                                                <input type="file" className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Objek Lelang</p>
                                    <input name="kodeLot" onChange={handleChange} placeholder="Kode Lot Lelang *" className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold" />
                                    <select name="jenisLayanan" onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold">
                                        <option value="">Pilih Jenis Layanan *</option>
                                        <option>Pemberian Kuitansi Pembayaran Harga Lelang</option>
                                        <option>Pemberian Kutipan Risalah Lelang</option>
                                        <option>Validasi PPh (1 Bidang)</option>
                                    </select>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 ml-1">TANGGAL PELUNASAN PEMBAYARAN *</label>
                                        <input name="tanggalPelunasan" type="date" onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-slate-900 font-bold" />
                                    </div>
                                    <label className="block p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                                        <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                                        <p className="text-xs font-black text-slate-600">Upload Bukti Pelunasan (PDF/IMG Max 15MB)</p>
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button onClick={() => setStep(2)} className="px-8 py-5 bg-gray-100 text-slate-600 font-black rounded-2xl">Ganti Peran</button>
                                    <button onClick={validateFinal} className="flex-1 bg-[#1E56A0] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#0F3D7A] shadow-xl">
                                        <Send className="w-5 h-5" /> KIRIM PERMOHONAN
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormPage;