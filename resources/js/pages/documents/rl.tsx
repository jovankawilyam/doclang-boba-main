import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    FileText,
    FolderX,
    Loader2,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Dokumen Pengajuan Kutipan RL', href: '/documents/rl' },
];

const statusOptions = [
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

interface DocumentItem {
    id: number;
    id_pengajuan: string;
    tanggal_masuk_pengambilan_dokumen: string | null;
    kode_lot_lelang: string;
    peran_pemohon: string | null;
    nama_pemohon: string;
    nomor_wa_pemohon: string;
    nomor_dokumen: string | null;
    tanggal_dokumen: string | null;
    dokumen_identitas_pemohon_path: string | null;
    dokumen_identitas_pemberi_kuasa_path: string | null;
    surat_kuasa_path: string | null;
    bukti_pelunasan_path: string | null;
    status_proses: string;
    catatan_tidak_valid: string | null;
}

export default function DocumentsRLIndex({ documents, filters }: any) {
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/documents/rl',
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
            '/documents/rl',
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

    const handleStatusChange = (
        docId: number,
        field: string,
        value: string,
    ) => {
        const payload: Record<string, string> = {
            [field]: value,
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

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const formatted = `${nomorPengajuan}/K-RL/2026`;

        router.post(
            '/documents',
            {
                nomor_pengajuan: formatted,
                status_proses: 'proses',
                category: 'kutipan_rl',
            },
            {
                onSuccess: () => {
                    setShowAddForm(false);
                    setNomorPengajuan('');
                },
                onError: (errors) => {
                    alert(Object.values(errors).flat().join(', '));
                },
                onFinish: () => {
                    setProcessing(false);
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'siap_diambil':
                return 'bg-cyan-500/20 text-cyan-200 border-cyan-300/40';
            case 'selesai':
                return 'bg-emerald-500/20 text-emerald-200 border-emerald-300/40';
            case 'tidak_valid':
                return 'bg-rose-500/20 text-rose-200 border-rose-300/40';
            case 'proses':
            default:
                return 'bg-amber-500/20 text-amber-200 border-amber-300/40';
        }
    };

    const getStorageUrl = (path: string | null) =>
        path ? `/storage/${path}` : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Dokumen Kutipan RL" />

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
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-white">
                            Dokumen Kutipan RL
                        </h1>
                        <p className="text-blue-100">
                            Kelola status Kutipan Risalah Lelang.
                        </p>
                    </div>
                </div>

                <Card
                    className={`rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition-all duration-300 ${filtering ? 'opacity-60' : ''}`}
                >
                    <CardHeader className="flex flex-col items-center justify-between gap-4 border-b border-white/15 pb-5 md:flex-row">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                            <FileText className="h-5 w-5 text-cyan-100 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                            Daftar Pengajuan Kutipan RL
                        </CardTitle>
                        <div className="flex w-full items-center gap-3 md:w-auto">
                            <form
                                onSubmit={handleSearch}
                                className="flex w-full flex-col gap-2 md:w-auto md:flex-row"
                            >
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-blue-100" />
                                    <Input
                                        type="text"
                                        placeholder="Cari Nomor Pengajuan..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full rounded-full border-white/20 bg-white/10 pl-9 text-white shadow-lg ring-offset-transparent transition-all duration-300 placeholder:text-blue-100 focus-visible:ring-2 focus-visible:ring-amber-500"
                                    />
                                </div>
                                <select
                                    value={status}
                                    onChange={(e) =>
                                        onFilterChange(e.target.value)
                                    }
                                    className="h-10 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-medium text-white shadow-lg backdrop-blur-lg transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                >
                                    {statusOptions.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
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
                                        placeholder="Masukkan angka saja, misal: 146"
                                        value={nomorPengajuan}
                                        onChange={(e) =>
                                            setNomorPengajuan(
                                                e.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        className="border-white/20 bg-white/10 text-white shadow-lg ring-offset-transparent transition-all duration-300 placeholder:text-blue-100 focus-visible:ring-2 focus-visible:ring-amber-500"
                                    />
                                    <p className="text-[10px] text-blue-100">
                                        Format:{' '}
                                        <span className="font-bold text-white">
                                            {nomorPengajuan
                                                ? `${nomorPengajuan}/K-RL/2026`
                                                : '.../K-RL/2026'}
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className={`rounded-full border border-white/20 bg-white/15 px-6 text-white transition-all duration-300 hover:bg-white/25 ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
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
                                    <TableHead>ID Pengajuan</TableHead>
                                    <TableHead>Kode Lot</TableHead>
                                    <TableHead>Pemohon</TableHead>
                                    <TableHead>Berkas Dokumen</TableHead>
                                    <TableHead>Detail Dokumen Resmi</TableHead>
                                    <TableHead>Status Proses</TableHead>
                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="p-12 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3 text-blue-100">
                                                <div className="rounded-full bg-white/10 p-4">
                                                    <FolderX className="h-8 w-8 text-blue-100" />
                                                </div>
                                                <p className="text-base font-medium">
                                                    Tidak ada data Kutipan RL
                                                    ditemukan.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.data.map((doc: DocumentItem) => (
                                        <TableRow
                                            key={doc.id}
                                            className="group"
                                        >
                                            <TableCell className="font-semibold text-white">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {doc.id_pengajuan}
                                                    </span>
                                                    <span className="text-xs font-medium text-blue-100">
                                                        {formatDate(
                                                            doc.tanggal_masuk_pengambilan_dokumen,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-blue-50">
                                                {doc.kode_lot_lelang}
                                            </TableCell>
                                            <TableCell className="text-blue-50">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white">
                                                        {doc.nama_pemohon}
                                                    </span>
                                                    <span className="text-xs text-blue-100">
                                                        {doc.nomor_wa_pemohon}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-blue-50">
                                                {getStorageUrl(
                                                    doc.bukti_pelunasan_path,
                                                ) ? (
                                                    <a
                                                        href={
                                                            getStorageUrl(
                                                                doc.bukti_pelunasan_path,
                                                            ) ?? '#'
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition-all duration-300 hover:bg-white/20"
                                                    >
                                                        Unduh Berkas
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-blue-50">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {doc.nomor_dokumen ??
                                                            '-'}
                                                    </span>
                                                    <span className="text-xs text-blue-100">
                                                        {formatDate(
                                                            doc.tanggal_dokumen,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <select
                                                            value={
                                                                doc.status_proses
                                                            }
                                                            onChange={(e) =>
                                                                handleStatusChange(
                                                                    doc.id,
                                                                    'status_proses',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                    doc.id ||
                                                                deletingId ===
                                                                    doc.id
                                                            }
                                                            className={`cursor-pointer appearance-none rounded-full border px-4 py-2 text-xs font-semibold ring-offset-white transition-all duration-300 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${getStatusColor(doc.status_proses)}`}
                                                        >
                                                            {statusOptions
                                                                .filter(
                                                                    (opt) =>
                                                                        opt.value,
                                                                )
                                                                .map((opt) => (
                                                                    <option
                                                                        key={
                                                                            opt.value
                                                                        }
                                                                        value={
                                                                            opt.value
                                                                        }
                                                                        className="bg-slate-900 text-white"
                                                                    >
                                                                        {
                                                                            opt.label
                                                                        }
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Ubah status dokumen
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="max-w-56 text-sm text-blue-50">
                                                {doc.status_proses ===
                                                'tidak_valid'
                                                    ? (doc.catatan_tidak_valid ??
                                                      '-')
                                                    : '-'}
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
                                pengajuan
                            </span>
                            <div className="flex gap-1.5">
                                {documents.links.map(
                                    (link: any, index: number) =>
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
                                                        link.url,
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
        </AppLayout>
    );
}
