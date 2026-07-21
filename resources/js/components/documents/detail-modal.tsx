import { Loader2, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DocumentItem, WhatsappNotification } from '@/types/document';

const serviceLabels: Record<string, string> = {
    kuitansi: 'Kuitansi Pembayaran',
    risalah_lelang: 'Kutipan Risalah Lelang',
    validasi_pph: 'Validasi PPh',
};

const rlObjectLabels: Record<string, string> = {
    tanah_bangunan: 'Tanah/Bangunan',
    kendaraan: 'Kendaraan',
};

const statusOptions: { value: string; label: string }[] = [
    { value: '', label: 'Semua' },
    { value: 'proses', label: 'Proses' },
    { value: 'siap_diambil', label: 'Siap Diambil' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'tidak_valid', label: 'Tidak Valid' },
];

const getStatusLabel = (status: string) =>
    statusOptions.find((option) => option.value === status)?.label ?? status;

const whatsappStatusLabel: Record<string, string> = {
    pending: 'Menunggu',
    sent: 'Terkirim',
    failed: 'Gagal',
};

const whatsappStatusTone: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    sent: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    failed: 'border-rose-200 bg-rose-50 text-rose-800',
};

const formatDate = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          }).format(new Date(value))
        : '-';

const formatDateTime = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          }).format(new Date(value))
        : '-';

const getFileUrl = (docId: number, field: string, path: string | null) =>
    path ? `/permohonan/${docId}/file/${field}` : null;

function DetailField({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-medium break-words text-slate-950">
                {value || '-'}
            </dd>
        </div>
    );
}

function DetailSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-slate-600 uppercase">
                {title}
            </h3>
            <dl className="grid gap-3 md:grid-cols-2">{children}</dl>
        </section>
    );
}

