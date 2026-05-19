import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Eye,
    FileText,
    FolderX,
    Loader2,
    Plus,
    Search,
    Send,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type StatusProses = 'proses' | 'siap_diambil' | 'selesai' | 'tidak_valid';

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
    created_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedDocuments {
    data: DocumentItem[];
    links: PaginationLink[];
    total: number;
}

interface DocumentDashboardProps {
    documents: PaginatedDocuments;
    filters: {
        search?: string;
        status?: string;
    };
    config: {
        title: string;
        description: string;
        href: string;
        addSuffix: string;
        addCategory: 'kuitansi' | 'risalah_lelang' | 'validasi_pph';
        emptyLabel: string;
        accentRing: string;
    };
}

const statusOptions: { value: '' | StatusProses; label: string }[] = [
    { value: '', label: 'Semua' },
    { value: 'proses', label: 'Proses' },
    { value: 'siap_diambil', label: 'Siap Diambil' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'tidak_valid', label: 'Tidak Valid' },
];

const serviceLabels = {
    kuitansi: 'Kuitansi Pembayaran',
    risalah_lelang: 'Kutipan Risalah Lelang',
    validasi_pph: 'Validasi PPh',
};

const rlObjectLabels: Record<string, string> = {
    tanah_bangunan: 'Tanah/Bangunan',
    kendaraan: 'Kendaraan',
};

const formatStat = (value: number | undefined) =>
    new Intl.NumberFormat('id-ID').format(value ?? 0);

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

const addHours = (value: string, hours: number) => {
    const date = new Date(value);
    date.setHours(date.getHours() + hours);

    return date;
};

const getInvalidWhatsappCooldown = (document: DocumentItem) => {
    if (!document.invalid_whatsapp_sent_at) {
        return { active: false, nextAllowedAt: null };
    }

    const nextAllowedAt = addHours(document.invalid_whatsapp_sent_at, 24);

    return {
        active: Date.now() < nextAllowedAt.getTime(),
        nextAllowedAt,
    };
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'siap_diambil':
            return 'border-cyan-300/40 bg-cyan-500/20 text-cyan-100';
        case 'selesai':
            return 'border-emerald-300/40 bg-emerald-500/20 text-emerald-100';
        case 'tidak_valid':
            return 'border-rose-300/40 bg-rose-500/20 text-rose-100';
        case 'proses':
        default:
            return 'border-amber-300/40 bg-amber-500/20 text-amber-100';
    }
};

const getStatusLabel = (status: StatusProses) =>
    statusOptions.find((option) => option.value === status)?.label ?? status;

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
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <dt className="text-[11px] font-semibold tracking-wide text-blue-100 uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-medium break-words text-white">
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
            <h3 className="text-sm font-bold tracking-wide text-cyan-100 uppercase">
                {title}
            </h3>
            <dl className="grid gap-3 md:grid-cols-2">{children}</dl>
        </section>
    );
}

function FileButton({ href, label }: { href: string | null; label: string }) {
    return href ? (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white transition hover:bg-white/20"
        >
            {label}
        </a>
    ) : (
        <span className="inline-flex h-9 items-center rounded-full border border-white/10 px-4 text-xs font-semibold text-blue-100">
            {label}: -
        </span>
    );
}

