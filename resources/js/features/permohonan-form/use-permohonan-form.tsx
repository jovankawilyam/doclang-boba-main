import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type {
    FieldErrors,
    FieldPath,
    Resolver,
    SubmitHandler,
} from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import {
    ACCEPTED_FILE_EXTENSIONS,
    defaultValues,
    errorClassName,
    IDENTITY_MAX_FILE_SIZE_BYTES,
    SERVICE_MAX_FILE_SIZE_BYTES,
    serviceOptions,
} from './constants';
import type {
    DoclangFormValues,
    StorePermohonanErrorResponse,
    StorePermohonanSuccessResponse,
    UploadedFileInfo,
} from './types';

const AUTOSAVE_STORAGE_KEY = 'doclang-boba:permohonan-form:draft:v1';

type FileRule = {
    maxBytes: number;
    label: string;
};

const requiredString = (message: string): z.ZodString =>
    z.string().trim().min(1, message);

const emptyToUndefined = (value: unknown): unknown =>
    value === '' ? undefined : value;

export const getSelectedFile = (value: unknown): File | null => {
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

export const formatUploadedFileSize = formatFileSize;

const hasAcceptedFileExtension = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    return ACCEPTED_FILE_EXTENSIONS.includes(extension);
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

    if (!hasAcceptedFileExtension(file)) {
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

export const fieldErrorMessage = (
    errors: FieldErrors<DoclangFormValues>,
    name: FieldPath<DoclangFormValues>,
): string | undefined => {
    const message = errors[name]?.message;

    return typeof message === 'string' ? message : undefined;
};

const slideOneFields: FieldPath<DoclangFormValues>[] = [
    'email_pemohon',
    'nama_pemohon',
    'jenis_identitas_pemohon',
    'nomor_identitas_pemohon',
    'alamat_pemohon',
    'nomor_wa_pemohon',
    'dokumen_identitas_pemohon',
];

type AutosavedField = {
    [Field in keyof DoclangFormValues]-?: DoclangFormValues[Field] extends
        | string
        | undefined
        ? Field
        : never;
}[keyof DoclangFormValues];

const autosavedFields: AutosavedField[] = [
    'email_pemohon',
    'nama_pemohon',
    'jenis_identitas_pemohon',
    'nomor_identitas_pemohon',
    'alamat_pemohon',
    'nomor_wa_pemohon',
    'peran_pemohon',
    'nama_pemberi_kuasa',
    'jenis_identitas_pemberi_kuasa',
    'nomor_identitas_pemberi_kuasa',
    'alamat_pemberi_kuasa',
    'nomor_wa_pemberi_kuasa',
    'kode_lot_lelang',
    'jenis_layanan',
    'tanggal_pelunasan',
    'jenis_objek_risalah',
    'nomor_kuitansi_pembayaran_harga_lelang',
    'nomor_objek_pajak',
    'alamat_objek_lelang',
    'ntpn',
    'npwp_pemenang_lelang',
];

type AutosavedDraft = {
    values: Partial<DoclangFormValues>;
    step: 1 | 2;
};

const canUseAutosaveStorage = (): boolean =>
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readAutosavedDraft = (): AutosavedDraft | null => {
    if (!canUseAutosaveStorage()) {
        return null;
    }

    try {
        const storedDraft = window.localStorage.getItem(AUTOSAVE_STORAGE_KEY);

        if (!storedDraft) {
            return null;
        }

        const draft = JSON.parse(storedDraft) as Partial<AutosavedDraft>;

        if (!draft.values || typeof draft.values !== 'object') {
            return null;
        }

        return {
            values: draft.values,
            step: draft.step === 2 ? 2 : 1,
        };
    } catch {
        return null;
    }
};

const writeAutosavedDraft = (
    values: Partial<DoclangFormValues>,
    step: 1 | 2,
): void => {
    if (!canUseAutosaveStorage()) {
        return;
    }

    try {
        window.localStorage.setItem(
            AUTOSAVE_STORAGE_KEY,
            JSON.stringify({
                values,
                step,
            }),
        );
    } catch {
        // Ignore storage quota/private-mode failures; the form must still work.
    }
};

const clearAutosavedDraft = (): void => {
    if (!canUseAutosaveStorage()) {
        return;
    }

    try {
        window.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch {
        // Ignore storage failures; clearing the draft is best-effort.
    }
};

const pickAutosavedValues = (
    values: Partial<DoclangFormValues>,
): Partial<DoclangFormValues> => {
    const draft: Record<string, string | undefined> = {};

    autosavedFields.forEach((field) => {
        const value = values[field];

        if (typeof value === 'string' || value === undefined) {
            draft[field] = value;
        }
    });

    return draft as Partial<DoclangFormValues>;
};

export const usePermohonanForm = () => {
    const [step, setStep] = useState<1 | 2>(
        () => readAutosavedDraft()?.step ?? 1,
    );
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<
        Partial<Record<FieldPath<DoclangFormValues>, UploadedFileInfo>>
    >({});

    const {
        register,
        handleSubmit,
        trigger,
        control,
        reset,
        watch,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<DoclangFormValues>({
        resolver: zodResolver(formSchema) as Resolver<DoclangFormValues>,
        defaultValues: {
            ...defaultValues,
            ...readAutosavedDraft()?.values,
        },
        mode: 'onBlur',
        shouldUnregister: false,
    });

    const applicantRole = useWatch({
        control,
        name: 'peran_pemohon',
    });
    const selectedService = useWatch({
        control,
        name: 'jenis_layanan',
    });
    const selectedRlObject = useWatch({
        control,
        name: 'jenis_objek_risalah',
    });

    useEffect(() => {
        let timeoutId: number | undefined;
        const subscription = watch((values) => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }

            timeoutId = window.setTimeout(() => {
                writeAutosavedDraft(pickAutosavedValues(values), step);
            }, 300);
        });

        return () => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }

            subscription.unsubscribe();
        };
    }, [step, watch]);

    useEffect(() => {
        writeAutosavedDraft(pickAutosavedValues(getValues()), step);
    }, [getValues, step]);

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
            clearAutosavedDraft();
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

    return {
        applicantRole,
        errors,
        fileInputHelpers: {
            errors,
            register,
            setUploadedFiles,
            uploadedFiles,
        },
        fieldHelpers: { register, renderError },
        goToSlideTwo,
        handleSubmit,
        isSubmitting,
        onSubmit,
        register,
        selectedRlObject,
        selectedService,
        serverErrors,
        setStep,
        step,
        successMessage,
    };
};
