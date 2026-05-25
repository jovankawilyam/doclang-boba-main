'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    FileText,
    Loader2,
    Send,
    Upload,
} from 'lucide-react';
import type { ChangeEvent, HTMLAttributes } from 'react';
import { useState } from 'react';
import type {
    FieldErrors,
    FieldPath,
    Resolver,
    SubmitHandler,
} from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type ApplicantRole = 'pemenang' | 'kuasa';
type IdentityType = 'KTP' | 'SIM' | 'NPWP';
type GrantorIdentityType = 'KTP' | 'SIM' | 'Akta Pendirian';
type ServiceType =
    | 'Pemberian Kuitansi Pembayaran Harga Lelang'
    | 'Pemberian Kutipan Risalah Lelang'
    | 'Validasi PPh (1 Bidang)';
type RlObjectType = 'tanah_bangunan' | 'kendaraan';

type StorePermohonanSuccessResponse = {
    message: string;
    id_pengajuan: string;
    token?: string;
};

type StorePermohonanErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

type DoclangFormValues = {
    email_pemohon: string;
    nama_pemohon: string;
    jenis_identitas_pemohon: IdentityType;
    nomor_identitas_pemohon: string;
    alamat_pemohon: string;
    nomor_wa_pemohon: string;
    dokumen_identitas_pemohon?: unknown;
    peran_pemohon?: ApplicantRole;
    nama_pemberi_kuasa: string;
    jenis_identitas_pemberi_kuasa: GrantorIdentityType;
    nomor_identitas_pemberi_kuasa: string;
    alamat_pemberi_kuasa: string;
    nomor_wa_pemberi_kuasa: string;
    dokumen_identitas_pemberi_kuasa?: unknown;
    surat_kuasa?: unknown;
    kode_lot_lelang: string;
    jenis_layanan?: ServiceType;
    tanggal_pelunasan: string;
    bukti_pelunasan_file?: unknown;
    jenis_objek_risalah?: RlObjectType;
    bukti_validasi_sspd_bphtb?: unknown;
    kuitansi_pembayaran_harga_lelang_file?: unknown;
    nomor_kuitansi_pembayaran_harga_lelang: string;
    nomor_objek_pajak: string;
    slip_setor_pbb_atau_bphtb?: unknown;
    alamat_objek_lelang: string;
    ntpn: string;
    slip_setor_pph?: unknown;
    npwp_pemenang_lelang: string;
    npwp_pemenang_lelang_file?: unknown;
};

type FileRule = {
    maxBytes: number;
    label: string;
};

type UploadedFileInfo = {
    name: string;
    size: number;
};

const IDENTITY_MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const SERVICE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const FILE_ACCEPT_ATTRIBUTE = '.pdf,.jpg,.jpeg,.png';
const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
];

const serviceOptions: ServiceType[] = [
    'Pemberian Kuitansi Pembayaran Harga Lelang',
    'Pemberian Kutipan Risalah Lelang',
    'Validasi PPh (1 Bidang)',
];

const defaultValues: DoclangFormValues = {
    email_pemohon: '',
    nama_pemohon: '',
    jenis_identitas_pemohon: 'KTP',
    nomor_identitas_pemohon: '',
    alamat_pemohon: '',
    nomor_wa_pemohon: '',
    peran_pemohon: undefined,
    nama_pemberi_kuasa: '',
    jenis_identitas_pemberi_kuasa: 'KTP',
    nomor_identitas_pemberi_kuasa: '',
    alamat_pemberi_kuasa: '',
    nomor_wa_pemberi_kuasa: '',
    kode_lot_lelang: '',
    jenis_layanan: undefined,
    tanggal_pelunasan: '',
    jenis_objek_risalah: undefined,
    nomor_kuitansi_pembayaran_harga_lelang: '',
    nomor_objek_pajak: '',
    alamat_objek_lelang: '',
    ntpn: '',
    npwp_pemenang_lelang: '',
};

const inputClassName =
    'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100';
const labelClassName = 'text-sm font-bold text-slate-700';
const helperClassName = 'text-xs font-medium leading-5 text-slate-500';
const errorClassName = 'text-xs font-bold text-red-600';
const sectionClassName =
    'space-y-5 rounded-lg border border-slate-200 bg-white p-5';

