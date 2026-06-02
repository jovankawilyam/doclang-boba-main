import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { FieldErrors, FieldPath, UseFormRegister } from 'react-hook-form';

export type ApplicantRole = 'pemenang' | 'kuasa';
export type IdentityType = 'KTP' | 'SIM' | 'NPWP';
export type GrantorIdentityType = 'KTP' | 'SIM' | 'Akta Pendirian';
export type ServiceType =
    | 'Pemberian Kuitansi Pembayaran Harga Lelang'
    | 'Pemberian Kutipan Risalah Lelang'
    | 'Validasi PPh (1 Bidang)';
export type RlObjectType = 'tanah_bangunan' | 'kendaraan';

export type StorePermohonanSuccessResponse = {
    message: string;
    id_pengajuan: string;
    token?: string;
};

export type StorePermohonanErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

export type DoclangFormValues = {
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

export type UploadedFileInfo = {
    name: string;
    size: number;
};

export type FieldHelpers = {
    register: UseFormRegister<DoclangFormValues>;
    renderError: (name: FieldPath<DoclangFormValues>) => ReactNode;
};

export type FileInputHelpers = {
    register: UseFormRegister<DoclangFormValues>;
    errors: FieldErrors<DoclangFormValues>;
    uploadedFiles: Partial<
        Record<FieldPath<DoclangFormValues>, UploadedFileInfo>
    >;
    setUploadedFiles: Dispatch<
        SetStateAction<
            Partial<Record<FieldPath<DoclangFormValues>, UploadedFileInfo>>
        >
    >;
};
