import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { FileText, Plus, Search, Trash2, FolderX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Dokumen Pengajuan Kuitansi', href: '/documents/kuitansi' },
];

const statusOptions = [
    { value: 'proses', label: 'Proses' },
    { value: 'siap_diambil', label: 'Siap Diambil' },
    { value: 'selesai', label: 'Selesai' },
];

interface DocumentItem {
    id: number;
    nomor_pengajuan: string;
    status_proses: string;
    catatan: string | null;
}

export default function DocumentsIndex({ documents, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [showAddForm, setShowAddForm] = useState(false);
    const [nomorPengajuan, setNomorPengajuan] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/documents/kuitansi', { search }, { preserveState: true });
    };

    const handleStatusChange = (docId: number, field: string, value: string) => {
        router.patch(`/documents/${docId}`, {
            [field]: value
        }, { preserveScroll: true });
    };

    const handleDelete = (docId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
            router.delete(`/documents/${docId}`, { preserveScroll: true });
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const formatted = `${nomorPengajuan}/KPHL/2026`;

        router.post('/documents', {
            nomor_pengajuan: formatted,
            status_proses: 'proses',
            category: 'kuitansi',
        }, {
            onSuccess: () => {
                setShowAddForm(false);
                setNomorPengajuan('');
            },
            onError: (errors) => {
                alert(Object.values(errors).flat().join(', '));
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'siap_diambil': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
            case 'selesai': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'proses': default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Dokumen Kuitansi" />

            <div className="flex flex-col gap-8 p-6 md:p-8 bg-slate-50 dark:bg-zinc-950 min-h-[calc(100vh-4rem)] transition-colors duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 transition-colors duration-300">Dokumen Kuitansi</h1>
                        <p className="text-slate-500 dark:text-zinc-400 transition-colors duration-300">Kelola status Kuitansi Pasca Lelang.</p>
                    </div>
                </div>

                <Card className="rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800/50">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-5 gap-4 transition-colors duration-300">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-zinc-100 transition-colors duration-300">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            Daftar Pengajuan Kuitansi
                        </CardTitle>
                        <div className="flex w-full md:w-auto items-center gap-3">
                            <form onSubmit={handleSearch} className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                                <Input
                                    type="text"
                                    placeholder="Cari Nomor Pengajuan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full shadow-sm rounded-full bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 ring-offset-white dark:ring-offset-zinc-950 duration-300 transition-all text-slate-900 dark:text-zinc-100"
                                />
                            </form>
                            <Button 
                                onClick={() => setShowAddForm(!showAddForm)} 
                                className="gap-2 shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap rounded-full px-5 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Data
                            </Button>
                        </div>
                    </CardHeader>

                    {showAddForm && (
                        <div className="p-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/50 animate-in slide-in-from-top-4 fade-in duration-300">
                            <form onSubmit={handleAddSubmit} className="flex gap-4 items-end max-w-lg">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 transition-colors duration-300">Nomor Pengajuan Baru (angka saja)</label>
                                    <Input
                                        required
                                        placeholder="Masukkan angka saja, misal: 200"
                                        value={nomorPengajuan}
                                        onChange={(e) => setNomorPengajuan(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="shadow-sm bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 ring-offset-white dark:ring-offset-zinc-950 duration-300 transition-all text-slate-900 dark:text-zinc-100"
                                    />
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 transition-colors duration-300">Akan tersimpan sebagai: <span className="font-bold text-slate-700 dark:text-zinc-300">{nomorPengajuan ? `${nomorPengajuan}/KPHL/2026` : '.../KPHL/2026'}</span></p>
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className={`rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                                <Button type="button" variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors duration-300" onClick={() => setShowAddForm(false)}>Batal</Button>
                            </form>
                        </div>
                    )}

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-100 dark:border-zinc-800/50 transition-colors duration-300">
                                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                        <th className="px-6 py-5">No. Pengajuan</th>
                                        <th className="px-6 py-5">Status Proses</th>
                                        <th className="px-6 py-5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                                    {documents.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3 text-slate-500 dark:text-zinc-400 transition-colors duration-300">
                                                    <div className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-full">
                                                        <FolderX className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
                                                    </div>
                                                    <p className="text-base font-medium">Tidak ada data kuitansi ditemukan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : documents.data.map((doc: DocumentItem) => (
                                        <tr key={doc.id} className="transition-colors duration-300 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 group">
                                            <td className="px-6 py-6 font-semibold text-slate-800 dark:text-zinc-200 transition-colors duration-300">{doc.nomor_pengajuan}</td>
                                            <td className="px-6 py-6">
                                                <select
                                                    value={doc.status_proses}
                                                    onChange={(e) => handleStatusChange(doc.id, 'status_proses', e.target.value)}
                                                    className={`text-xs font-bold rounded-full px-4 py-2 appearance-none outline-none border cursor-pointer transition-all duration-300 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ring-offset-white dark:ring-offset-zinc-900 ${getStatusColor(doc.status_proses)}`}
                                                >
                                                    {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">{opt.label}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 rounded-full h-9 w-9 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-zinc-400 gap-4 transition-colors duration-300">
                            <span>Menampilkan <span className="font-bold text-slate-900 dark:text-zinc-100">{documents.data.length}</span> dari total <span className="font-bold text-slate-900 dark:text-zinc-100">{documents.total}</span> data</span>
                            <div className="flex gap-1.5">
                                {documents.links.map((link: any, index: number) => (
                                    link.url ? (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            className={`min-w-9 h-9 px-3 rounded-full transition-all duration-300 font-bold ${link.active ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-transparent' : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-700'}`}
                                            onClick={() => router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="min-w-9 h-9 px-3 opacity-50 rounded-full font-bold border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}