const requiredString = (message: string): z.ZodString =>
    z.string().trim().min(1, message);

const emptyToUndefined = (value: unknown): unknown =>
    value === '' ? undefined : value;

const getSelectedFile = (value: unknown): File | null => {
    if (
        typeof FileList !== 'undefined' &&
        value instanceof FileList &&
        value.length > 0
    ) {
        return value.item(0);
    }

    if (value instanceof File) {
        return value;
    }

    return null;
};

const formatFileSize = (bytes: number): string => {
    const sizeInMb = bytes / (1024 * 1024);

    return `${sizeInMb.toFixed(sizeInMb >= 1 ? 2 : 3)} MB`;
};

const validateRequiredFile = (
    context: z.RefinementCtx,
    value: unknown,
    path: FieldPath<DoclangFormValues>,
    rule: FileRule,
): void => {
    const file = getSelectedFile(value);

    if (!file) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [path],
            message: `${rule.label} wajib diunggah.`,
        });
        return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [path],
            message: `${rule.label} harus berupa PDF, JPG, JPEG, atau PNG.`,
        });
    }

    if (file.size > rule.maxBytes) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [path],
            message: `${rule.label} maksimal ${formatFileSize(rule.maxBytes)}.`,
        });
    }
};

const validateRequiredText = (
    context: z.RefinementCtx,
    value: string,
    path: FieldPath<DoclangFormValues>,
    message: string,
): void => {
    if (value.trim().length === 0) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [path],
            message,
        });
    }
};

