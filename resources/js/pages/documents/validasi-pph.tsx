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
        const formatted = `${nomorPengajuan}/PPh/2026`;

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
            case 'siap_diambil': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
            case 'selesai': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
            case 'proses': default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Validasi PPh" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Validasi PPh</h1>
                        <p className="text-muted-foreground">Kelola status validasi PPh dokumen lelang.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Daftar Validasi PPh
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <form onSubmit={handleSearch} className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    placeholder="Cari Nomor Validasi..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-64"
                                />
                                <Button type="submit" variant="secondary" size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah Validasi
                            </Button>
                        </div>
                    </CardHeader>

                    {showAddForm && (
                        <div className="p-4 bg-muted/30 border-b">
                            <form onSubmit={handleAddSubmit} className="flex gap-4 items-end max-w-lg">
                                <div className="flex-1 space-y-1">
                                    <label className="text-sm font-medium">Nomor Validasi Baru (angka saja)</label>
                                    <Input
                                        required
                                        placeholder="Misal: 200"
                                        value={nomorPengajuan}
                                        onChange={(e) => setNomorPengajuan(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Format: {nomorPengajuan ? `${nomorPengajuan}/PPh/2026` : '.../PPh/2026'}</p>
                                </div>
                                <Button type="submit">Simpan</Button>
                                <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Batal</Button>
                            </form>
                        </div>
                    )}

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3">No. Validasi PPh</th>
                                        <th className="px-4 py-3">Status Proses</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                                Tidak ada data validasi PPh ditemukan.
                                            </td>
                                        </tr>
                                    ) : documents.data.map((doc: DocumentItem) => (
                                        <tr key={doc.id} className="border-b transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium">{doc.nomor_pengajuan}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={doc.status_proses}
                                                    onChange={(e) => handleStatusChange(doc.id, 'status_proses', e.target.value)}
                                                    className={`text-xs font-medium rounded-full px-2 py-1 outline-none border cursor-pointer border-transparent ${getStatusColor(doc.status_proses)}`}
                                                >
                                                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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

                        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                            <span>Menampilkan {documents.data.length} dari total {documents.total} pengajuan</span>
                            <div className="flex gap-2">
                                {documents.links.map((link: any, index: number) => (
                                    link.url ? (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            className="h-8"
                                            onClick={() => router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="h-8 opacity-50"
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