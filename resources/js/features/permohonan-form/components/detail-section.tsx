import { FileText, Loader2, Send } from 'lucide-react';

import {
    inputClassName,
    labelClassName,
    sectionClassName,
    serviceOptions,
} from '../constants';
import type {
    ApplicantRole,
    FieldHelpers,
    FileInputHelpers,
    RlObjectType,
    ServiceType,
} from '../types';
import { TextAreaField, TextField, UploadZone } from './form-fields';

export const DetailSection = ({
    applicantRole,
    fieldHelpers,
    fileInputHelpers,
    isSubmitting,
    selectedRlObject,
    selectedService,
    setStep,
}: {
    applicantRole?: ApplicantRole;
    fieldHelpers: FieldHelpers;
    fileInputHelpers: FileInputHelpers;
    isSubmitting: boolean;
    selectedRlObject?: RlObjectType;
    selectedService?: ServiceType;
    setStep: (step: 1 | 2) => void;
}) => {
    const { register, renderError } = fieldHelpers;

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-950">
                    Slide 2. Detail Permohonan Dinamis
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Pilihan pada bagian ini menentukan dokumen yang wajib
                    diunggah.
                </p>
            </div>

            <div className={sectionClassName}>
                <p className={labelClassName}>Pilih Tipe Pemohon *</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 font-bold text-slate-900 transition has-[:checked]:border-slate-950 has-[:checked]:bg-slate-950 has-[:checked]:text-white">
                        <input
                            type="radio"
                            value="pemenang"
                            className="h-4 w-4"
                            {...register('peran_pemohon')}
                        />
                        Pemenang Lelang
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 font-bold text-slate-900 transition has-[:checked]:border-slate-950 has-[:checked]:bg-slate-950 has-[:checked]:text-white">
                        <input
                            type="radio"
                            value="kuasa"
                            className="h-4 w-4"
                            {...register('peran_pemohon')}
                        />
                        Penerima Kuasa
                    </label>
                </div>
                {renderError('peran_pemohon')}
            </div>

            {applicantRole === 'kuasa' && (
                <div className={sectionClassName}>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-700" />
                        <h3 className="font-black text-slate-950">
                            Data Pemberi Kuasa
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <TextField
                            form={fieldHelpers}
                            name="nama_pemberi_kuasa"
                            label="Nama Pemberi Kuasa"
                        />
                        <div className="space-y-2">
                            <label
                                htmlFor="jenis_identitas_pemberi_kuasa"
                                className={labelClassName}
                            >
                                Jenis Identitas Pemberi Kuasa *
                            </label>
                            <select
                                id="jenis_identitas_pemberi_kuasa"
                                className={inputClassName}
                                {...register('jenis_identitas_pemberi_kuasa')}
                            >
                                <option value="KTP">KTP</option>
                                <option value="SIM">SIM</option>
                                <option value="Akta Pendirian">
                                    Akta Pendirian Perusahaan
                                </option>
                            </select>
                        </div>
                        <TextField
                            form={fieldHelpers}
                            name="nomor_identitas_pemberi_kuasa"
                            label="Nomor Identitas Pemberi Kuasa"
                        />
                        <TextField
                            form={fieldHelpers}
                            name="nomor_wa_pemberi_kuasa"
                            label="Nomor WhatsApp Pemberi Kuasa"
                            placeholder="08..."
                        />
                        <div className="md:col-span-2">
                            <TextAreaField
                                form={fieldHelpers}
                                name="alamat_pemberi_kuasa"
                                label="Alamat Pemberi Kuasa"
                            />
                        </div>
                        <UploadZone
                            form={fileInputHelpers}
                            name="dokumen_identitas_pemberi_kuasa"
                            label="Document Identitas Pemberi Kuasa"
                            note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                        />
                        <UploadZone
                            form={fileInputHelpers}
                            name="surat_kuasa"
                            label="Surat Kuasa"
                            note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                        />
                    </div>
                </div>
            )}

            <div className={sectionClassName}>
                <h3 className="font-black text-slate-950">Inputan Bersama</h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <TextField
                        form={fieldHelpers}
                        name="kode_lot_lelang"
                        label="Code Lot Lelang"
                        note="diisi dengan 6 digit kode lot lelang yang telah diikuti pada situs www.lelang.go.id"
                    />
                    <div className="space-y-2">
                        <label
                            htmlFor="jenis_layanan"
                            className={labelClassName}
                        >
                            Jenis Layanan *
                        </label>
                        <select
                            id="jenis_layanan"
                            className={inputClassName}
                            {...register('jenis_layanan')}
                        >
                            <option value="">Pilih jenis layanan</option>
                            {serviceOptions.map((service) => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                        {renderError('jenis_layanan')}
                    </div>
                    <TextField
                        form={fieldHelpers}
                        name="tanggal_pelunasan"
                        label="Tanggal Pelunasan Pembayaran"
                        type="date"
                    />
                </div>
            </div>

            {selectedService ===
                'Pemberian Kuitansi Pembayaran Harga Lelang' && (
                <div className={sectionClassName}>
                    <UploadZone
                        form={fileInputHelpers}
                        name="bukti_pelunasan_file"
                        label="Upload Bukti Pelunasan"
                        note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                    />
                </div>
            )}

            {selectedService === 'Pemberian Kutipan Risalah Lelang' && (
                <div className={sectionClassName}>
                    <p className={labelClassName}>
                        Jenis Objek Risalah Lelang *
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 font-bold text-slate-900 transition has-[:checked]:border-slate-950 has-[:checked]:bg-slate-950 has-[:checked]:text-white">
                            <input
                                type="radio"
                                value="tanah_bangunan"
                                className="h-4 w-4"
                                {...register('jenis_objek_risalah')}
                            />
                            a. Tanah/Bangunan
                        </label>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 font-bold text-slate-900 transition has-[:checked]:border-slate-950 has-[:checked]:bg-slate-950 has-[:checked]:text-white">
                            <input
                                type="radio"
                                value="kendaraan"
                                className="h-4 w-4"
                                {...register('jenis_objek_risalah')}
                            />
                            b. Kendaraan
                        </label>
                    </div>
                    {renderError('jenis_objek_risalah')}

                    {selectedRlObject === 'tanah_bangunan' && (
                        <UploadZone
                            form={fileInputHelpers}
                            name="bukti_validasi_sspd_bphtb"
                            label="Upload Bukti Validasi SSPD BPHTB"
                            note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB. *dokumen asli agar dilampirkan pada saat pengambilan"
                        />
                    )}
                    <UploadZone
                        form={fileInputHelpers}
                        name="kuitansi_pembayaran_harga_lelang_file"
                        label="Upload Kuitansi Pembayaran Harga Lelang"
                        note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB. *jika pengajuan kutipan RL bersamaan dengan pengajuan kuitansi maka dapat menggunakan Bukti Pelunasan"
                    />
                </div>
            )}

            {selectedService === 'Validasi PPh (1 Bidang)' && (
                <ValidasiPphFields
                    fieldHelpers={fieldHelpers}
                    fileInputHelpers={fileInputHelpers}
                />
            )}

            {applicantRole && (
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={isSubmitting}
                        className="rounded-lg bg-slate-100 px-6 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-200 focus:ring-4 focus:ring-slate-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Kembali
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Kirim
                            </>
                        )}
                    </button>
                </div>
            )}
        </section>
    );
};