const formSchema = z
    .object({
        email_pemohon: requiredString('Email wajib diisi.').email(
            'Format email tidak valid.',
        ),
        nama_pemohon: requiredString('Nama Pemohon wajib diisi.'),
        jenis_identitas_pemohon: z.enum(['KTP', 'SIM', 'NPWP']),
        nomor_identitas_pemohon: requiredString(
            'Nomor Identitas Pemohon wajib diisi.',
        ).regex(/^[0-9]+$/, 'Nomor Identitas Pemohon wajib berisi angka saja.'),
        alamat_pemohon: requiredString('Alamat Pemohon wajib diisi.'),
        nomor_wa_pemohon: requiredString(
            'Nomor WhatsApp Pemohon wajib diisi.',
        ).regex(
            /^(08|\+62)[0-9]{8,13}$/,
            'Nomor WhatsApp Pemohon harus diawali 08 atau +62 dan hanya berisi angka.',
        ),
        dokumen_identitas_pemohon: z.unknown().optional(),
        peran_pemohon: z.enum(['pemenang', 'kuasa']).optional(),
        nama_pemberi_kuasa: z.string(),
        jenis_identitas_pemberi_kuasa: z.enum(['KTP', 'SIM', 'Akta Pendirian']),
        nomor_identitas_pemberi_kuasa: z.string(),
        alamat_pemberi_kuasa: z.string(),
        nomor_wa_pemberi_kuasa: z.string(),
        dokumen_identitas_pemberi_kuasa: z.unknown().optional(),
        surat_kuasa: z.unknown().optional(),
        kode_lot_lelang: requiredString('Code Lot Lelang wajib diisi.').regex(
            /^[0-9]{6}$/,
            'Code Lot Lelang harus berisi 6 digit angka.',
        ),
        jenis_layanan: z.preprocess(
            emptyToUndefined,
            z.enum(serviceOptions).optional(),
        ),
        tanggal_pelunasan: requiredString(
            'Tanggal Pelunasan Pembayaran wajib diisi.',
        ),
        bukti_pelunasan_file: z.unknown().optional(),
        jenis_objek_risalah: z.enum(['tanah_bangunan', 'kendaraan']).optional(),
        bukti_validasi_sspd_bphtb: z.unknown().optional(),
        kuitansi_pembayaran_harga_lelang_file: z.unknown().optional(),
        nomor_kuitansi_pembayaran_harga_lelang: z.string(),
        nomor_objek_pajak: z.string(),
        slip_setor_pbb_atau_bphtb: z.unknown().optional(),
        alamat_objek_lelang: z.string(),
        ntpn: z.string(),
        slip_setor_pph: z.unknown().optional(),
        npwp_pemenang_lelang: z.string(),
        npwp_pemenang_lelang_file: z.unknown().optional(),
    })
    .superRefine((data, context) => {
        validateRequiredFile(
            context,
            data.dokumen_identitas_pemohon,
            'dokumen_identitas_pemohon',
            {
                label: 'Dokumen Identitas Pemohon',
                maxBytes: IDENTITY_MAX_FILE_SIZE_BYTES,
            },
        );

        if (!data.peran_pemohon) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['peran_pemohon'],
                message: 'Tipe Pemohon wajib dipilih.',
            });
        }

        if (data.peran_pemohon === 'kuasa') {
            validateRequiredText(
                context,
                data.nama_pemberi_kuasa,
                'nama_pemberi_kuasa',
                'Nama Pemberi Kuasa wajib diisi.',
            );
            validateRequiredText(
                context,
                data.nomor_identitas_pemberi_kuasa,
                'nomor_identitas_pemberi_kuasa',
                'Nomor Identitas Pemberi Kuasa wajib diisi.',
            );
            validateRequiredText(
                context,
                data.alamat_pemberi_kuasa,
                'alamat_pemberi_kuasa',
                'Alamat Pemberi Kuasa wajib diisi.',
            );

            if (
                !/^(08|\+62)[0-9]{8,13}$/.test(
                    data.nomor_wa_pemberi_kuasa.trim(),
                )
            ) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['nomor_wa_pemberi_kuasa'],
                    message:
                        'Nomor WhatsApp Pemberi Kuasa wajib diawali 08 atau +62 dan hanya berisi angka.',
                });
            }

            validateRequiredFile(
                context,
                data.dokumen_identitas_pemberi_kuasa,
                'dokumen_identitas_pemberi_kuasa',
                {
                    label: 'Dokumen Identitas Pemberi Kuasa',
                    maxBytes: IDENTITY_MAX_FILE_SIZE_BYTES,
                },
            );
            validateRequiredFile(context, data.surat_kuasa, 'surat_kuasa', {
                label: 'Surat Kuasa',
                maxBytes: IDENTITY_MAX_FILE_SIZE_BYTES,
            });
        }

        if (!data.jenis_layanan) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['jenis_layanan'],
                message: 'Jenis Layanan wajib dipilih.',
            });
            return;
        }

        if (
            data.jenis_layanan === 'Pemberian Kuitansi Pembayaran Harga Lelang'
        ) {
            validateRequiredFile(
                context,
                data.bukti_pelunasan_file,
                'bukti_pelunasan_file',
                {
                    label: 'Bukti Pelunasan',
                    maxBytes: SERVICE_MAX_FILE_SIZE_BYTES,
                },
            );
        }

        if (data.jenis_layanan === 'Pemberian Kutipan Risalah Lelang') {
            if (!data.jenis_objek_risalah) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['jenis_objek_risalah'],
                    message: 'Jenis objek risalah lelang wajib dipilih.',
                });
            }

            if (data.jenis_objek_risalah === 'tanah_bangunan') {
                validateRequiredFile(
                    context,
                    data.bukti_validasi_sspd_bphtb,
                    'bukti_validasi_sspd_bphtb',
                    {
                        label: 'Bukti Validasi SSPD BPHTB',
                        maxBytes: SERVICE_MAX_FILE_SIZE_BYTES,
                    },
                );
            }

            validateRequiredFile(
                context,
                data.kuitansi_pembayaran_harga_lelang_file,
                'kuitansi_pembayaran_harga_lelang_file',
                {
                    label: 'Kuitansi Pembayaran Harga Lelang',
                    maxBytes: SERVICE_MAX_FILE_SIZE_BYTES,
                },
            );
        }

        if (data.jenis_layanan === 'Validasi PPh (1 Bidang)') {
            validateRequiredText(
                context,
                data.nomor_kuitansi_pembayaran_harga_lelang,
                'nomor_kuitansi_pembayaran_harga_lelang',
                'Nomor Kuitansi Pembayaran Harga Lelang wajib diisi.',
            );
            validateRequiredText(
                context,
                data.nomor_objek_pajak,
                'nomor_objek_pajak',
                'Nomor Objek Pajak wajib diisi.',
            );
            validateRequiredText(
                context,
                data.alamat_objek_lelang,
                'alamat_objek_lelang',
                'Alamat Objek Lelang wajib diisi.',
            );
            validateRequiredText(
                context,
                data.ntpn,
                'ntpn',
                'Nomor Transaksi Penerimaan Negara wajib diisi.',
            );

            if (!/^[0-9]+$/.test(data.npwp_pemenang_lelang.trim())) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['npwp_pemenang_lelang'],
                    message:
                        'NPWP Pemenang Lelang wajib diisi angka saja tanpa tanda hubung atau titik.',
                });
            }

            validateRequiredFile(
                context,
                data.kuitansi_pembayaran_harga_lelang_file,
                'kuitansi_pembayaran_harga_lelang_file',
                {
                    label: 'Kuitansi Pembayaran Harga Lelang',
                    maxBytes: SERVICE_MAX_FILE_SIZE_BYTES,
                },
            );
            validateRequiredFile(
                context,
                data.slip_setor_pbb_atau_bphtb,
                'slip_setor_pbb_atau_bphtb',
                {
                    label: 'Slip Setor PBB atau Berkas BPHTB',
                    maxBytes: SERVICE_MAX_FILE_SIZE_BYTES,
                },
            );
            validateRequiredFile(
                context,
                data.slip_setor_pph,
                'slip_setor_pph',
                {
                    label: 'Slip Setor PPh',
                    maxBytes: SERVICE_MAX_FILE_SIZE_BYTES,
                },
            );
            validateRequiredFile(
                context,
                data.npwp_pemenang_lelang_file,
                'npwp_pemenang_lelang_file',
                {
                    label: 'NPWP Pemenang Lelang',
                    maxBytes: SERVICE_MAX_FILE_SIZE_BYTES,
                },
            );
        }
    });

