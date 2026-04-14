import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Users,
    Shield,
    UserPlus,
    Power,
    PowerOff,
    Trash2,
    Search,
    ChevronRight,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Manajemen Admin', href: '/admin' },
];

interface Admin {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin';
    is_active: boolean;
    created_at: string;
}

interface Stats {
    super_admin: number;
    admin: number;
    total: number;
}

interface Props {
    admins: Admin[];
    stats: Stats;
}

export default function AdminIndex({ admins, stats }: Props) {
    const { props } = usePage<{ flash: { success?: string; error?: string } }>();
    const flash = props.flash ?? {};
    const [search, setSearch] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const filtered = admins.filter(
        (a) =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase()),
    );

    const handleToggle = (id: number) => {
        router.patch(`/admin/${id}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (confirmDelete === id) {
            router.delete(`/admin/${id}`, { preserveScroll: true });
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Admin" />

            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Manajemen Admin</h1>
                        <p className="text-muted-foreground">Kelola akun admin dan hak akses sistem</p>
                    </div>
                    <Link href="/admin/create">
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Tambah Admin
                        </Button>
                    </Link>
                </div>

                {/* Flash Messages */}
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

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Super Admin</p>
                                <p className="text-3xl font-bold">{stats.super_admin}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Admin</p>
                                <p className="text-3xl font-bold">{stats.admin}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Admin</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Daftar Admin
                            </CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau email..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="pb-3 font-medium">Nama</th>
                                        <th className="pb-3 font-medium">Email</th>
                                        <th className="pb-3 font-medium">Role</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Bergabung</th>
                                        <th className="pb-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                                Tidak ada admin yang ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((admin) => (
                                            <tr key={admin.id} className="border-b last:border-0">
                                                <td className="py-4 text-sm font-medium">{admin.name}</td>
                                                <td className="py-4 text-sm text-muted-foreground">{admin.email}</td>
                                                <td className="py-4 text-sm">
                                                    <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'}>
                                                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-sm">
                                                    <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                                                        {admin.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 text-sm text-muted-foreground">
                                                    {new Date(admin.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant={admin.is_active ? 'outline' : 'outline'}
                                                            size="sm"
                                                            className="h-8 gap-1"
                                                            onClick={() => handleToggle(admin.id)}
                                                        >
                                                            {admin.is_active ? (
                                                                <>
                                                                    <PowerOff className="h-3 w-3" />
                                                                    Nonaktifkan
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="h-3 w-3" />
                                                                    Aktifkan
                                                                </>
                                                            )}
                                                        </Button>
                                                        {admin.role !== 'super_admin' && (
                                                            <Button
                                                                variant={confirmDelete === admin.id ? 'destructive' : 'ghost'}
                                                                size="sm"
                                                                className="h-8 gap-1"
                                                                onClick={() => handleDelete(admin.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                {confirmDelete === admin.id ? 'Konfirmasi?' : 'Hapus'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {confirmDelete !== null && (
                            <div className="mt-3 flex items-center justify-end gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                                Klik tombol "Konfirmasi?" sekali lagi untuk menghapus admin ini secara permanen.
                                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                                    Batal
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
