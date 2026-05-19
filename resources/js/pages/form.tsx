import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    Loader2,
    Send,
    Upload,
    UserCheck,
    Users,
} from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Step = 1 | 2 | 3;
type UserRole = 'pemenang' | 'kuasa' | '';
type IdentityType = 'KTP' | 'SIM' | 'NPWP';
type GrantorIdentityType = 'KTP' | 'SIM' | 'Akta Pendirian';
type FileField =
    | 'dokumenIdentitasPemohon'
    | 'buktiPelunasan'
    | 'dokumenIdentitasPemberiKuasa'
    | 'suratKuasa';

type FormDataState = {
    email: string;
    namaPemohon: string;
    jenisIdentitas: IdentityType;
    nomorIdentitas: string;
    alamatPemohon: string;
    nomorWa: string;
    nomor_wa_pemohon: string;
    dokumenIdentitasPemohon: File | null;
    namaPemberiKuasa: string;
    jenisIdentitasPemberi: GrantorIdentityType;
    nomorIdentitasPemberi: string;
    alamatPemberiKuasa: string;
    nomorWaPemberi: string;
    dokumenIdentitasPemberiKuasa: File | null;
    suratKuasa: File | null;
    kodeLot: string;
    jenisLayanan: string;
    tanggalPelunasan: string;
    buktiPelunasan: File | null;
};

type FileMeta = {
    name: string;
    size: string;
};

type StorePermohonanSuccessResponse = {
    message: string;
    id_pengajuan: string;
};

type StorePermohonanErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const FILE_ACCEPT_ATTRIBUTE = '.pdf,.jpg,.jpeg,.png';

const initialFormData: FormDataState = {
    email: '',
    namaPemohon: '',
    jenisIdentitas: 'KTP',
    nomorIdentitas: '',
    alamatPemohon: '',
    nomorWa: '',
    nomor_wa_pemohon: '',
    dokumenIdentitasPemohon: null,
    namaPemberiKuasa: '',
    jenisIdentitasPemberi: 'KTP',
    nomorIdentitasPemberi: '',
    alamatPemberiKuasa: '',
    nomorWaPemberi: '',
    dokumenIdentitasPemberiKuasa: null,
    suratKuasa: null,
    kodeLot: '',
    jenisLayanan: '',
    tanggalPelunasan: '',
    buktiPelunasan: null,
};

const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100';
const labelClassName = 'text-sm font-bold text-slate-700';
const sectionTitleClassName =
    'text-xs font-black tracking-widest text-slate-500 uppercase';

const formatFileSize = (bytes: number): string => {
    const sizeInMb = bytes / (1024 * 1024);

    return `${sizeInMb.toFixed(sizeInMb >= 1 ? 2 : 3)} MB`;
};

const getFileMeta = (file: File | null): FileMeta | null => {
    if (!file) {
        return null;
    }

    return {
        name: file.name,
        size: formatFileSize(file.size),
    };
};

const normalizeJenisLayanan = (jenisLayanan: string): string => {
    if (jenisLayanan.includes('Kuitansi')) {
        return 'kuitansi';
    }

    if (jenisLayanan.includes('Kutipan Risalah Lelang')) {
        return 'risalah_lelang';
    }

    if (jenisLayanan.includes('Validasi PPh')) {
        return 'validasi_pph';
    }

    return jenisLayanan;
};

const getCsrfToken = (): string => {
    return (
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
};

const parseResponse = async (
    response: Response,
): Promise<StorePermohonanSuccessResponse | StorePermohonanErrorResponse> => {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return (await response.json()) as
            | StorePermohonanSuccessResponse
            | StorePermohonanErrorResponse;
    }

    const body = await response.text();
    const plainText = body
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return {
        message:
            response.status === 404
                ? 'Endpoint permohonan tidak ditemukan. Buka aplikasi dari http://127.0.0.1:8000/form, bukan dari port Vite.'
                : plainText ||
                  'Permohonan gagal dikirim. Server tidak mengirim response JSON.',
    };
};

