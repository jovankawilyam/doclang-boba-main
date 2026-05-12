import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    FileText,
    FolderX,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    {
        title: 'Manajemen Dokumen Pengajuan Kuitansi',
        href: '/documents/kuitansi',
    },
];

const statusOptions = [
    { value: '', label: 'Semua' },
    { value: 'proses', label: 'Proses' },
    { value: 'siap_diambil', label: 'Siap Diambil' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'tidak_valid', label: 'Tidak Valid' },
];

interface DocumentItem {
    id: number;
    nomor_pengajuan: string;
    status_proses: string;
    catatan: string | null;
}

export default function DocumentsIndex({ documents, filters }: any) {
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();
    const flash = props.flash ?? {};
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showAddForm, setShowAddForm] = useState(false);
    const [nomorPengajuan, setNomorPengajuan] = useState('');
    const [processing, setProcessing] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/documents/kuitansi',
            { search, status },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleStatusChange = (
        docId: number,
        field: string,
        value: string,
    ) => {
        setUpdatingId(docId);
        router.patch(
            `/documents/${docId}`,
            {
                [field]: value,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setUpdatingId(null),
            },
        );
    };

    const handleDelete = (docId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
            setDeletingId(docId);
            router.delete(`/documents/${docId}`, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const formatted = `${nomorPengajuan}/KPHL/2026`;

        router.post(
            '/documents',
            {
                nomor_pengajuan: formatted,
                status_proses: 'proses',
                category: 'kuitansi',
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
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
            case 'selesai':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'proses':
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            case 'tidak_valid':
                return 'bg-red-50 text-red-900 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Dokumen Kuitansi" />

            <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-8 bg-slate-50 p-6 transition-colors duration-300 md:p-8 dark:bg-zinc-950">
                {flash.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <XCircle className="h-4 w-4 shrink-0" />
                        {flash.error}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 transition-colors duration-300 dark:text-zinc-100">
                            Dokumen Kuitansi
                        </h1>
                        <p className="text-slate-500 transition-colors duration-300 dark:text-zinc-400">
                            Kelola status Kuitansi Pasca Lelang.
                        </p>
                    </div>
                </div>

                <Card className="rounded-3xl border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
                    <CardHeader className="flex flex-col items-center justify-between gap-4 border-b border-slate-100 pb-5 transition-colors duration-300 md:flex-row dark:border-zinc-800/50">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 transition-colors duration-300 dark:text-zinc-100">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            Daftar Pengajuan Kuitansi
                        </CardTitle>
                        <div className="flex w-full items-center gap-3 md:w-auto">
                            <form
                                onSubmit={handleSearch}
                                className="flex w-full flex-col gap-2 md:w-auto md:flex-row"
                            >
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                                    <Input
                                        type="text"
                                        placeholder="Cari Nomor Pengajuan..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full rounded-full border-slate-200 bg-slate-50 pl-9 text-slate-900 shadow-sm ring-offset-white transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-offset-zinc-950"
                                    />
                                </div>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="h-10 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
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
                            </form>
                            <Button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="gap-2 rounded-full bg-blue-600 px-5 whitespace-nowrap text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Data
                            </Button>
                        </div>
                    </CardHeader>

                    {showAddForm && (
                        <div className="animate-in border-b border-slate-100 bg-slate-50/50 p-6 duration-300 fade-in slide-in-from-top-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
                            <form
                                onSubmit={handleAddSubmit}
                                className="flex max-w-lg items-end gap-4"
                            >
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 transition-colors duration-300 dark:text-zinc-300">
                                        Nomor Pengajuan Baru (angka saja)
                                    </label>
                                    <Input
                                        required
                                        placeholder="Masukkan angka saja, misal: 200"
                                        value={nomorPengajuan}
                                        onChange={(e) =>
                                            setNomorPengajuan(
                                                e.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        className="border-slate-200 bg-white text-slate-900 shadow-sm ring-offset-white transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-offset-zinc-950"
                                    />
                                    <p className="text-[10px] text-slate-500 transition-colors duration-300 dark:text-zinc-400">
                                        Akan tersimpan sebagai:{' '}
                                        <span className="font-bold text-slate-700 dark:text-zinc-300">
                                            {nomorPengajuan
                                                ? `${nomorPengajuan}/KPHL/2026`
                                                : '.../KPHL/2026'}
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className={`rounded-full bg-blue-600 px-6 text-white transition-all duration-300 hover:bg-blue-700 ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="rounded-full text-slate-700 transition-colors duration-300 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Batal
                                </Button>
                            </form>
                        </div>
                    )}

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-100 bg-slate-50/80 transition-colors duration-300 dark:border-zinc-800/50 dark:bg-zinc-900/80">
                                    <tr className="text-left text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-zinc-400">
                                        <th className="px-6 py-5">
                                            No. Pengajuan
                                        </th>
                                        <th className="px-6 py-5">
                                            Status Proses
                                        </th>
                                        <th className="px-6 py-5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                                    {documents.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="p-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center space-y-3 text-slate-500 transition-colors duration-300 dark:text-zinc-400">
                                                    <div className="rounded-full bg-slate-100 p-4 dark:bg-zinc-800">
                                                        <FolderX className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
                                                    </div>
                                                    <p className="text-base font-medium">
                                                        Tidak ada data kuitansi
                                                        ditemukan.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        documents.data.map(
                                            (doc: DocumentItem) => (
                                                <tr
                                                    key={doc.id}
                                                    className="group transition-colors duration-300 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                                                >
                                                    <td className="px-6 py-6 font-semibold text-slate-800 transition-colors duration-300 dark:text-zinc-200">
                                                        {doc.nomor_pengajuan}
                                                    </td>
                                                    <td className="px-6 py-6">
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
                                                            className={`cursor-pointer appearance-none rounded-full border px-4 py-2 text-xs font-bold ring-offset-white transition-all duration-300 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-offset-zinc-900 ${getStatusColor(doc.status_proses)}`}
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
                                                                        className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100"
                                                                    >
                                                                        {
                                                                            opt.label
                                                                        }
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={
                                                                deletingId ===
                                                                    doc.id ||
                                                                updatingId ===
                                                                    doc.id
                                                            }
                                                            className="h-9 w-9 rounded-full text-red-500 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    doc.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 p-6 text-sm text-slate-500 transition-colors duration-300 sm:flex-row dark:border-zinc-800/50 dark:text-zinc-400">
                            <span>
                                Menampilkan{' '}
                                <span className="font-bold text-slate-900 dark:text-zinc-100">
                                    {documents.data.length}
                                </span>{' '}
                                dari total{' '}
                                <span className="font-bold text-slate-900 dark:text-zinc-100">
                                    {documents.total}
                                </span>{' '}
                                data
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
                                                className={`h-9 min-w-9 rounded-full px-3 font-bold transition-all duration-300 ${link.active ? 'border-transparent bg-blue-600 text-white shadow-sm hover:bg-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
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
                                                className="h-9 min-w-9 rounded-full border-slate-200 px-3 font-bold text-slate-400 opacity-50 dark:border-zinc-700 dark:text-zinc-500"
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
