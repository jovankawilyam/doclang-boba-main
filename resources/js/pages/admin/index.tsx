import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Users,
    Shield,
    UserPlus,
    Power,
    PowerOff,
    Trash2,
    Search,
    CheckCircle,
    XCircle,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

const formatStat = (value: number | undefined) =>
    new Intl.NumberFormat('id-ID').format(value ?? 0);

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

export default function AdminIndex({ admins, stats }: Props) {
    const { props } = usePage<{
        auth: { user: { id: number } };
        flash: { success?: string; error?: string };
    }>();
    const flash = props.flash ?? {};
    const auth = props.auth;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const filtered = admins.filter(
        (a) =>
            (statusFilter === 'all' ||
                (statusFilter === 'active' && a.is_active) ||
                (statusFilter === 'inactive' && !a.is_active)) &&
            (a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.email.toLowerCase().includes(search.toLowerCase())),
    );

    const handleToggle = (id: number) => {
        setProcessingId(id);
        router.patch(
            `/admin/${id}/toggle-status`,
            {},
            { preserveScroll: true, onFinish: () => setProcessingId(null) },
        );
    };

    const openDeleteModal = (admin: Admin) => {
        setSelectedAdmin(admin);
        setConfirmModalOpen(true);
    };

    const closeDeleteModal = () => {
        setConfirmModalOpen(false);
        setSelectedAdmin(null);
        setDeleteProcessing(false);
    };

    const confirmDeleteAdmin = () => {
        if (!selectedAdmin) return;

        setDeleteProcessing(true);
        setProcessingId(selectedAdmin.id);

        router.delete(`/admin/${selectedAdmin.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeDeleteModal();
                router.reload({
                    only: ['admins', 'stats'],
                });
            },
            onFinish: () => {
                setDeleteProcessing(false);
                setProcessingId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Admin" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between border-b border-white/20 pb-5">
                    <div>
                        <p className="text-sm font-semibold tracking-wide text-cyan-100 uppercase">
                            Administrasi Sistem
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                            Manajemen Admin
                        </h1>
                        <p className="text-sm font-medium text-blue-100">
                            Kelola akun admin dan hak akses sistem
                        </p>
                    </div>
                    <Link href="/admin/create">
                        <Button className="gap-2 border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-lg hover:bg-white/25">
                            <UserPlus className="h-4 w-4" />
                            Tambah Admin
                        </Button>
                    </Link>
                </div>

                {/* Flash Messages */}
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

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg border border-white/20 bg-white/15 p-3 shadow-[0_0_22px_rgba(125,211,252,0.35)]">
                                <Shield className="h-6 w-6 text-cyan-100 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">
                                    Super Admin
                                </p>
                                <p className="text-3xl font-bold">
                                    {formatStat(stats.super_admin)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg border border-white/20 bg-white/15 p-3 shadow-[0_0_22px_rgba(125,211,252,0.35)]">
                                <Users className="h-6 w-6 text-cyan-100 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Admin</p>
                                <p className="text-3xl font-bold">
                                    {formatStat(stats.admin)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg border border-white/20 bg-white/15 p-3 shadow-[0_0_22px_rgba(125,211,252,0.35)]">
                                <Users className="h-6 w-6 text-cyan-100 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">
                                    Total Admin
                                </p>
                                <p className="text-3xl font-bold">
                                    {formatStat(stats.total)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card className="rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
                    <CardHeader className="border-b border-white/15 px-6 py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                                <Users className="h-5 w-5" />
                                Daftar Admin
                            </CardTitle>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-blue-100" />
                                    <Input
                                        placeholder="Cari nama atau email..."
                                        className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-blue-100"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="h-10 rounded-md border border-white/20 bg-white/10 px-3 text-sm font-medium text-white shadow-lg backdrop-blur-lg transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 border-b border-white/20 bg-white/10 text-left text-xs text-blue-50 uppercase backdrop-blur-md">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            Nama
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Bergabung
                                        </th>
                                        <th className="px-6 py-4 text-right font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-10 text-center text-sm text-blue-100"
                                            >
                                                Tidak ada admin yang ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((admin) => (
                                            <tr
                                                key={admin.id}
                                                className="last:border-0 hover:bg-white/10"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border border-white/20">
                                                            <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">
                                                                {getInitials(
                                                                    admin.name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-white">
                                                                {admin.name}
                                                            </p>
                                                            <p className="text-xs text-blue-100">
                                                                ID Admin #
                                                                {admin.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-blue-100">
                                                    {admin.email}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full border-white/20 bg-white/10 text-blue-50"
                                                    >
                                                        {admin.role ===
                                                        'super_admin'
                                                            ? 'Super Admin'
                                                            : 'Admin'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            admin.is_active
                                                                ? 'rounded-full border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-200'
                                                                : 'rounded-full border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100'
                                                        }
                                                    >
                                                        {admin.is_active
                                                            ? 'ACTIVE'
                                                            : 'INACTIVE'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-blue-100">
                                                    {new Date(
                                                        admin.created_at,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant={
                                                                admin.is_active
                                                                    ? 'outline'
                                                                    : 'outline'
                                                            }
                                                            size="sm"
                                                            className="h-8 gap-1 border-white/20 bg-white/10 text-blue-50 hover:bg-white/20 hover:text-white"
                                                            disabled={
                                                                processingId ===
                                                                    admin.id ||
                                                                admin.id ===
                                                                    auth.user.id
                                                            }
                                                            onClick={() =>
                                                                handleToggle(
                                                                    admin.id,
                                                                )
                                                            }
                                                        >
                                                            {admin.is_active ? (
                                                                <>
                                                                    <PowerOff className="h-3 w-3" />
                                                                    {processingId ===
                                                                    admin.id
                                                                        ? 'Memproses...'
                                                                        : 'Nonaktifkan'}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="h-3 w-3" />
                                                                    {processingId ===
                                                                    admin.id
                                                                        ? 'Memproses...'
                                                                        : 'Aktifkan'}
                                                                </>
                                                            )}
                                                        </Button>
                                                        {admin.id !==
                                                            auth.user.id && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 gap-1 text-rose-100 hover:bg-rose-400/20 hover:text-white"
                                                                disabled={
                                                                    deleteProcessing ||
                                                                    processingId ===
                                                                        admin.id
                                                                }
                                                                onClick={() =>
                                                                    openDeleteModal(
                                                                        admin,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Hapus
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
                    </CardContent>
                </Card>

                <Dialog
                    open={confirmModalOpen}
                    onOpenChange={(open) => {
                        if (!open && !deleteProcessing) closeDeleteModal();
                    }}
                >
                    <DialogContent className="border border-white/20 bg-blue-950/80 text-white shadow-2xl backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle>Hapus Admin</DialogTitle>
                            <DialogDescription className="text-blue-100">
                                Admin{' '}
                                <span className="font-semibold text-white">
                                    {selectedAdmin?.name}
                                </span>{' '}
                                akan dihapus dari sistem. Aksi ini tidak dapat
                                dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-white/20 bg-white/10 text-blue-50 hover:bg-white/20 hover:text-white"
                                disabled={deleteProcessing}
                                onClick={closeDeleteModal}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={deleteProcessing}
                                onClick={confirmDeleteAdmin}
                                className="gap-2"
                            >
                                {deleteProcessing && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {deleteProcessing
                                    ? 'Menghapus...'
                                    : 'Konfirmasi Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