const getCsrfToken = (): string => {
    return (
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
};

const appendCsrfToken = (payload: FormData): void => {
    const token = getCsrfToken();

    if (token) {
        // Laravel reads _token from multipart FormData and X-CSRF-TOKEN from headers.
        // Sending both makes the public upload form resilient to proxy/header quirks.
        payload.set('_token', token);
    }
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

    return {
        message:
            body
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim() ||
            'Permohonan gagal dikirim. Server tidak mengirim response JSON.',
    };
};

const appendString = (
    payload: FormData,
    key: string,
    value: string | undefined,
): void => {
    if (value !== undefined && value.trim() !== '') {
        payload.append(key, value.trim());
    }
};

const appendFile = (payload: FormData, key: string, value: unknown): void => {
    const file = getSelectedFile(value);

    if (file) {
        payload.append(key, file);
    }
};

const fieldErrorMessage = (
    errors: FieldErrors<DoclangFormValues>,
    name: FieldPath<DoclangFormValues>,
): string | undefined => {
    const message = errors[name]?.message;

    return typeof message === 'string' ? message : undefined;
};

const FormPage = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<
        Partial<Record<FieldPath<DoclangFormValues>, UploadedFileInfo>>
    >({});

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<DoclangFormValues>({
        resolver: zodResolver(formSchema) as Resolver<DoclangFormValues>,
        defaultValues,
        mode: 'onBlur',
        shouldUnregister: false,
    });

    const applicantRole = watch('peran_pemohon');
    const selectedService = watch('jenis_layanan');
    const selectedRlObject = watch('jenis_objek_risalah');

    const slideOneFields: FieldPath<DoclangFormValues>[] = [
        'email_pemohon',
        'nama_pemohon',
        'jenis_identitas_pemohon',
        'nomor_identitas_pemohon',
        'alamat_pemohon',
        'nomor_wa_pemohon',
        'dokumen_identitas_pemohon',
    ];

    const goToSlideTwo = async (): Promise<void> => {
        setServerErrors([]);
        setSuccessMessage('');

        const isValid = await trigger(slideOneFields, {
            shouldFocus: true,
        });

        if (isValid) {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onSubmit: SubmitHandler<DoclangFormValues> = async (
        values,
    ): Promise<void> => {
        setServerErrors([]);
        setSuccessMessage('');

        const payload = new FormData();
        appendString(payload, 'peran_pemohon', values.peran_pemohon);
        appendString(payload, 'email_pemohon', values.email_pemohon);
        appendString(
            payload,
            'jenis_identitas_pemohon',
            values.jenis_identitas_pemohon,
        );
        appendString(
            payload,
            'nomor_identitas_pemohon',
            values.nomor_identitas_pemohon,
        );
        appendString(payload, 'alamat_pemohon', values.alamat_pemohon);
        appendString(payload, 'nama_pemohon', values.nama_pemohon);
        appendString(payload, 'nomor_wa_pemohon', values.nomor_wa_pemohon);
        appendString(payload, 'nama_pemberi_kuasa', values.nama_pemberi_kuasa);
        appendString(
            payload,
            'jenis_identitas_pemberi_kuasa',
            values.jenis_identitas_pemberi_kuasa,
        );
        appendString(
            payload,
            'nomor_identitas_pemberi_kuasa',
            values.nomor_identitas_pemberi_kuasa,
        );
        appendString(
            payload,
            'alamat_pemberi_kuasa',
            values.alamat_pemberi_kuasa,
        );
        appendString(
            payload,
            'nomor_wa_pemberi_kuasa',
            values.nomor_wa_pemberi_kuasa,
        );
        appendString(payload, 'kode_lot_lelang', values.kode_lot_lelang);
        appendString(payload, 'jenis_layanan', values.jenis_layanan);
        appendString(payload, 'tanggal_pelunasan', values.tanggal_pelunasan);
        appendString(
            payload,
            'jenis_objek_risalah',
            values.jenis_objek_risalah,
        );
        appendString(
            payload,
            'nomor_kuitansi_pembayaran_harga_lelang',
            values.nomor_kuitansi_pembayaran_harga_lelang,
        );
        appendString(payload, 'nomor_objek_pajak', values.nomor_objek_pajak);
        appendString(
            payload,
            'alamat_objek_lelang',
            values.alamat_objek_lelang,
        );
        appendString(payload, 'ntpn', values.ntpn);
        appendString(
            payload,
            'npwp_pemenang_lelang',
            values.npwp_pemenang_lelang,
        );

        appendFile(
            payload,
            'dokumen_identitas_pemohon',
            values.dokumen_identitas_pemohon,
        );
        appendFile(
            payload,
            'dokumen_identitas_pemberi_kuasa',
            values.dokumen_identitas_pemberi_kuasa,
        );
        appendFile(payload, 'surat_kuasa', values.surat_kuasa);
        appendFile(
            payload,
            'bukti_validasi_sspd_bphtb',
            values.bukti_validasi_sspd_bphtb,
        );
        appendFile(
            payload,
            'kuitansi_pembayaran_harga_lelang',
            values.kuitansi_pembayaran_harga_lelang_file,
        );
        appendFile(
            payload,
            'slip_setor_pbb_atau_bphtb',
            values.slip_setor_pbb_atau_bphtb,
        );
        appendFile(payload, 'slip_setor_pph', values.slip_setor_pph);
        appendFile(
            payload,
            'npwp_pemenang_lelang_file',
            values.npwp_pemenang_lelang_file,
        );

        if (
            values.jenis_layanan ===
            'Pemberian Kuitansi Pembayaran Harga Lelang'
        ) {
            appendFile(payload, 'bukti_pelunasan', values.bukti_pelunasan_file);
        }

        appendCsrfToken(payload);

        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/permohonan/store', {
                method: 'POST',
                body: payload,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
            });
            const responseData = await parseResponse(response);

            if (!response.ok) {
                if (response.status === 419) {
                    setServerErrors([
                        'Sesi formulir kedaluwarsa. Muat ulang halaman lalu kirim kembali permohonan.',
                    ]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                const backendErrors =
                    'errors' in responseData && responseData.errors
                        ? Object.values(responseData.errors).flat()
                        : [];

                setServerErrors(
                    backendErrors.length > 0
                        ? backendErrors
                        : [
                              responseData.message ??
                                  'Permohonan gagal dikirim. Periksa kembali data Anda.',
                          ],
                );
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const successResponse =
                responseData as StorePermohonanSuccessResponse;

            reset(defaultValues);
            setUploadedFiles({});
            setStep(1);
            setSuccessMessage(
                `${successResponse.message} Token permohonan: ${successResponse.token ?? successResponse.id_pengajuan}. Notifikasi WhatsApp sedang diproses.`,
            );
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setServerErrors([
                'Permohonan gagal dikirim karena koneksi bermasalah. Silakan coba lagi.',
            ]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderError = (name: FieldPath<DoclangFormValues>) => {
        const message = fieldErrorMessage(errors, name);

        if (!message) {
            return null;
        }

        return <p className={errorClassName}>{message}</p>;
    };

    const FileInput = ({
        name,
        label,
        note,
    }: {
        name: FieldPath<DoclangFormValues>;
        label: string;
        note: string;
    }) => {
        const message = fieldErrorMessage(errors, name);
        const selectedFile = uploadedFiles[name];
        const fileRegistration = register(name);
        const uploadBoxClassName = selectedFile
            ? 'block cursor-pointer rounded-lg border-2 border-solid border-emerald-300 bg-emerald-50 p-5 text-center transition hover:border-emerald-500 hover:bg-emerald-100'
            : 'block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-blue-500 hover:bg-blue-50';

        const handleFileChange = async (
            event: ChangeEvent<HTMLInputElement>,
        ): Promise<void> => {
            await fileRegistration.onChange(event);

            const file = event.target.files?.item(0);

            setUploadedFiles((currentFiles) => {
                if (!file) {
                    const nextFiles = { ...currentFiles };
                    delete nextFiles[name];

                    return nextFiles;
                }

                return {
                    ...currentFiles,
                    [name]: {
                        name: file.name,
                        size: file.size,
                    },
                };
            });
        };

        return (
            <div className="space-y-2">
                <span className={labelClassName}>{label} *</span>
                <label className={uploadBoxClassName}>
                    {selectedFile ? (
                        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-700" />
                    ) : (
                        <Upload className="mx-auto mb-2 h-6 w-6 text-blue-700" />
                    )}
                    <span className="block text-sm font-black text-slate-700">
                        {selectedFile ? 'Dokumen berhasil dipilih' : note}
                    </span>
                    {selectedFile && (
                        <span className="mt-1 block text-xs font-semibold break-words text-emerald-800">
                            {selectedFile.name} (
                            {formatFileSize(selectedFile.size)})
                        </span>
                    )}
                    <input
                        type="file"
                        accept={FILE_ACCEPT_ATTRIBUTE}
                        className="hidden"
                        {...fileRegistration}
                        onChange={handleFileChange}
                    />
                </label>
                {selectedFile && (
                    <p className="flex items-start gap-2 text-xs leading-5 font-bold text-emerald-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{selectedFile.name} sudah diunggah.</span>
                    </p>
                )}
                {message && <p className={errorClassName}>{message}</p>}
            </div>
        );
    };

    const TextField = ({
        name,
        label,
        type = 'text',
        placeholder,
        note,
        inputMode,
        pattern,
    }: {
        name: FieldPath<DoclangFormValues>;
        label: string;
        type?: string;
        placeholder?: string;
        note?: string;
        inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
        pattern?: string;
    }) => (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>
                {label} *
            </label>
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                inputMode={inputMode}
                pattern={pattern}
                className={inputClassName}
                {...register(name)}
            />
            {note && <p className={helperClassName}>{note}</p>}
            {renderError(name)}
        </div>
    );

    const TextAreaField = ({
        name,
        label,
    }: {
        name: FieldPath<DoclangFormValues>;
        label: string;
    }) => (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>
                {label} *
            </label>
            <textarea
                id={name}
                rows={3}
                className={inputClassName}
                {...register(name)}
            />
            {renderError(name)}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
            <Head title="Form Doclang Boba" />

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
                        Form Doclang Boba
                    </span>
                </div>
            </nav>

            <main className="mx-auto mt-8 max-w-4xl px-4 md:mt-12">
                {successMessage && (
                    <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <p className="text-sm font-bold">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                )}

                {serverErrors.length > 0 && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 font-bold">
                            <AlertCircle className="h-5 w-5" />
                            <span>Periksa kembali data Anda:</span>
                        </div>
                        <ul className="list-inside list-disc space-y-1 text-sm font-semibold">
                            {serverErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mb-8 grid grid-cols-2 gap-3">
                    <div
                        className={`h-2 rounded-full ${
                            step >= 1 ? 'bg-blue-700' : 'bg-slate-200'
                        }`}
                    />
                    <div
                        className={`h-2 rounded-full ${
                            step >= 2 ? 'bg-blue-700' : 'bg-slate-200'
                        }`}
                    />
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
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
                        {step === 1 && (
                            <section className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-950">
                                        Slide 1. Informasi Dasar Pemohon
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Lengkapi identitas pemohon sebelum masuk
                                        ke detail layanan.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <TextField
                                        name="email_pemohon"
                                        label="Masukkan Email"
                                        type="email"
                                        placeholder="nama@email.com"
                                    />
                                    <TextField
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
                                            {...register(
                                                'jenis_identitas_pemohon',
                                            )}
                                        >
                                            <option value="KTP">KTP</option>
                                            <option value="SIM">SIM</option>
                                            <option value="NPWP">NPWP</option>
                                        </select>
                                        {renderError('jenis_identitas_pemohon')}
                                    </div>
                                    <TextField
                                        name="nomor_identitas_pemohon"
                                        label="Nomor Identitas Pemohon"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                    <div className="md:col-span-2">
                                        <TextAreaField
                                            name="alamat_pemohon"
                                            label="Alamat Pemohon"
                                        />
                                    </div>
                                    <TextField
                                        name="nomor_wa_pemohon"
                                        label="Nomor WhatsApp Pemohon"
                                        placeholder="08..."
                                    />
                                    <FileInput
                                        name="dokumen_identitas_pemohon"
                                        label="Document Identitas Pemohon"
                                        note="Unggah PDF/JPG/JPEG/PNG maksimal 15MB"
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
                        )}

                        {step === 2 && (
                            <section className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-950">
                                        Slide 2. Detail Permohonan Dinamis
                                    </h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Pilihan pada bagian ini menentukan
                                        dokumen yang wajib diunggah.
                                    </p>
                                </div>

                                <div className={sectionClassName}>
                                    <p className={labelClassName}>
                                        Pilih Tipe Pemohon *
                                    </p>
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
                                                name="nama_pemberi_kuasa"
                                                label="Nama Pemberi Kuasa"
                                            />
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="jenis_identitas_pemberi_kuasa"
                                                    className={labelClassName}
                                                >
                                                    Jenis Identitas Pemberi
                                                    Kuasa *
                                                </label>
                                                <select
                                                    id="jenis_identitas_pemberi_kuasa"
                                                    className={inputClassName}
                                                    {...register(
                                                        'jenis_identitas_pemberi_kuasa',
                                                    )}
                                                >
                                                    <option value="KTP">
                                                        KTP
                                                    </option>
                                                    <option value="SIM">
                                                        SIM
                                                    </option>
                                                    <option value="Akta Pendirian">
                                                        Akta Pendirian
                                                        Perusahaan
                                                    </option>
                                                </select>
                                            </div>
                                            <TextField
                                                name="nomor_identitas_pemberi_kuasa"
                                                label="Nomor Identitas Pemberi Kuasa"
                                            />
                                            <TextField
                                                name="nomor_wa_pemberi_kuasa"
                                                label="Nomor WhatsApp Pemberi Kuasa"
                                                placeholder="08..."
                                            />
                                            <div className="md:col-span-2">
                                                <TextAreaField
                                                    name="alamat_pemberi_kuasa"
                                                    label="Alamat Pemberi Kuasa"
                                                />
                                            </div>
                                            <FileInput
                                                name="dokumen_identitas_pemberi_kuasa"
                                                label="Document Identitas Pemberi Kuasa"
                                                note="Unggah PDF/JPG/JPEG/PNG maksimal 15MB"
                                            />
                                            <FileInput
                                                name="surat_kuasa"
                                                label="Surat Kuasa"
                                                note="Unggah PDF/JPG/JPEG/PNG maksimal 15MB"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className={sectionClassName}>
                                    <h3 className="font-black text-slate-950">
                                        Inputan Bersama
                                    </h3>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <TextField
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
                                                <option value="">
                                                    Pilih jenis layanan
                                                </option>
                                                {serviceOptions.map(
                                                    (service) => (
                                                        <option
                                                            key={service}
                                                            value={service}
                                                        >
                                                            {service}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {renderError('jenis_layanan')}
                                        </div>
                                        <TextField
                                            name="tanggal_pelunasan"
                                            label="Tanggal Pelunasan Pembayaran"
                                            type="date"
                                        />
                                    </div>
                                </div>

                                {selectedService ===
                                    'Pemberian Kuitansi Pembayaran Harga Lelang' && (
                                    <div className={sectionClassName}>
                                        <FileInput
                                            name="bukti_pelunasan_file"
                                            label="Upload Bukti Pelunasan"
                                            note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                                        />
                                    </div>
                                )}

                                {selectedService ===
                                    'Pemberian Kutipan Risalah Lelang' && (
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
                                                    {...register(
                                                        'jenis_objek_risalah',
                                                    )}
                                                />
                                                a. Tanah/Bangunan
                                            </label>
                                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 font-bold text-slate-900 transition has-[:checked]:border-slate-950 has-[:checked]:bg-slate-950 has-[:checked]:text-white">
                                                <input
                                                    type="radio"
                                                    value="kendaraan"
                                                    className="h-4 w-4"
                                                    {...register(
                                                        'jenis_objek_risalah',
                                                    )}
                                                />
                                                b. Kendaraan
                                            </label>
                                        </div>
                                        {renderError('jenis_objek_risalah')}

                                        {selectedRlObject ===
                                            'tanah_bangunan' && (
                                            <FileInput
                                                name="bukti_validasi_sspd_bphtb"
                                                label="Upload Bukti Validasi SSPD BPHTB"
                                                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB. *dokumen asli agar dilampirkan pada saat pengambilan"
                                            />
                                        )}
                                        <FileInput
                                            name="kuitansi_pembayaran_harga_lelang_file"
                                            label="Upload Kuitansi Pembayaran Harga Lelang"
                                            note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB. *jika pengajuan kutipan RL bersamaan dengan pengajuan kuitansi maka dapat menggunakan Bukti Pelunasan"
                                        />
                                    </div>
                                )}

                                {selectedService ===
                                    'Validasi PPh (1 Bidang)' && (
                                    <div className={sectionClassName}>
                                        <blockquote className="rounded-lg border-l-4 border-blue-700 bg-blue-50 p-4 text-sm leading-6 font-semibold text-blue-950">
                                            Untuk proses validasi PPH, mohon
                                            siapkan dokumen berupa: 1. NPWP
                                            pemenang lelang, 2. kuitansi, 3.
                                            slip setor pph, 4. slip setor pbb
                                            atau berkas BPHTB yang menunjukkan
                                            NOP dan luas T/B yang tepat
                                        </blockquote>
                                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                            <TextField
                                                name="nomor_kuitansi_pembayaran_harga_lelang"
                                                label="Nomor Kuitansi Pembayaran Harga Lelang"
                                                placeholder="Contoh: 100/RL.150/32/2023"
                                            />
                                            <TextField
                                                name="nomor_objek_pajak"
                                                label="Nomor Objek Pajak (NOP)"
                                                note="Mohon input NOP pada Slip Setor PBB/berkas BPHTB"
                                            />
                                            <div className="md:col-span-2">
                                                <TextField
                                                    name="alamat_objek_lelang"
                                                    label="Alamat Objek Lelang"
                                                    placeholder="Contoh : Jl. Kavling Mawar 3 RT.002 RW.07"
                                                />
                                            </div>
                                            <TextField
                                                name="ntpn"
                                                label="Nomor Transaksi Penerimaan Negara (NTPN)"
                                                placeholder="Contoh : 8C9ED4ESL70H8778"
                                            />
                                            <TextField
                                                name="npwp_pemenang_lelang"
                                                label="Nomor Pokok Wajib Pajak (NPWP) Pemenang Lelang"
                                                note="Masukkan angka saja tanpa tanda hubung/titik."
                                            />
                                            <FileInput
                                                name="kuitansi_pembayaran_harga_lelang_file"
                                                label="Upload Kuitansi Pembayaran Harga Lelang"
                                                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                                            />
                                            <FileInput
                                                name="slip_setor_pbb_atau_bphtb"
                                                label="Upload Slip Setor PBB atau Berkas BPHTB"
                                                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB dan harus menunjukkan NOP & luas T/B yang tepat"
                                            />
                                            <FileInput
                                                name="slip_setor_pph"
                                                label="Upload Slip Setor PPh"
                                                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                                            />
                                            <FileInput
                                                name="npwp_pemenang_lelang_file"
                                                label="Upload NPWP Pemenang Lelang"
                                                note="Unggah PDF/JPG/JPEG/PNG maksimal 10MB"
                                            />
                                        </div>
                                    </div>
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
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
};

export default FormPage;