const FormPage = () => {
    const [step, setStep] = useState<Step>(1);
    const [showNavbar, setShowNavbar] = useState<boolean>(true);
    const [userRole, setUserRole] = useState<UserRole>('');
    const [errors, setErrors] = useState<string[]>([]);
    const [fileErrors, setFileErrors] = useState<
        Partial<Record<FileField, string>>
    >({});
    const [formData, setFormData] = useState<FormDataState>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const lastScrollYRef = useRef<number>(0);

    useEffect(() => {
        const controlNavbar = (): void => {
            const currentScrollY = window.scrollY;

            setShowNavbar(
                !(
                    currentScrollY > lastScrollYRef.current &&
                    currentScrollY > 50
                ),
            );
            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener('scroll', controlNavbar, { passive: true });

        return () => window.removeEventListener('scroll', controlNavbar);
    }, []);

    const selectedFiles = useMemo<Record<FileField, FileMeta | null>>(
        () => ({
            dokumenIdentitasPemohon: getFileMeta(
                formData.dokumenIdentitasPemohon,
            ),
            buktiPelunasan: getFileMeta(formData.buktiPelunasan),
            dokumenIdentitasPemberiKuasa: getFileMeta(
                formData.dokumenIdentitasPemberiKuasa,
            ),
            suratKuasa: getFileMeta(formData.suratKuasa),
        }),
        [
            formData.buktiPelunasan,
            formData.dokumenIdentitasPemohon,
            formData.dokumenIdentitasPemberiKuasa,
            formData.suratKuasa,
        ],
    );

    const validateFile = useCallback((file: File): string | null => {
        // Validasi dokumen resmi hanya mengizinkan PDF/JPG/JPEG/PNG maksimal 10MB.
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            return 'Format file tidak valid. Gunakan PDF, JPG, JPEG, atau PNG.';
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return 'Ukuran file melebihi 10MB. Silakan unggah file yang lebih kecil.';
        }

        return null;
    }, []);

    const handleChange = useCallback(
        (
            event: ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ): void => {
            const { name, value } = event.target;

            setFormData((current) => ({
                ...current,
                [name]: value,
                ...(name === 'nomorWa' ? { nomor_wa_pemohon: value } : {}),
            }));
        },
        [],
    );

    const handleFileChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>, field: FileField): void => {
            const file = event.target.files?.[0] ?? null;

            setSuccessMessage('');

            if (!file) {
                setFormData((current) => ({ ...current, [field]: null }));
                setFileErrors((current) => ({
                    ...current,
                    [field]: undefined,
                }));
                return;
            }

            const validationError = validateFile(file);

            if (validationError) {
                event.target.value = '';
                setFormData((current) => ({ ...current, [field]: null }));
                setFileErrors((current) => ({
                    ...current,
                    [field]: validationError,
                }));
                return;
            }

            // File valid langsung masuk state agar feedback sukses tampil real-time.
            setFormData((current) => ({ ...current, [field]: file }));
            setFileErrors((current) => ({ ...current, [field]: undefined }));
        },
        [validateFile],
    );

    const scrollToTop = useCallback((): void => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const validateStep1 = useCallback((): boolean => {
        const nextErrors: string[] = [];

        if (!formData.email.trim()) nextErrors.push('Email wajib diisi.');
        if (!formData.namaPemohon.trim())
            nextErrors.push('Nama Pemohon wajib diisi.');
        if (!formData.nomorIdentitas.trim())
            nextErrors.push('Nomor Identitas wajib diisi.');
        if (!formData.alamatPemohon.trim())
            nextErrors.push('Alamat wajib diisi.');
        if (!formData.nomorWa.trim())
            nextErrors.push('Nomor WhatsApp wajib diisi.');
        if (!formData.dokumenIdentitasPemohon) {
            nextErrors.push('Dokumen Identitas Pemohon wajib diunggah.');
        }

        setErrors(nextErrors);

        if (nextErrors.length > 0) {
            scrollToTop();
            return false;
        }

        setStep(2);
        scrollToTop();
        return true;
    }, [
        formData.alamatPemohon,
        formData.dokumenIdentitasPemohon,
        formData.email,
        formData.namaPemohon,
        formData.nomorIdentitas,
        formData.nomorWa,
        scrollToTop,
    ]);

    const validateFinal = useCallback((): string[] => {
        const nextErrors: string[] = [];

        if (!userRole) nextErrors.push('Peran pemohon wajib dipilih.');

        if (userRole === 'kuasa') {
            if (!formData.namaPemberiKuasa.trim()) {
                nextErrors.push('Nama Pemberi Kuasa wajib diisi.');
            }
            if (!formData.nomorIdentitasPemberi.trim()) {
                nextErrors.push('Nomor Identitas Pemberi Kuasa wajib diisi.');
            }
            if (!formData.alamatPemberiKuasa.trim()) {
                nextErrors.push('Alamat Pemberi Kuasa wajib diisi.');
            }
            if (!formData.nomorWaPemberi.trim()) {
                nextErrors.push('Nomor WhatsApp Pemberi Kuasa wajib diisi.');
            }
            if (!formData.dokumenIdentitasPemberiKuasa) {
                nextErrors.push(
                    'Dokumen Identitas Pemberi Kuasa wajib diunggah.',
                );
            }
            if (!formData.suratKuasa) {
                nextErrors.push('Surat Kuasa wajib diunggah.');
            }
        }

        if (!formData.kodeLot.trim())
            nextErrors.push('Kode Lot Lelang wajib diisi.');
        if (!formData.jenisLayanan)
            nextErrors.push('Jenis Layanan wajib dipilih.');
        if (!formData.tanggalPelunasan) {
            nextErrors.push('Tanggal Pelunasan wajib diisi.');
        }
        if (
            normalizeJenisLayanan(formData.jenisLayanan) === 'validasi_pph' &&
            !formData.buktiPelunasan
        ) {
            nextErrors.push(
                'Bukti Pelunasan wajib diunggah untuk Validasi PPh.',
            );
        }

        return nextErrors;
    }, [
        formData.alamatPemberiKuasa,
        formData.buktiPelunasan,
        formData.dokumenIdentitasPemberiKuasa,
        formData.jenisLayanan,
        formData.kodeLot,
        formData.namaPemberiKuasa,
        formData.nomorIdentitasPemberi,
        formData.nomorWaPemberi,
        formData.suratKuasa,
        formData.tanggalPelunasan,
        userRole,
    ]);

    const resetForm = useCallback((): void => {
        setFormData(initialFormData);
        setUserRole('');
        setStep(1);
        setFileErrors({});
    }, []);

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>): Promise<void> => {
            event.preventDefault();

            if (isSubmitting) {
                return;
            }

            const validationErrors = validateFinal();
            setErrors(validationErrors);

            if (validationErrors.length > 0) {
                scrollToTop();
                return;
            }

            const payload = new FormData();
            payload.append('peran_pemohon', userRole);
            payload.append('email_pemohon', formData.email.trim());
            payload.append('jenis_identitas_pemohon', formData.jenisIdentitas);
            payload.append(
                'nomor_identitas_pemohon',
                formData.nomorIdentitas.trim(),
            );
            payload.append('alamat_pemohon', formData.alamatPemohon.trim());
            payload.append('nama_pemohon', formData.namaPemohon.trim());
            payload.append(
                'nomor_wa_pemohon',
                (formData.nomor_wa_pemohon || formData.nomorWa).trim(),
            );
            payload.append(
                'nama_pemberi_kuasa',
                formData.namaPemberiKuasa.trim(),
            );
            payload.append(
                'jenis_identitas_pemberi_kuasa',
                formData.jenisIdentitasPemberi,
            );
            payload.append(
                'nomor_identitas_pemberi_kuasa',
                formData.nomorIdentitasPemberi.trim(),
            );
            payload.append(
                'alamat_pemberi_kuasa',
                formData.alamatPemberiKuasa.trim(),
            );
            payload.append(
                'nomor_wa_pemberi_kuasa',
                formData.nomorWaPemberi.trim(),
            );
            payload.append('kode_lot_lelang', formData.kodeLot.trim());
            payload.append(
                'jenis_layanan',
                normalizeJenisLayanan(formData.jenisLayanan),
            );
            payload.append('tanggal_pelunasan', formData.tanggalPelunasan);

            if (formData.dokumenIdentitasPemohon) {
                payload.append(
                    'dokumen_identitas_pemohon',
                    formData.dokumenIdentitasPemohon,
                );
            }

            if (formData.buktiPelunasan) {
                payload.append('bukti_pelunasan', formData.buktiPelunasan);
            }

            if (formData.dokumenIdentitasPemberiKuasa) {
                payload.append(
                    'dokumen_identitas_pemberi_kuasa',
                    formData.dokumenIdentitasPemberiKuasa,
                );
            }

            if (formData.suratKuasa) {
                payload.append('surat_kuasa', formData.suratKuasa);
            }

            setIsSubmitting(true);
            setSuccessMessage('');

            try {
                const response = await fetch('/permohonan/store', {
                    method: 'POST',
                    body: payload,
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(getCsrfToken()
                            ? { 'X-CSRF-TOKEN': getCsrfToken() }
                            : {}),
                    },
                });

                const responseData = await parseResponse(response);

                if (!response.ok) {
                    const backendErrors =
                        'errors' in responseData && responseData.errors
                            ? Object.values(responseData.errors).flat()
                            : [];

                    setErrors(
                        backendErrors.length > 0
                            ? backendErrors
                            : [
                                  responseData.message ??
                                      'Permohonan gagal dikirim. Periksa kembali data Anda.',
                              ],
                    );
                    scrollToTop();
                    return;
                }

                const successResponse =
                    responseData as StorePermohonanSuccessResponse;

                resetForm();
                setErrors([]);
                setSuccessMessage(
                    `${successResponse.message} Nomor tiket: ${successResponse.id_pengajuan}.`,
                );
                scrollToTop();
            } catch (error) {
                setErrors([
                    error instanceof TypeError
                        ? 'Permohonan gagal dikirim karena aplikasi tidak dapat menjangkau server Laravel. Pastikan membuka http://127.0.0.1:8000/form.'
                        : 'Permohonan gagal dikirim karena koneksi bermasalah. Silakan coba lagi.',
                ]);
                scrollToTop();
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            formData.buktiPelunasan,
            formData.dokumenIdentitasPemohon,
            formData.dokumenIdentitasPemberiKuasa,
            formData.email,
            formData.alamatPemohon,
            formData.alamatPemberiKuasa,
            formData.jenisIdentitas,
            formData.jenisIdentitasPemberi,
            formData.jenisLayanan,
            formData.kodeLot,
            formData.namaPemberiKuasa,
            formData.namaPemohon,
            formData.nomorIdentitas,
            formData.nomorIdentitasPemberi,
            formData.nomorWa,
            formData.nomorWaPemberi,
            formData.nomor_wa_pemohon,
            formData.suratKuasa,
            formData.tanggalPelunasan,
            isSubmitting,
            resetForm,
            scrollToTop,
            userRole,
            validateFinal,
        ],
    );

    const renderFileFeedback = (field: FileField) => {
        const file = selectedFiles[field];
        const error = fileErrors[field];

        if (error) {
            return (
                <p className="mt-3 flex items-start gap-2 text-left text-xs font-semibold text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </p>
            );
        }

        if (!file) {
            return null;
        }

        return (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-xs font-bold text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                    File berhasil dipilih: {file.name} ({file.size})
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
            <Head title="Form Doclang Boba" />

            <nav
                className={`sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur transition-transform duration-300 md:px-6 ${
                    showNavbar ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center gap-4">
                    <Link
                        href="/"
                        aria-label="Kembali ke halaman utama"
                        className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:outline-none"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <span className="text-sm font-black tracking-widest text-indigo-700 uppercase">
                        Doclang Boba Form
                    </span>
                </div>
            </nav>

            <main className="mx-auto mt-8 max-w-3xl px-4 md:mt-12">
                {successMessage && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <p className="text-sm font-bold">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                )}

                {errors.length > 0 && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 font-bold">
                            <AlertCircle className="h-5 w-5" />
                            <span>Periksa kembali data Anda:</span>
                        </div>
                        <ul className="list-inside list-disc space-y-1 text-sm font-semibold">
                            {errors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-8 flex items-center justify-center gap-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className={`h-2 w-14 rounded-full transition-colors ${
                                step >= item ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                        />
                    ))}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70"
                >
                    <div className="h-2 bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400" />

                    <div className="p-6 md:p-10">
                        {step === 1 && (
                            <section className="space-y-6">
                                <h1 className="text-2xl font-black text-slate-950">
                                    1. Identitas Pemohon
                                </h1>

                                <div className="grid grid-cols-1 gap-5">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="email"
                                            className={labelClassName}
                                        >
                                            Email *
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="namaPemohon"
                                            className={labelClassName}
                                        >
                                            Nama Pemohon *
                                        </label>
                                        <input
                                            id="namaPemohon"
                                            name="namaPemohon"
                                            value={formData.namaPemohon}
                                            onChange={handleChange}
                                            className={inputClassName}
                                            autoComplete="name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="jenisIdentitas"
                                                className={labelClassName}
                                            >
                                                Jenis Identitas *
                                            </label>
                                            <select
                                                id="jenisIdentitas"
                                                name="jenisIdentitas"
                                                value={formData.jenisIdentitas}
                                                onChange={handleChange}
                                                className={inputClassName}
                                            >
                                                <option value="KTP">KTP</option>
                                                <option value="SIM">SIM</option>
                                                <option value="NPWP">
                                                    NPWP
                                                </option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="nomorIdentitas"
                                                className={labelClassName}
                                            >
                                                Nomor Identitas *
                                            </label>
                                            <input
                                                id="nomorIdentitas"
                                                name="nomorIdentitas"
                                                value={formData.nomorIdentitas}
                                                onChange={handleChange}
                                                className={inputClassName}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="alamatPemohon"
                                            className={labelClassName}
                                        >
                                            Alamat Pemohon *
                                        </label>
                                        <textarea
                                            id="alamatPemohon"
                                            name="alamatPemohon"
                                            value={formData.alamatPemohon}
                                            onChange={handleChange}
                                            rows={3}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="nomorWa"
                                            className={labelClassName}
                                        >
                                            Nomor WhatsApp Pemohon *
                                        </label>
                                        <input
                                            id="nomorWa"
                                            name="nomorWa"
                                            value={formData.nomorWa}
                                            onChange={handleChange}
                                            placeholder="08..."
                                            className={inputClassName}
                                            inputMode="tel"
                                            autoComplete="tel"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <span className={labelClassName}>
                                            Dokumen Identitas Pemohon *
                                        </span>
                                        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/60">
                                            <Upload className="mx-auto mb-2 h-6 w-6 text-indigo-500" />
                                            <span className="text-sm font-black text-slate-700">
                                                Unggah PDF/JPG/JPEG/PNG maksimal
                                                10MB
                                            </span>
                                            <input
                                                type="file"
                                                accept={FILE_ACCEPT_ATTRIBUTE}
                                                className="hidden"
                                                onChange={(event) =>
                                                    handleFileChange(
                                                        event,
                                                        'dokumenIdentitasPemohon',
                                                    )
                                                }
                                            />
                                            {renderFileFeedback(
                                                'dokumenIdentitasPemohon',
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={validateStep1}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                                >
                                    Lanjut Pilih Peran
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </section>
                        )}

                        {step === 2 && (
                            <section className="space-y-8 text-center">
                                <h1 className="text-2xl font-black text-slate-950">
                                    2. Pilih Peran Anda
                                </h1>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserRole('pemenang');
                                            setStep(3);
                                            setErrors([]);
                                        }}
                                        className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-indigo-400 hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-100 focus:outline-none"
                                    >
                                        <UserCheck className="h-12 w-12 text-indigo-600 transition-transform group-hover:scale-105" />
                                        <span className="font-black text-slate-800">
                                            Pemenang Lelang
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserRole('kuasa');
                                            setStep(3);
                                            setErrors([]);
                                        }}
                                        className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-indigo-400 hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-100 focus:outline-none"
                                    >
                                        <Users className="h-12 w-12 text-indigo-600 transition-transform group-hover:scale-105" />
                                        <span className="font-black text-slate-800">
                                            Penerima Kuasa
                                        </span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="mx-auto flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 focus:ring-4 focus:ring-indigo-100 focus:outline-none"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                    Kembali ke Identitas Pemohon
                                </button>
                            </section>
                        )}

                        {step === 3 && (
                            <section className="space-y-6">
                                <h1 className="text-2xl font-black text-slate-950">
                                    3. Detail Pengajuan (
                                    {userRole === 'pemenang'
                                        ? 'Pemenang'
                                        : 'Penerima Kuasa'}
                                    )
                                </h1>

                                {userRole === 'kuasa' && (
                                    <div className="space-y-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                                        <p className={sectionTitleClassName}>
                                            Data Pemberi Kuasa
                                        </p>

                                        <input
                                            name="namaPemberiKuasa"
                                            value={formData.namaPemberiKuasa}
                                            onChange={handleChange}
                                            placeholder="Nama Pemberi Kuasa *"
                                            className={inputClassName}
                                        />

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="jenisIdentitasPemberi"
                                                className={labelClassName}
                                            >
                                                Jenis Identitas Pemberi Kuasa *
                                            </label>
                                            <select
                                                id="jenisIdentitasPemberi"
                                                name="jenisIdentitasPemberi"
                                                value={
                                                    formData.jenisIdentitasPemberi
                                                }
                                                onChange={handleChange}
                                                className={inputClassName}
                                            >
                                                <option value="KTP">KTP</option>
                                                <option value="SIM">SIM</option>
                                                <option value="Akta Pendirian">
                                                    Akta Pendirian Perusahaan
                                                </option>
                                            </select>
                                        </div>

                                        <input
                                            name="nomorIdentitasPemberi"
                                            value={
                                                formData.nomorIdentitasPemberi
                                            }
                                            onChange={handleChange}
                                            placeholder="Nomor Identitas Pemberi Kuasa *"
                                            className={inputClassName}
                                        />

                                        <textarea
                                            name="alamatPemberiKuasa"
                                            value={formData.alamatPemberiKuasa}
                                            onChange={handleChange}
                                            placeholder="Alamat Pemberi Kuasa *"
                                            className={inputClassName}
                                            rows={3}
                                        />

                                        <input
                                            name="nomorWaPemberi"
                                            value={formData.nomorWaPemberi}
                                            onChange={handleChange}
                                            placeholder="Nomor WhatsApp Pemberi Kuasa *"
                                            className={inputClassName}
                                            inputMode="tel"
                                        />

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <label className="cursor-pointer rounded-xl border border-dashed border-indigo-300 bg-white p-4 text-center transition hover:border-indigo-500 hover:bg-indigo-50">
                                                <Upload className="mx-auto mb-2 h-5 w-5 text-indigo-500" />
                                                <span className="text-xs font-black text-slate-600">
                                                    Dokumen Identitas Pemberi
                                                    Kuasa
                                                </span>
                                                <input
                                                    type="file"
                                                    accept={
                                                        FILE_ACCEPT_ATTRIBUTE
                                                    }
                                                    className="hidden"
                                                    onChange={(event) =>
                                                        handleFileChange(
                                                            event,
                                                            'dokumenIdentitasPemberiKuasa',
                                                        )
                                                    }
                                                />
                                                {renderFileFeedback(
                                                    'dokumenIdentitasPemberiKuasa',
                                                )}
                                            </label>

                                            <label className="cursor-pointer rounded-xl border border-dashed border-indigo-300 bg-white p-4 text-center transition hover:border-indigo-500 hover:bg-indigo-50">
                                                <Upload className="mx-auto mb-2 h-5 w-5 text-indigo-500" />
                                                <span className="text-xs font-black text-slate-600">
                                                    Surat Kuasa
                                                </span>
                                                <input
                                                    type="file"
                                                    accept={
                                                        FILE_ACCEPT_ATTRIBUTE
                                                    }
                                                    className="hidden"
                                                    onChange={(event) =>
                                                        handleFileChange(
                                                            event,
                                                            'suratKuasa',
                                                        )
                                                    }
                                                />
                                                {renderFileFeedback(
                                                    'suratKuasa',
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <p className={sectionTitleClassName}>
                                        Detail Objek Lelang
                                    </p>

                                    <input
                                        name="kodeLot"
                                        value={formData.kodeLot}
                                        onChange={handleChange}
                                        placeholder="Kode Lot Lelang *"
                                        className={inputClassName}
                                    />

                                    <select
                                        name="jenisLayanan"
                                        value={formData.jenisLayanan}
                                        onChange={handleChange}
                                        className={inputClassName}
                                    >
                                        <option value="">
                                            Pilih Jenis Layanan *
                                        </option>
                                        <option value="Pemberian Kuitansi Pembayaran Harga Lelang">
                                            Pemberian Kuitansi Pembayaran Harga
                                            Lelang
                                        </option>
                                        <option value="Pemberian Kutipan Risalah Lelang">
                                            Pemberian Kutipan Risalah Lelang
                                        </option>
                                        <option value="Validasi PPh (1 Bidang)">
                                            Validasi PPh (1 Bidang)
                                        </option>
                                    </select>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="tanggalPelunasan"
                                            className={labelClassName}
                                        >
                                            Tanggal Pelunasan Pembayaran *
                                        </label>
                                        <input
                                            id="tanggalPelunasan"
                                            name="tanggalPelunasan"
                                            type="date"
                                            value={formData.tanggalPelunasan}
                                            onChange={handleChange}
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <span className={labelClassName}>
                                            Bukti Pelunasan
                                        </span>
                                        <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/60">
                                            <Upload className="mx-auto mb-2 h-6 w-6 text-indigo-500" />
                                            <span className="text-sm font-black text-slate-700">
                                                Unggah PDF/JPG/JPEG/PNG maksimal
                                                10MB
                                            </span>
                                            <input
                                                type="file"
                                                accept={FILE_ACCEPT_ATTRIBUTE}
                                                className="hidden"
                                                onChange={(event) =>
                                                    handleFileChange(
                                                        event,
                                                        'buktiPelunasan',
                                                    )
                                                }
                                            />
                                            {renderFileFeedback(
                                                'buktiPelunasan',
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-slate-100 px-6 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Ganti Peran
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5" />
                                                KIRIM PERMOHONAN
                                            </>
                                        )}
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
};

export default FormPage;
