'use client';

import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

import { BasicInfoSection } from '@/features/permohonan-form/components/basic-info-section';
import { DetailSection } from '@/features/permohonan-form/components/detail-section';
import { usePermohonanForm } from '@/features/permohonan-form/use-permohonan-form';

const FormPage = () => {
    const form = usePermohonanForm();

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
            <Head title=" Formulir " />

            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:px-6">
                <div className="mx-auto flex max-w-5xl items-center gap-4">
                    <Link
                        href="/"
                        aria-label="Kembali ke halaman utama"
                        className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <span className="text-sm font-black tracking-widest text-blue-800 uppercase">
                        Formulir
                    </span>
                </div>
            </nav>

            <main className="mx-auto mt-8 max-w-4xl px-4 md:mt-12">
                {form.successMessage && (
                    <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <p className="text-sm font-bold">
                                {form.successMessage}
                            </p>
                        </div>
                    </div>
                )}

                {form.serverErrors.length > 0 && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 font-bold">
                            <AlertCircle className="h-5 w-5" />
                            <span>Periksa kembali data Anda:</span>
                        </div>
                        <ul className="list-inside list-disc space-y-1 text-sm font-semibold">
                            {form.serverErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-8 grid grid-cols-2 gap-3">
                    <div
                        className={`h-2 rounded-full ${
                            form.step >= 1 ? 'bg-blue-700' : 'bg-slate-200'
                        }`}
                    />
                    <div
                        className={`h-2 rounded-full ${
                            form.step >= 2 ? 'bg-blue-700' : 'bg-slate-200'
                        }`}
                    />
                </div>

                <form
                    onSubmit={form.handleSubmit(form.onSubmit)}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70"
                >
                    <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white md:px-8">
                        <p className="text-xs font-black tracking-widest text-blue-200 uppercase">
                            KPKNL Bogor
                        </p>
                        <h1 className="mt-1 text-2xl font-black">
                            Dokumen Pasca Lelang Bogor Bageur
                        </h1>
                    </div>

                    <div className="space-y-7 p-6 md:p-8">
                        {form.step === 1 && (
                            <BasicInfoSection
                                fieldHelpers={form.fieldHelpers}
                                fileInputHelpers={form.fileInputHelpers}
                                goToSlideTwo={form.goToSlideTwo}
                            />
                        )}

                        {form.step === 2 && (
                            <DetailSection
                                applicantRole={form.applicantRole}
                                fieldHelpers={form.fieldHelpers}
                                fileInputHelpers={form.fileInputHelpers}
                                isSubmitting={form.isSubmitting}
                                selectedRlObject={form.selectedRlObject}
                                selectedService={form.selectedService}
                                setStep={form.setStep}
                            />
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
};

export default FormPage;