const ValidasiPphFields = ({
    fieldHelpers,
    fileInputHelpers,
}: {
    fieldHelpers: FieldHelpers;
    fileInputHelpers: FileInputHelpers;
}) => (
    <div className={sectionClassName}>
        <blockquote className="rounded-lg border-l-4 border-blue-700 bg-blue-50 p-4 text-sm leading-6 font-semibold text-blue-950">
            Untuk proses validasi PPH, mohon siapkan dokumen berupa: 1. NPWP
            pemenang lelang, 2. kuitansi, 3. slip setor pph, 4. slip setor pbb
            atau berkas BPHTB yang menunjukkan NOP dan luas T/B yang tepat
        </blockquote>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
                form={fieldHelpers}
                name="nomor_kuitansi_pembayaran_harga_lelang"
                label="Nomor Kuitansi Pembayaran Harga Lelang"
                placeholder="Contoh: 100/RL.150/32/2023"
            />
            <TextField
                form={fieldHelpers}
                name="nomor_objek_pajak"
                label="Nomor Objek Pajak (NOP)"
                note="Mohon input NOP pada Slip Setor PBB/berkas BPHTB"
            />
            <div className="md:col-span-2">
                <TextField
                    form={fieldHelpers}
                    name="alamat_objek_lelang"
                    label="Alamat Objek Lelang"
                    placeholder="Contoh : Jl. Kavling Mawar 3 RT.002 RW.07"
                />
            </div>
            <TextField
                form={fieldHelpers}
                name="ntpn"
                label="Nomor Transaksi Penerimaan Negara (NTPN)"
                placeholder="Contoh : 8C9ED4ESL70H8778"
            />
            <TextField
                form={fieldHelpers}
                name="npwp_pemenang_lelang"
                label="Nomor Pokok Wajib Pajak (NPWP) Pemenang Lelang"
                note="Masukkan angka saja tanpa tanda hubung/titik."
            />
            <UploadZone
                form={fileInputHelpers}
                name="kuitansi_pembayaran_harga_lelang_file"
                label="Upload Kuitansi Pembayaran Harga Lelang"
                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
            />
            <UploadZone
                form={fileInputHelpers}
                name="slip_setor_pbb_atau_bphtb"
                label="Upload Slip Setor PBB atau Berkas BPHTB"
                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB dan harus menunjukkan NOP & luas T/B yang tepat"
            />
            <UploadZone
                form={fileInputHelpers}
                name="slip_setor_pph"
                label="Upload Slip Setor PPh"
                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
            />
            <UploadZone
                form={fileInputHelpers}
                name="npwp_pemenang_lelang_file"
                label="Upload NPWP Pemenang Lelang"
                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
            />
        </div>
    </div>
);
