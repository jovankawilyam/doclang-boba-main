import { Head, router } from '@inertiajs/react';
import { FileText, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Validasi PPh', href: '/documents/validasi-pph' },
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

export default function ValidasiPPh({ documents, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [showAddForm, setShowAddForm] = useState(false);
    const [nomorPengajuan, setNomorPengajuan] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/documents/validasi-pph', { search }, { preserveState: true });
    };

    const handleStatusChange = (docId: number, field: string, value: string) => {
        router.patch(`/documents/${docId}`, {
            [field]: value
        }, { preserveScroll: true });
    };

    const handleDelete = (docId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus validasi PPh ini?')) {
            router.delete(`/documents/${docId}`, { preserveScroll: true });
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formatted = `${nomorPengajuan}/V-PPh/2026`;

        // Kirim ke endpoint tunggal /documents dengan kategori validasi_pph
        router.post('/documents', {
            nomor_pengajuan: formatted,
            status_proses: 'proses',
            category: 'validasi_pph',
            catatan: null,
        }, {
            onSuccess: () => {
                setShowAddForm(false);
                setNomorPengajuan('');
            },
            onError: (err) => {
                alert(Object.values(err).flat().join(', '));
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'siap_diambil': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'selesai': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'proses': default: return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Validasi PPh" />

            <div className="flex flex-col gap-8 p-6 md:p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Validasi PPh</h1>
                        <p className="text-muted-foreground">Kelola status validasi PPh dokumen lelang.</p>
                    </div>
                </div>

                <Card className="rounded-2xl shadow-sm border-slate-200/60 dark:border-slate-800">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b pb-5 gap-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                            <FileText className="h-5 w-5 text-primary" />
                            Daftar Validasi PPh
                        </CardTitle>
                        <div className="flex w-full md:w-auto items-center gap-3">
                            <form onSubmit={handleSearch} className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari Nomor Validasi..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full shadow-sm rounded-full bg-slate-50 dark:bg-slate-900"
                                />
                            </form>
                            <Button 
                                onClick={() => setShowAddForm(!showAddForm)} 
                                className="gap-2 shadow-sm hover:shadow-md transition-all whitespace-nowrap rounded-full px-5"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Data
                            </Button>
                        </div>
                    </CardHeader>

                    {showAddForm && (
                        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
                            <form onSubmit={handleAddSubmit} className="flex gap-4 items-end max-w-lg">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Validasi Baru (angka saja)</label>
                                    <Input
                                        required
                                        placeholder="Misal: 200"
                                        value={nomorPengajuan}
                                        onChange={(e) => setNomorPengajuan(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="shadow-sm bg-white dark:bg-slate-950"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Format: <span className="font-medium text-slate-600 dark:text-slate-400">{nomorPengajuan ? `${nomorPengajuan}/V-PPh/2026` : '.../V-PPh/2026'}</span></p>
                                </div>
                                <Button type="submit" className="rounded-full px-6">Simpan</Button>
                                <Button type="button" variant="ghost" className="rounded-full" onClick={() => setShowAddForm(false)}>Batal</Button>
                            </form>
                        </div>
                    )}

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/30">
                                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <th className="px-6 py-4">No. Validasi PPh</th>
                                        <th className="px-6 py-4">Status Proses</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {documents.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                                Tidak ada data validasi PPh ditemukan.
                                            </td>
                                        </tr>
                                    ) : documents.data.map((doc: DocumentItem) => (
                                        <tr key={doc.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="px-6 py-5 font-medium text-slate-800 dark:text-slate-200">{doc.nomor_pengajuan}</td>
                                            <td className="px-6 py-5">
                                                <select
                                                    value={doc.status_proses}
                                                    onChange={(e) => handleStatusChange(doc.id, 'status_proses', e.target.value)}
                                                    className={`text-xs font-semibold rounded-full px-4 py-1.5 appearance-none outline-none border border-transparent cursor-pointer transition-all hover:opacity-80 focus:ring-2 focus:ring-offset-1 focus:ring-primary/20 ${getStatusColor(doc.status_proses)}`}
                                                >
                                                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full h-8 w-8"
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

                        <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400 gap-4">
                            <span>Menampilkan <span className="font-medium text-slate-900 dark:text-white">{documents.data.length}</span> dari total <span className="font-medium text-slate-900 dark:text-white">{documents.total}</span> data</span>
                            <div className="flex gap-1.5">
                                {documents.links.map((link: any, index: number) => (
                                    link.url ? (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            className={`min-w-8 h-8 px-3 rounded-md transition-colors font-medium ${link.active ? 'shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                                            onClick={() => router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="min-w-8 h-8 px-3 opacity-50 rounded-md font-medium"
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