import { Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    Send,
    ArrowRight,
    Upload,
    AlertCircle,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';

const FormPage = () => {
    const [step, setStep] = useState(1);
    const [userRole, setUserRole] = useState<'pemenang' | 'kuasa' | ''>('');
    const [errors, setErrors] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        // Data Pemohon (Step 1)
        email: '',
        namaPemohon: '',
        jenisIdentitas: 'KTP',
        nomorIdentitas: '',
        alamatPemohon: '',
        nomorWa: '',
        // Data Pemberi Kuasa (Hanya jika pilih Kuasa)
        namaPemberiKuasa: '',
        jenisIdentitasPemberi: 'KTP',
        nomorIdentitasPemberi: '',
        alamatPemberiKuasa: '',
        nomorWaPemberi: '',
        // Data Lelang (Step 3)
        kodeLot: '',
        jenisLayanan: '',
        tanggalPelunasan: '',
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep1 = () => {
        const errs = [];
        if (!formData.email) errs.push('Email wajib diisi');
        if (!formData.namaPemohon) errs.push('Nama Pemohon wajib diisi');
        if (!formData.nomorIdentitas) errs.push('Nomor Identitas wajib diisi');
        if (!formData.alamatPemohon) errs.push('Alamat wajib diisi');
        if (!formData.nomorWa) errs.push('Nomor WhatsApp wajib diisi');

        setErrors(errs);
        if (errs.length === 0) {
            setStep(2);
            window.scrollTo(0, 0);
        }
    };

    const validateFinal = () => {
        const errs = [];
        if (userRole === 'kuasa') {
            if (!formData.namaPemberiKuasa)
                errs.push('Nama Pemberi Kuasa wajib diisi');
            if (!formData.nomorIdentitasPemberi)
                errs.push('Nomor Identitas Pemberi Kuasa wajib diisi');
        }
        if (!formData.kodeLot) errs.push('Kode Lot Lelang wajib diisi');
        if (!formData.jenisLayanan) errs.push('Jenis Layanan wajib dipilih');
        if (!formData.tanggalPelunasan)
            errs.push('Tanggal Pelunasan wajib diisi');

        setErrors(errs);
        if (errs.length === 0) alert('Data berhasil dikirim!');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
            <Head title="Form Doclang Boba" />

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 py-6 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center gap-4">
                    <Link
                        href="/"
                        className="rounded-full p-2 transition-colors hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <span className="font-black tracking-widest text-indigo-600 uppercase">
                        Doclang Boba Form
                    </span>
                </div>
            </nav>

            <div className="mx-auto mt-12 max-w-3xl px-4">
                {/* VALIDATION BOX */}
                {errors.length > 0 && (
                    <div className="animate-bounce-short mb-6 rounded-r-xl border-l-4 border-red-500 bg-red-50 p-4">
                        <div className="mb-2 flex items-center gap-2 font-bold text-red-700">
                            <AlertCircle className="h-5 w-5" />{' '}
                            <span>Periksa kembali data anda:</span>
                        </div>
                        <ul className="list-inside list-disc text-sm font-medium text-red-600">
                            {errors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* PROGRESS BAR */}
                <div className="mb-10 flex items-center justify-center gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-2 w-16 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>

                <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl">
                    <div className="h-3 bg-gradient-to-r from-indigo-600 to-cyan-500"></div>

                    <div className="p-8 md:p-12">
                        {/* STEP 1: IDENTITAS PEMOHON */}
                        {step === 1 && (
                            <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-right-8">
                                <h2 className="mb-6 text-2xl font-black text-slate-900">
                                    1. Identitas Pemohon
                                </h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">
                                            Email *
                                        </label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900 outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">
                                            Nama Pemohon *
                                        </label>
                                        <input
                                            name="namaPemohon"
                                            value={formData.namaPemohon}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900 outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700">
                                                Jenis Identitas *
                                            </label>
                                            <select
                                                name="jenisIdentitas"
                                                value={formData.jenisIdentitas}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900"
                                            >
                                                <option value="KTP">KTP</option>
                                                <option value="SIM">SIM</option>
                                                <option value="NPWP">
                                                    NPWP
                                                </option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700">
                                                Nomor Identitas *
                                            </label>
                                            <input
                                                name="nomorIdentitas"
                                                value={formData.nomorIdentitas}
                                                onChange={handleChange}
                                                className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900 outline-none focus:border-indigo-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">
                                            Alamat Pemohon *
                                        </label>
                                        <textarea
                                            name="alamatPemohon"
                                            value={formData.alamatPemohon}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900 outline-none focus:border-indigo-600"
                                        ></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700">
                                            Nomor WhatsApp *
                                        </label>
                                        <input
                                            name="nomorWa"
                                            value={formData.nomorWa}
                                            onChange={handleChange}
                                            placeholder="08..."
                                            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900 outline-none focus:border-indigo-600"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={validateStep1}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-5 font-black text-white shadow-lg transition-all hover:bg-indigo-700"
                                >
                                    Lanjut Pilih Peran{' '}
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: PILIH PERAN */}
                        {step === 2 && (
                            <div className="animate-in space-y-8 text-center duration-500 zoom-in-95 fade-in">
                                <h2 className="text-2xl font-black text-slate-900">
                                    2. Pilih Peran Anda
                                </h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <button
                                        onClick={() => {
                                            setUserRole('pemenang');
                                            setStep(3);
                                        }}
                                        className="group flex flex-col items-center gap-4 rounded-[2rem] border-4 border-gray-100 bg-white p-8 transition-all hover:border-indigo-600 hover:bg-indigo-50"
                                    >
                                        <UserCheck className="h-12 w-12 text-indigo-600 transition-transform group-hover:scale-110" />
                                        <span className="font-black text-slate-800">
                                            Pemenang Lelang
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setUserRole('kuasa');
                                            setStep(3);
                                        }}
                                        className="group flex flex-col items-center gap-4 rounded-[2rem] border-4 border-gray-100 bg-white p-8 transition-all hover:border-indigo-600 hover:bg-indigo-50"
                                    >
                                        <Users className="h-12 w-12 text-indigo-600 transition-transform group-hover:scale-110" />
                                        <span className="font-black text-slate-800">
                                            Penerima Kuasa
                                        </span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="font-bold text-slate-400 transition-colors hover:text-indigo-600"
                                >
                                    Kembali ke Identitas Pemohon
                                </button>
                            </div>
                        )}

                        {/* STEP 3: DETAIL LELANG & KUASA */}
                        {step === 3 && (
                            <div className="animate-in space-y-6 duration-500 fade-in slide-in-from-right-8">
                                <h2 className="mb-6 text-2xl font-black text-slate-900">
                                    3. Detail Pengajuan (
                                    {userRole === 'pemenang'
                                        ? 'Pemenang'
                                        : 'Kuasa'}
                                    )
                                </h2>

                                {userRole === 'kuasa' && (
                                    <div className="space-y-5 rounded-[2rem] border-2 border-indigo-100 bg-indigo-50/50 p-6">
                                        <p className="text-xs font-black tracking-widest text-indigo-600 uppercase">
                                            Data Pemberi Kuasa
                                        </p>
                                        <input
                                            name="namaPemberiKuasa"
                                            onChange={handleChange}
                                            placeholder="Nama Pemberi Kuasa *"
                                            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 font-bold text-slate-900"
                                        />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400">
                                                Jenis Identitas Pemberi Kuasa *
                                            </label>
                                            <select
                                                name="jenisIdentitasPemberi"
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-bold text-slate-900"
                                            >
                                                <option value="KTP">KTP</option>
                                                <option value="SIM">SIM</option>
                                                <option value="Akta Pendirian">
                                                    Akta Pendirian Perusahaan
                                                    (Badan Hukum)
                                                </option>
                                            </select>
                                        </div>
                                        <input
                                            name="nomorIdentitasPemberi"
                                            onChange={handleChange}
                                            placeholder="Nomor Identitas Pemberi Kuasa *"
                                            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 font-bold text-slate-900"
                                        />
                                        <textarea
                                            name="alamatPemberiKuasa"
                                            onChange={handleChange}
                                            placeholder="Alamat Pemberi Kuasa *"
                                            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 font-bold text-slate-900"
                                            rows={2}
                                        ></textarea>
                                        <input
                                            name="nomorWaPemberi"
                                            onChange={handleChange}
                                            placeholder="Nomor WhatsApp Pemberi Kuasa *"
                                            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 font-bold text-slate-900"
                                        />

                                        <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
                                            <label className="cursor-pointer rounded-xl border border-dashed border-indigo-300 bg-white p-4">
                                                <Upload className="mx-auto mb-1 h-4 w-4 text-indigo-400" />
                                                <span className="text-[10px] font-black text-slate-500">
                                                    ID Pemberi Kuasa (PDF/IMG
                                                    15MB)
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                />
                                            </label>
                                            <label className="cursor-pointer rounded-xl border border-dashed border-indigo-300 bg-white p-4">
                                                <Upload className="mx-auto mb-1 h-4 w-4 text-indigo-400" />
                                                <span className="text-[10px] font-black text-slate-500">
                                                    Surat Kuasa (PDF/IMG 15MB)
                                                </span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                                        Detail Objek Lelang
                                    </p>
                                    <input
                                        name="kodeLot"
                                        onChange={handleChange}
                                        placeholder="Kode Lot Lelang *"
                                        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900"
                                    />
                                    <select
                                        name="jenisLayanan"
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900"
                                    >
                                        <option value="">
                                            Pilih Jenis Layanan *
                                        </option>
                                        <option>
                                            Pemberian Kuitansi Pembayaran Harga
                                            Lelang
                                        </option>
                                        <option>
                                            Pemberian Kutipan Risalah Lelang
                                        </option>
                                        <option>Validasi PPh (1 Bidang)</option>
                                    </select>
                                    <div>
                                        <label className="ml-1 text-[10px] font-black text-slate-500">
                                            TANGGAL PELUNASAN PEMBAYARAN *
                                        </label>
                                        <input
                                            name="tanggalPelunasan"
                                            type="date"
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-5 py-4 font-bold text-slate-900"
                                        />
                                    </div>
                                    <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition-colors hover:bg-gray-100">
                                        <Upload className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                                        <p className="text-xs font-black text-slate-600">
                                            Upload Bukti Pelunasan (PDF/IMG Max
                                            15MB)
                                        </p>
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="rounded-2xl bg-gray-100 px-8 py-5 font-black text-slate-600"
                                    >
                                        Ganti Peran
                                    </button>
                                    <button
                                        onClick={validateFinal}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1E56A0] py-5 font-black text-white shadow-xl hover:bg-[#0F3D7A]"
                                    >
                                        <Send className="h-5 w-5" /> KIRIM
                                        PERMOHONAN
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