function FileButton({
    href,
    label,
    active,
    onPreview,
}: {
    href: string | null;
    label: string;
    active: boolean;
    onPreview: (label: string, href: string) => void;
}) {
    return href ? (
        <button
            type="button"
            onClick={() => onPreview(label, href)}
            className={`inline-flex h-9 items-center justify-center rounded-md border px-4 text-xs font-semibold transition ${
                active
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
        >
            {label}
        </button>
    ) : (
        <span className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-500">
            {label}: -
        </span>
    );
}

export default function DetailModal({
    document,
    open,
    onOpenChange,
    sendingWhatsappId,
    onSendInvalidWhatsapp,
    retryingNotificationId,
    onRetryWhatsapp,
}: {
    document: DocumentItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sendingWhatsappId: number | null;
    onSendInvalidWhatsapp: (document: DocumentItem) => void;
    retryingNotificationId: number | null;
    onRetryWhatsapp: (notification: WhatsappNotification) => void;
}) {
    const [previewFile, setPreviewFile] = useState<{
        label: string;
        href: string;
    } | null>(null);

    if (!document) {
        return null;
    }

    const canSendInvalidWhatsapp =
        document.status_proses === 'tidak_valid' &&
        Boolean(document.catatan_tidak_valid);
    const isSending = sendingWhatsappId === document.id;
    const whatsappNotifications = document.whatsapp_notifications ?? [];
    const invalidDeliveryPending = whatsappNotifications.some(
        (notification) =>
            notification.type === 'invalid' &&
            notification.status === 'pending',
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[88vh] overflow-y-auto border-slate-200 bg-white text-slate-950 shadow-2xl sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-slate-950">
                        Detail Permohonan {document.id_pengajuan}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Data lengkap yang dikirim pemohon dan status proses
                        layanan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <DetailSection title="Pemohon">
                        <DetailField
                            label="Nama"
                            value={document.nama_pemohon}
                        />
                        <DetailField
                            label="Peran"
                            value={document.peran_pemohon}
                        />
                        <DetailField
                            label="Email"
                            value={document.email_pemohon}
                        />
                        <DetailField
                            label="No. WhatsApp"
                            value={document.nomor_wa_pemohon}
                        />
                        <DetailField
                            label="Jenis Identitas"
                            value={document.jenis_identitas_pemohon}
                        />
                        <DetailField
                            label="No. Identitas"
                            value={document.nomor_identitas_pemohon}
                        />
                        <DetailField
                            label="Alamat"
                            value={document.alamat_pemohon}
                        />
                        <DetailField
                            label="Kode Lot"
                            value={document.kode_lot_lelang}
                        />
                    </DetailSection>

                    <DetailSection title="Kuasa">
                        <DetailField
                            label="Nama Pemberi Kuasa"
                            value={document.nama_pemberi_kuasa}
                        />
                        <DetailField
                            label="Jenis Identitas"
                            value={document.jenis_identitas_pemberi_kuasa}
                        />
                        <DetailField
                            label="No. Identitas"
                            value={document.nomor_identitas_pemberi_kuasa}
                        />
                        <DetailField
                            label="No. WhatsApp"
                            value={document.nomor_wa_pemberi_kuasa}
                        />
                        <DetailField
                            label="Alamat"
                            value={document.alamat_pemberi_kuasa}
                        />
                    </DetailSection>

                    <DetailSection title="Berkas dan Dokumen">
                        <DetailField
                            label="Jenis Layanan"
                            value={serviceLabels[document.jenis_layanan]}
                        />
                        <DetailField
                            label="Tanggal Pelunasan"
                            value={formatDate(document.tanggal_pelunasan)}
                        />
                        <DetailField
                            label="Nomor Dokumen Resmi"
                            value={document.nomor_dokumen}
                        />
                        <DetailField
                            label="Tanggal Dokumen Resmi"
                            value={formatDate(document.tanggal_dokumen)}
                        />
                        <DetailField
                            label="Jenis Objek RL"
                            value={
                                document.jenis_objek_risalah
                                    ? (rlObjectLabels[
                                          document.jenis_objek_risalah
                                      ] ?? document.jenis_objek_risalah)
                                    : null
                            }
                        />
                        <DetailField
                            label="No. Kuitansi Pembayaran"
                            value={
                                document.nomor_kuitansi_pembayaran_harga_lelang
                            }
                        />
                        <DetailField
                            label="NOP"
                            value={document.nomor_objek_pajak}
                        />
                        <DetailField label="NTPN" value={document.ntpn} />
                        <DetailField
                            label="NPWP Pemenang"
                            value={document.npwp_pemenang_lelang}
                        />
                        <DetailField
                            label="Alamat Objek"
                            value={document.alamat_objek_lelang}
                        />
                    </DetailSection>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold tracking-wide text-slate-600 uppercase">
                            Tautan Berkas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <FileButton
                                label="Identitas Pemohon"
                                href={getFileUrl(
                                    document.id,
                                    'identitas-pemohon',
                                    document.dokumen_identitas_pemohon_path,
                                )}
                                active={
                                    previewFile?.label === 'Identitas Pemohon'
                                }
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="Identitas Kuasa"
                                href={getFileUrl(
                                    document.id,
                                    'identitas-pemberi-kuasa',
                                    document.dokumen_identitas_pemberi_kuasa_path,
                                )}
                                active={
                                    previewFile?.label === 'Identitas Kuasa'
                                }
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="Surat Kuasa"
                                href={getFileUrl(
                                    document.id,
                                    'surat-kuasa',
                                    document.surat_kuasa_path,
                                )}
                                active={previewFile?.label === 'Surat Kuasa'}
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="Bukti Pelunasan"
                                href={getFileUrl(
                                    document.id,
                                    'bukti-pelunasan',
                                    document.bukti_pelunasan_path,
                                )}
                                active={
                                    previewFile?.label === 'Bukti Pelunasan'
                                }
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="Bukti Validasi SSPD BPHTB"
                                href={getFileUrl(
                                    document.id,
                                    'bukti-validasi-sspd-bphtb',
                                    document.bukti_validasi_sspd_bphtb_path,
                                )}
                                active={
                                    previewFile?.label ===
                                    'Bukti Validasi SSPD BPHTB'
                                }
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="Kuitansi Pembayaran"
                                href={getFileUrl(
                                    document.id,
                                    'kuitansi-pembayaran-harga-lelang',
                                    document.kuitansi_pembayaran_harga_lelang_path,
                                )}
                                active={
                                    previewFile?.label ===
                                    'Kuitansi Pembayaran'
                                }
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="Slip Setor PBB/BPHTB"
                                href={getFileUrl(
                                    document.id,
                                    'slip-setor-pbb-atau-bphtb',
                                    document.slip_setor_pbb_atau_bphtb_path,
                                )}
                                active={
                                    previewFile?.label ===
                                    'Slip Setor PBB/BPHTB'
                                }
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="Slip Setor PPh"
                                href={getFileUrl(
                                    document.id,
                                    'slip-setor-pph',
                                    document.slip_setor_pph_path,
                                )}
                                active={previewFile?.label === 'Slip Setor PPh'}
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                            <FileButton
                                label="NPWP Pemenang"
                                href={getFileUrl(
                                    document.id,
                                    'npwp-pemenang-lelang',
                                    document.npwp_pemenang_lelang_path,
                                )}
                                active={previewFile?.label === 'NPWP Pemenang'}
                                onPreview={(label, href) =>
                                    setPreviewFile({ label, href })
                                }
                            />
                        </div>
                        {previewFile && (
                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Pratinjau: {previewFile.label}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPreviewFile(null)}
                                        className="text-slate-600 hover:bg-slate-100"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                                <iframe
                                    title={`Pratinjau ${previewFile.label}`}
                                    src={previewFile.href}
                                    className="h-[62vh] w-full bg-white"
                                />
                            </div>
                        )}
                    </div>

                    <DetailSection title="Status">
                        <DetailField
                            label="Status Proses"
                            value={getStatusLabel(document.status_proses)}
                        />
                        <DetailField
                            label="Tanggal Masuk"
                            value={formatDate(
                                document.tanggal_masuk_pengambilan_dokumen,
                            )}
                        />
                        <DetailField
                            label="Catatan Tidak Valid"
                            value={document.catatan_tidak_valid}
                        />
                        <DetailField
                            label="WhatsApp Tidak Valid Terkirim"
                            value={formatDateTime(
                                document.invalid_whatsapp_sent_at,
                            )}
                        />
                        <DetailField
                            label="Selesai"
                            value={formatDateTime(document.completed_at)}
                        />
                        <DetailField
                            label="Dibuat"
                            value={formatDate(document.created_at)}
                        />
                    </DetailSection>

                    <section className="space-y-3">
                        <h3 className="text-sm font-bold tracking-wide text-slate-600 uppercase">
                            Riwayat WhatsApp
                        </h3>
                        {whatsappNotifications.length === 0 ? (
                            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                                Belum ada notifikasi WhatsApp.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {whatsappNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="rounded-lg border border-slate-200 bg-white p-3"
                                    >
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-950">
                                                    {notification.type ===
                                                    'invalid'
                                                        ? 'Dokumen Tidak Valid'
                                                        : 'Permohonan Diterima'}{' '}
                                                    - {notification.target_number}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-950">
                                                    {formatDateTime(
                                                        notification.sent_at ??
                                                            notification.attempted_at ??
                                                            notification.created_at,
                                                    )}
                                                    {notification.retry_count >
                                                    0
                                                        ? ` | Kirim ulang: ${notification.retry_count}x`
                                                        : ''}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${whatsappStatusTone[notification.status]}`}
                                            >
                                                {
                                                    whatsappStatusLabel[
                                                        notification.status
                                                    ]
                                                }
                                            </span>
                                        </div>
                                        {notification.error_message && (
                                            <p className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-800">
                                                {notification.error_message}
                                            </p>
                                        )}
                                        {notification.status === 'failed' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={
                                                    retryingNotificationId ===
                                                    notification.id
                                                }
                                                className="mt-3 gap-2"
                                                onClick={() =>
                                                    onRetryWhatsapp(
                                                        notification,
                                                    )
                                                }
                                            >
                                                {retryingNotificationId ===
                                                notification.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                                Kirim Ulang
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {canSendInvalidWhatsapp && (
                        <div className="flex flex-col items-end gap-2 border-t border-slate-200 pt-4">
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    disabled={
                                        isSending || invalidDeliveryPending
                                    }
                                    onClick={() =>
                                        onSendInvalidWhatsapp(document)
                                    }
                                    className="gap-2 rounded-md bg-emerald-700 px-5 text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSending || invalidDeliveryPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    {invalidDeliveryPending
                                        ? 'Sedang Dikirim'
                                        : 'Kirim WhatsApp Tidak Valid'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
