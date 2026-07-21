export type StatusProses = 'proses' | 'siap_diambil' | 'selesai' | 'tidak_valid';
export type WhatsappStatus = 'pending' | 'sent' | 'failed';

export interface WhatsappNotification {
    id: number;
    type: 'submission' | 'invalid';
    target_number: string;
    status: WhatsappStatus;
    retry_count: number;
    error_message: string | null;
    attempted_at: string | null;
    sent_at: string | null;
    failed_at: string | null;
    created_at: string | null;
}

export interface DocumentItem {
    id: number;
    id_pengajuan: string;
    tanggal_masuk_pengambilan_dokumen: string | null;
    kode_lot_lelang: string;
    peran_pemohon: string | null;
    email_pemohon: string | null;
    jenis_identitas_pemohon: string | null;
    nomor_identitas_pemohon: string | null;
    alamat_pemohon: string | null;
    nama_pemohon: string;
    nomor_wa_pemohon: string;
    nama_pemberi_kuasa: string | null;
    jenis_identitas_pemberi_kuasa: string | null;
    nomor_identitas_pemberi_kuasa: string | null;
    alamat_pemberi_kuasa: string | null;
    nomor_wa_pemberi_kuasa: string | null;
    jenis_layanan: 'kuitansi' | 'risalah_lelang' | 'validasi_pph';
    tanggal_pelunasan: string | null;
    jenis_objek_risalah: string | null;
    bukti_validasi_sspd_bphtb_path: string | null;
    kuitansi_pembayaran_harga_lelang_path: string | null;
    nomor_kuitansi_pembayaran_harga_lelang: string | null;
    nomor_objek_pajak: string | null;
    slip_setor_pbb_atau_bphtb_path: string | null;
    alamat_objek_lelang: string | null;
    ntpn: string | null;
    slip_setor_pph_path: string | null;
    npwp_pemenang_lelang: string | null;
    npwp_pemenang_lelang_path: string | null;
    nomor_dokumen: string | null;
    tanggal_dokumen: string | null;
    dokumen_identitas_pemohon_path: string | null;
    dokumen_identitas_pemberi_kuasa_path: string | null;
    surat_kuasa_path: string | null;
    bukti_pelunasan_path: string | null;
    status_proses: StatusProses;
    catatan_tidak_valid: string | null;
    invalid_whatsapp_sent_at: string | null;
    completed_at: string | null;
    whatsapp_notifications?: WhatsappNotification[];
    created_at: string | null;
}
