import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Eye,
    FileText,
    FolderX,
    Loader2,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import DetailModal from '@/components/documents/detail-modal';
import type { DocumentItem, StatusProses, WhatsappNotification } from '@/types/document';
import type { BreadcrumbItem } from '@/types';

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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'siap_diambil':
            return 'border-sky-200 bg-sky-50 text-sky-800';
        case 'selesai':
            return 'border-emerald-200 bg-emerald-50 text-emerald-800';
        case 'tidak_valid':
            return 'border-rose-200 bg-rose-50 text-rose-800';
        case 'proses':
        default:
            return 'border-amber-200 bg-amber-50 text-amber-800';
    }
};

const getStatusLabel = (status: StatusProses) =>
    statusOptions.find((option) => option.value === status)?.label ?? status;

const confirmationAlert = {
    icon: 'warning' as const,
    showCancelButton: true,
    confirmButtonColor: '#000000',
    cancelButtonColor: '#dc2626',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
        container: 'pointer-events-auto',
    },
};

export default function DocumentDashboard({
    documents,
    filters,
    config,
}: DocumentDashboardProps) {
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
        auth?: { user?: { role?: string } };
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
    const [retryingNotificationId, setRetryingNotificationId] = useState<
        number | null
    >(null);

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

    const handleStatusChange = async (docId: number, value: StatusProses) => {
        if (value === 'tidak_valid') {
            const result = await Swal.fire({
                ...confirmationAlert,
                title: 'Tandai Tidak Valid?',
                text: 'Isi alasan agar pemohon mengetahui berkas yang perlu diperbaiki.',
                input: 'textarea',
                inputLabel: 'Catatan Tidak Valid',
                inputPlaceholder:
                    'Contoh: KTP tidak terbaca, mohon unggah ulang dokumen yang jelas.',
                inputAttributes: {
                    'aria-label': 'Catatan Tidak Valid',
                },
                confirmButtonText: 'Simpan Tidak Valid',
                inputValidator: (value) =>
                    value.trim()
                        ? undefined
                        : 'Catatan tidak valid wajib diisi.',
            });

            if (!result.isConfirmed) return;

            setUpdatingId(docId);
            router.patch(
                `/permohonan/${docId}`,
                {
                    status_proses: 'tidak_valid',
                    catatan_tidak_valid: result.value.trim(),
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: (errors) => {
                        void Swal.fire({
                            icon: 'error',
                            title: 'Gagal Menyimpan Status',
                            text:
                                typeof errors.catatan_tidak_valid === 'string'
                                    ? errors.catatan_tidak_valid
                                    : 'Status tidak valid gagal disimpan.',
                            confirmButtonColor: '#000000',
                        });
                    },
                    onFinish: () => setUpdatingId(null),
                },
            );
            return;
        }

        setUpdatingId(docId);
        router.patch(
            `/permohonan/${docId}`,
            { status_proses: value },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setUpdatingId(null),
            },
        );
    };

    const handleDelete = async (document: DocumentItem) => {
        const result = await Swal.fire({
            ...confirmationAlert,
            title: 'Hapus Pengajuan?',
            text: `Pengajuan ${document.id_pengajuan} akan dihapus dan tidak dapat dipulihkan.`,
            confirmButtonText: 'Ya, Hapus',
        });

        if (!result.isConfirmed) return;

        setDeletingId(document.id);
        router.delete(`/permohonan/${document.id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const handleSendInvalidWhatsapp = async (document: DocumentItem) => {
        const recipients = [
            `pemohon (${document.nomor_wa_pemohon})`,
            document.nomor_wa_pemberi_kuasa
                ? `kuasa (${document.nomor_wa_pemberi_kuasa})`
                : null,
        ].filter(Boolean);
        const result = await Swal.fire({
            ...confirmationAlert,
            title: 'Kirim WhatsApp?',
            text: `Kirim pemberitahuan dokumen tidak valid ke ${recipients.join(' dan ')}?`,
            confirmButtonText: 'Ya, Kirim',
        });

        if (!result.isConfirmed) return;

        setSendingWhatsappId(document.id);
        router.post(
            `/permohonan/${document.id}/send-invalid-notification`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSelectedDocument(null),
                onFinish: () => setSendingWhatsappId(null),
            },
        );
    };

    const handleRetryWhatsapp = async (
        notification: WhatsappNotification,
    ) => {
        const result = await Swal.fire({
            ...confirmationAlert,
            title: 'Kirim Ulang WhatsApp?',
            text: `Kirim ulang notifikasi ke ${notification.target_number}?`,
            confirmButtonText: 'Ya, Kirim Ulang',
        });

        if (!result.isConfirmed) return;

        setRetryingNotificationId(notification.id);
        router.post(
            `/whatsapp-notifications/${notification.id}/retry`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSelectedDocument(null),
                onFinish: () => setRetryingNotificationId(null),
            },
        );
    };

    const handleAddSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);

        router.post(
            '/documents',
            {
                nomor_pengajuan: nomorPengajuan,
                status_proses: 'proses',
                category: config.addCategory,
            },
            {
                onSuccess: () => {
                    setShowAddForm(false);
                    setNomorPengajuan('');
                },
                onError: (errors) => {
                    void Swal.fire({
                        icon: 'error',
                        title: 'Dokumen Gagal Ditambahkan',
                        text: Object.values(errors).flat().join(', '),
                        confirmButtonColor: '#000000',
                    });
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

            <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 text-slate-950 md:p-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    {flash.success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                            <XCircle className="h-4 w-4 shrink-0" />
                            {flash.error}
                        </div>
                    )}

                    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Management
                        </p>
                        <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                                    {config.title}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                    {config.description}
                                </p>
                            </div>
                            <div className="text-sm text-slate-500">
                                Total data:{' '}
                                <span className="font-semibold text-slate-950">
                                    {formatStat(documents.total)}
                                </span>
                            </div>
                        </div>
                    </header>

                    <Card
                        className={`rounded-lg border-slate-200 bg-white shadow-sm transition-all duration-300 ${filtering ? 'opacity-60' : ''}`}
                    >
                        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                <FileText className="h-5 w-5 text-slate-600" />
                                Daftar Permohonan
                            </CardTitle>
                            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                                <form
                                    onSubmit={handleSearch}
                                    className="flex w-full flex-col gap-2 md:w-auto md:flex-row"
                                >
                                    <div className="relative w-full md:w-64">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="Cari pengajuan..."
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            className="w-full rounded-md border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
                                        />
                                    </div>
                                    <select
                                        value={status}
                                        onChange={(event) =>
                                            onFilterChange(event.target.value)
                                        }
                                        className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
                                        <Loader2 className="h-5 w-5 animate-spin self-center text-slate-500" />
                                    )}
                                </form>
                                <Button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    disabled={processing}
                                    className="gap-2 rounded-md bg-slate-950 px-5 whitespace-nowrap text-white hover:bg-slate-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Data
                                </Button>
                            </div>
                        </CardHeader>

                        {showAddForm && (
                            <div className="animate-in border-b border-slate-200 bg-slate-50 p-5 duration-300 fade-in slide-in-from-top-4">
                                <form
                                    onSubmit={handleAddSubmit}
                                    className="flex max-w-lg items-end gap-4"
                                >
                                    <div className="flex-1 space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Kode Lot / Referensi Dokumen
                                        </label>
                                        <Input
                                            required
                                            placeholder="Misal: BGR-LOT-200"
                                            value={nomorPengajuan}
                                            onChange={(event) =>
                                                setNomorPengajuan(
                                                    event.target.value,
                                                )
                                            }
                                            className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-slate-950 px-6 text-white hover:bg-slate-800"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="rounded-md text-slate-600 transition-colors duration-300 hover:bg-slate-200"
                                        onClick={() => setShowAddForm(false)}
                                    >
                                        Batal
                                    </Button>
                                </form>
                            </div>
                        )}

                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="text-black">
                                    <TableRow className="text-black hover:bg-transparent">
                                        <TableHead className="text-black">
                                            No. Pengajuan
                                        </TableHead>
                                        <TableHead className="text-black">
                                            Tanggal
                                        </TableHead>
                                        <TableHead className="text-black">
                                            Nama Pemohon
                                        </TableHead>
                                        <TableHead className="text-black">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right text-black">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="p-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center space-y-3 text-slate-500">
                                                    <div className="rounded-full bg-slate-100 p-4">
                                                        <FolderX className="h-8 w-8 text-slate-400" />
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
                                                <TableCell className="font-semibold text-slate-950">
                                                    {document.id_pengajuan}
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {formatDate(
                                                        document.tanggal_masuk_pengambilan_dokumen,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-slate-700">
                                                    <span className="font-semibold text-slate-950">
                                                        {document.nama_pemohon}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <select
                                                        value={
                                                            document.status_proses
                                                        }
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                document.id,
                                                                event.target
                                                                    .value as StatusProses,
                                                            )
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                                document.id ||
                                                            deletingId ===
                                                                document.id
                                                        }
                                                        className={`cursor-pointer appearance-none rounded-md border px-3 py-2 text-xs font-semibold ring-offset-white outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-slate-400 ${getStatusColor(document.status_proses)}`}
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
                                                                    className="bg-white text-slate-950"
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
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
                                                            className="h-9 w-9 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
                                                                    document,
                                                                )
                                                            }
                                                            className="h-9 w-9 rounded-md text-rose-700 hover:bg-rose-50 hover:text-rose-800"
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

                            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 p-5 text-sm text-slate-500 sm:flex-row">
                                <span>
                                    Menampilkan{' '}
                                    <span className="font-bold text-slate-950">
                                        {documents.data.length}
                                    </span>{' '}
                                    dari total{' '}
                                    <span className="font-bold text-slate-950">
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
                                                className={`h-9 min-w-9 rounded-md px-3 font-bold transition-all duration-300 ${link.active ? 'bg-slate-950 text-white hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
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
                                                className="h-9 min-w-9 rounded-md border-slate-200 px-3 font-bold text-slate-400 opacity-50"
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
            </main>

            <DetailModal
                key={selectedDocument?.id ?? 'closed'}
                document={selectedDocument}
                open={selectedDocument !== null}
                sendingWhatsappId={sendingWhatsappId}
                onSendInvalidWhatsapp={handleSendInvalidWhatsapp}
                retryingNotificationId={retryingNotificationId}
                onRetryWhatsapp={handleRetryWhatsapp}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDocument(null);
                    }
                }}
            />
        </AppLayout>
    );
}
