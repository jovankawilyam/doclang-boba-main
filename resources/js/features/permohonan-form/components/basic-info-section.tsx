import { ArrowRight } from 'lucide-react';

import { inputClassName, labelClassName } from '../constants';
import type { FieldHelpers, FileInputHelpers } from '../types';
import { TextAreaField, TextField, UploadZone } from './form-fields';

export const BasicInfoSection = ({
    fieldHelpers,
    fileInputHelpers,
    goToSlideTwo,
}: {
    fieldHelpers: FieldHelpers;
    fileInputHelpers: FileInputHelpers;
    goToSlideTwo: () => Promise<void>;
}) => {
    const { register, renderError } = fieldHelpers;

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-950">
                    Slide 1. Informasi Dasar Pemohon
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    Lengkapi identitas pemohon sebelum masuk ke detail layanan.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextField
                    form={fieldHelpers}
                    name="email_pemohon"
                    label="Masukkan Email"
                    type="email"
                    placeholder="nama@email.com"
                />
                <TextField
                    form={fieldHelpers}
                    name="nama_pemohon"
                    label="Nama Pemohon"
                />
                <div className="space-y-2">
                    <label
                        htmlFor="jenis_identitas_pemohon"
                        className={labelClassName}
                    >
                        Jenis Identitas Pemohon *
                    </label>
                    <select
                        id="jenis_identitas_pemohon"
                        className={inputClassName}
                        {...register('jenis_identitas_pemohon')}
                    >
                        <option value="KTP">KTP</option>
                        <option value="SIM">SIM</option>
                        <option value="NPWP">NPWP</option>
                    </select>
                    {renderError('jenis_identitas_pemohon')}
                </div>
                <TextField
                    form={fieldHelpers}
                    name="nomor_identitas_pemohon"
                    label="Nomor Identitas Pemohon"
                    inputMode="numeric"
                    pattern="[0-9]*"
                />
                <div className="md:col-span-2">
                    <TextAreaField
                        form={fieldHelpers}
                        name="alamat_pemohon"
                        label="Alamat Pemohon"
                    />
                </div>
                <TextField
                    form={fieldHelpers}
                    name="nomor_wa_pemohon"
                    label="Nomor WhatsApp Pemohon"
                    placeholder="08..."
                />
                <UploadZone
                    form={fileInputHelpers}
                    name="dokumen_identitas_pemohon"
                    label="Document Identitas Pemohon"
                    note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                />
            </div>

            <button
                type="button"
                onClick={goToSlideTwo}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 focus:outline-none"
            >
                Next Slide
                <ArrowRight className="h-5 w-5" />
            </button>
        </section>
    );
};