function DetailModal({
    document,
    open,
    onOpenChange,
    sendingWhatsappId,
    onSendInvalidWhatsapp,
}: {
    document: DocumentItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sendingWhatsappId: number | null;
    onSendInvalidWhatsapp: (document: DocumentItem) => void;
}) {
    if (!document) {
        return null;
    }

    const invalidWhatsappCooldown = getInvalidWhatsappCooldown(document);
    const canSendInvalidWhatsapp =
        document.status_proses === 'tidak_valid' &&
        Boolean(document.catatan_tidak_valid);
    const isSending = sendingWhatsappId === document.id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[88vh] overflow-y-auto border-white/20 bg-slate-950 text-white shadow-2xl sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Detail Permohonan {document.id_pengajuan}
                    </DialogTitle>
                    <DialogDescription className="text-blue-100">
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
                        <h3 className="text-sm font-bold tracking-wide text-cyan-100 uppercase">
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
                            />
                            <FileButton
                                label="Identitas Kuasa"
                                href={getFileUrl(
                                    document.id,
                                    'identitas-pemberi-kuasa',
                                    document.dokumen_identitas_pemberi_kuasa_path,
                                )}
                            />
                            <FileButton
                                label="Surat Kuasa"
                                href={getFileUrl(
                                    document.id,
                                    'surat-kuasa',
                                    document.surat_kuasa_path,
                                )}
                            />
                            <FileButton
                                label="Bukti Pelunasan"
                                href={getFileUrl(
                                    document.id,
                                    'bukti-pelunasan',
                                    document.bukti_pelunasan_path,
                                )}
                            />
                            <FileButton
                                label="Bukti Validasi SSPD BPHTB"
                                href={getFileUrl(
                                    document.id,
                                    'bukti-validasi-sspd-bphtb',
                                    document.bukti_validasi_sspd_bphtb_path,
                                )}
                            />
                            <FileButton
                                label="Kuitansi Pembayaran"
                                href={getFileUrl(
                                    document.id,
                                    'kuitansi-pembayaran-harga-lelang',
                                    document.kuitansi_pembayaran_harga_lelang_path,
                                )}
                            />
                            <FileButton
                                label="Slip Setor PBB/BPHTB"
                                href={getFileUrl(
                                    document.id,
                                    'slip-setor-pbb-atau-bphtb',
                                    document.slip_setor_pbb_atau_bphtb_path,
                                )}
                            />
                            <FileButton
                                label="Slip Setor PPh"
                                href={getFileUrl(
                                    document.id,
                                    'slip-setor-pph',
                                    document.slip_setor_pph_path,
                                )}
                            />
                            <FileButton
                                label="NPWP Pemenang"
                                href={getFileUrl(
                                    document.id,
                                    'npwp-pemenang-lelang',
                                    document.npwp_pemenang_lelang_path,
                                )}
                            />
                        </div>
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
                            label="Dibuat"
                            value={formatDate(document.created_at)}
                        />
                    </DetailSection>

                    {canSendInvalidWhatsapp && (
                        <div className="flex flex-col items-end gap-2 border-t border-white/10 pt-4">
                            {invalidWhatsappCooldown.active &&
                                invalidWhatsappCooldown.nextAllowedAt && (
                                    <p className="text-right text-xs font-medium text-blue-100">
                                        WhatsApp sudah terkirim. Bisa dikirim
                                        kembali pada{' '}
                                        {formatDateTime(
                                            invalidWhatsappCooldown.nextAllowedAt.toISOString(),
                                        )}
                                        .
                                    </p>
                                )}
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    disabled={
                                        isSending ||
                                        invalidWhatsappCooldown.active
                                    }
                                    onClick={() =>
                                        onSendInvalidWhatsapp(document)
                                    }
                                    className="gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-5 text-emerald-50 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : invalidWhatsappCooldown.active ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    {invalidWhatsappCooldown.active
                                        ? 'WhatsApp Sudah Terkirim'
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

export default function DocumentDashboard({
    documents,
    filters,
    config,
}: DocumentDashboardProps) {
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();
    const flash = props.flash ?? {};
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showAddForm, setShowAddForm] = useState(false);
    const [nomorPengajuan, setNomorPengajuan] = useState('');
    const [processing, setProcessing] = useState(false);
    const [filtering, setFiltering] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedDocument, setSelectedDocument] =
        useState<DocumentItem | null>(null);
    const [sendingWhatsappId, setSendingWhatsappId] = useState<number | null>(
        null,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: config.title, href: config.href },
    ];

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(
            config.href,
            { search, status },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setFiltering(true),
                onFinish: () => setFiltering(false),
            },
        );
    };

    const onFilterChange = (value: string) => {
        setStatus(value);
        router.get(
            config.href,
            { search, status: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setFiltering(true),
                onFinish: () => setFiltering(false),
            },
        );
    };

    const handleStatusChange = (docId: number, value: string) => {
        const payload: Record<string, string> = {
            status_proses: value,
        };

        if (value === 'tidak_valid') {
            const catatanTidakValid = window.prompt(
                'Masukkan alasan data tidak valid:',
            );

            if (!catatanTidakValid?.trim()) {
                return;
            }

            payload.catatan_tidak_valid = catatanTidakValid.trim();
        }

        setUpdatingId(docId);
        router.patch(`/permohonan/${docId}`, payload, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setUpdatingId(null),
        });
    };

    const handleDelete = (docId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
            setDeletingId(docId);
            router.delete(`/permohonan/${docId}`, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const handleSendInvalidWhatsapp = (document: DocumentItem) => {
        const recipients = [
            `pemohon (${document.nomor_wa_pemohon})`,
            document.nomor_wa_pemberi_kuasa
                ? `kuasa (${document.nomor_wa_pemberi_kuasa})`
                : null,
        ].filter(Boolean);

        if (
            !confirm(
                `Kirim WhatsApp pemberitahuan tidak valid ke ${recipients.join(' dan ')}?`,
            )
        ) {
            return;
        }

        setSendingWhatsappId(document.id);
        router.post(
            `/permohonan/${document.id}/send-invalid-notification`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setSelectedDocument((currentDocument) =>
                        currentDocument?.id === document.id
                            ? {
                                  ...currentDocument,
                                  invalid_whatsapp_sent_at:
                                      new Date().toISOString(),
                              }
                            : currentDocument,
                    );
                },
                onFinish: () => setSendingWhatsappId(null),
            },
        );
    };

    const handleAddSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);

        router.post(
            '/documents',
            {
                nomor_pengajuan: `${nomorPengajuan}/${config.addSuffix}/${new Date().getFullYear()}`,
                status_proses: 'proses',
                category: config.addCategory,
            },
            {
                onSuccess: () => {
                    setShowAddForm(false);
                    setNomorPengajuan('');
                },
                onError: (errors) => {
                    alert(Object.values(errors).flat().join(', '));
                },
                onFinish: () => setProcessing(false),
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={config.title} />

            <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-8 p-6 md:p-8">
                {flash.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-400/15 px-4 py-3 text-sm text-emerald-100 backdrop-blur-lg">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-300/40 bg-rose-400/15 px-4 py-3 text-sm text-rose-100 backdrop-blur-lg">
                        <XCircle className="h-4 w-4 shrink-0" />
                        {flash.error}
                    </div>
                )}

                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold tracking-tight text-white">
                        {config.title}
                    </h1>
                    <p className="text-blue-100">{config.description}</p>
                </header>

                <Card
                    className={`rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 ${filtering ? 'opacity-60' : ''}`}
                >
                    <CardHeader className="flex flex-col items-center justify-between gap-4 border-b border-white/15 pb-5 md:flex-row">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                            <FileText className="h-5 w-5 text-cyan-100 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                            Daftar Permohonan
                        </CardTitle>
                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                            <form
                                onSubmit={handleSearch}
                                className="flex w-full flex-col gap-2 md:w-auto md:flex-row"
                            >
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-blue-100" />
                                    <Input
                                        type="text"
                                        placeholder="Cari pengajuan..."
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        className={`w-full rounded-full border-white/20 bg-white/10 pl-9 text-white shadow-lg ring-offset-transparent transition-all duration-300 placeholder:text-blue-100 focus-visible:ring-2 ${config.accentRing}`}
                                    />
                                </div>
                                <select
                                    value={status}
                                    onChange={(event) =>
                                        onFilterChange(event.target.value)
                                    }
                                    className={`h-10 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-medium text-white shadow-lg backdrop-blur-lg transition-all duration-300 outline-none focus-visible:ring-2 ${config.accentRing}`}
                                >
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {filtering && (
                                    <Loader2 className="h-5 w-5 animate-spin self-center text-cyan-100" />
                                )}
                            </form>
                            <Button
                                onClick={() => setShowAddForm(!showAddForm)}
                                disabled={processing}
                                className="gap-2 rounded-full border border-white/20 bg-white/15 px-5 whitespace-nowrap text-white shadow-lg backdrop-blur-lg transition-all duration-300 hover:bg-white/25"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Data
                            </Button>
                        </div>
                    </CardHeader>

                    {showAddForm && (
                        <div className="animate-in border-b border-white/15 bg-white/10 p-6 backdrop-blur-lg duration-300 fade-in slide-in-from-top-4">
                            <form
                                onSubmit={handleAddSubmit}
                                className="flex max-w-lg items-end gap-4"
                            >
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-semibold text-white">
                                        Nomor Pengajuan Baru (angka saja)
                                    </label>
                                    <Input
                                        required
                                        placeholder="Misal: 200"
                                        value={nomorPengajuan}
                                        onChange={(event) =>
                                            setNomorPengajuan(
                                                event.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        className={`border-white/20 bg-white/10 text-white shadow-lg ring-offset-transparent transition-all duration-300 placeholder:text-blue-100 focus-visible:ring-2 ${config.accentRing}`}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-full border border-white/20 bg-white/15 px-6 text-white transition-all duration-300 hover:bg-white/25"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-full text-blue-50 transition-colors duration-300 hover:bg-white/15"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Batal
                                </Button>
                            </form>
                        </div>
                    )}

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>No. Pengajuan</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Nama Pemohon</TableHead>
                                    <TableHead>Jenis Permohonan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="p-12 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3 text-blue-100">
                                                <div className="rounded-full bg-white/10 p-4">
                                                    <FolderX className="h-8 w-8 text-blue-100" />
                                                </div>
                                                <p className="text-base font-medium">
                                                    {config.emptyLabel}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.data.map((document) => (
                                        <TableRow
                                            key={document.id}
                                            className="group"
                                        >
                                            <TableCell className="font-semibold text-white">
                                                {document.id_pengajuan}
                                            </TableCell>
                                            <TableCell className="text-blue-50">
                                                {formatDate(
                                                    document.tanggal_masuk_pengambilan_dokumen,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-blue-50">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white">
                                                        {document.nama_pemohon}
                                                    </span>
                                                    <span className="text-xs text-blue-100">
                                                        {
                                                            document.nomor_wa_pemohon
                                                        }
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-blue-50">
                                                {
                                                    serviceLabels[
                                                        document.jenis_layanan
                                                    ]
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <select
                                                    value={
                                                        document.status_proses
                                                    }
                                                    onChange={(event) =>
                                                        handleStatusChange(
                                                            document.id,
                                                            event.target.value,
                                                        )
                                                    }
                                                    disabled={
                                                        updatingId ===
                                                            document.id ||
                                                        deletingId ===
                                                            document.id
                                                    }
                                                    className={`cursor-pointer appearance-none rounded-full border px-4 py-2 text-xs font-semibold ring-offset-white transition-all duration-300 outline-none hover:opacity-80 focus-visible:ring-2 ${config.accentRing} ${getStatusColor(document.status_proses)}`}
                                                >
                                                    {statusOptions
                                                        .filter(
                                                            (option) =>
                                                                option.value,
                                                        )
                                                        .map((option) => (
                                                            <option
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                                className="bg-slate-900 text-white"
                                                            >
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                </select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setSelectedDocument(
                                                                document,
                                                            )
                                                        }
                                                        className="h-9 w-9 rounded-full text-cyan-100 hover:bg-cyan-500/20 hover:text-white"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={
                                                            updatingId ===
                                                                document.id ||
                                                            deletingId ===
                                                                document.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                document.id,
                                                            )
                                                        }
                                                        className="h-9 w-9 rounded-full text-rose-100 hover:bg-rose-500/20 hover:text-white"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 p-6 text-sm text-blue-100 sm:flex-row">
                            <span>
                                Menampilkan{' '}
                                <span className="font-bold text-white">
                                    {documents.data.length}
                                </span>{' '}
                                dari total{' '}
                                <span className="font-bold text-white">
                                    {formatStat(documents.total)}
                                </span>{' '}
                                data
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {documents.links.map((link, index) =>
                                    link.url ? (
                                        <Button
                                            key={index}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            className={`h-9 min-w-9 rounded-full px-3 font-bold transition-all duration-300 ${link.active ? 'border-white/20 bg-white/20 text-white shadow-lg hover:bg-white/30' : 'border-white/20 bg-white/10 text-blue-50 hover:bg-white/20'}`}
                                            onClick={() =>
                                                router.get(
                                                    link.url ?? config.href,
                                                    { search, status },
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="h-9 min-w-9 rounded-full border-white/20 px-3 font-bold text-blue-100 opacity-50"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DetailModal
                document={selectedDocument}
                open={selectedDocument !== null}
                sendingWhatsappId={sendingWhatsappId}
                onSendInvalidWhatsapp={handleSendInvalidWhatsapp}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDocument(null);
                    }
                }}
            />
        </AppLayout>
    );
}
