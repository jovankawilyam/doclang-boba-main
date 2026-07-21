import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Loader2,
    Pencil,
    Power,
    PowerOff,
    Search,
    Shield,
    Trash2,
    UserPlus,
    Users,
    XCircle,
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAdmins {
    data: Admin[];
    links: PaginationLink[];
    total: number;
}

interface Stats {
    super_admin: number;
    admin: number;
    total: number;
    active: number;
    inactive: number;
}

interface Props {
    admins: PaginatedAdmins;
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

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));

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
    const [filtering, setFiltering] = useState(false);

    

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setFiltering(true);
        router.get(
            '/admin',
            { search, status: statusFilter === 'all' ? '' : statusFilter },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setFiltering(false),
            },
        );
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setFiltering(true);
        router.get(
            '/admin',
            { search, status: value === 'all' ? '' : value },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setFiltering(false),
            },
        );
    };

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
                router.reload({ only: ['admins', 'stats'] });
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

            <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 text-slate-950 md:p-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Administrasi Sistem
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                                Manajemen Admin
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Kelola akun petugas, status akses, dan peran
                                pengguna internal Doclang Boba.
                            </p>
                        </div>
                        <Link href="/admin/create">
                            <Button className="gap-2 rounded-md border border-slate-950 bg-slate-950 text-white hover:bg-slate-100 hover:text-black">
                                <UserPlus className="h-4 w-4" />
                                Tambah Admin
                            </Button>
                        </Link>
                    </header>

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

                    <section className="grid gap-4 md:grid-cols-4">
                        <AdminMetric
                            icon={Users}
                            label="Total Admin"
                            value={stats.total}
                        />
                        <AdminMetric
                            icon={Shield}
                            label="Super Admin"
                            value={stats.super_admin}
                        />
                        <AdminMetric
                            icon={CheckCircle}
                            label="Aktif"
                            value={stats.active}
                        />
                        <AdminMetric
                            icon={XCircle}
                            label="Nonaktif"
                            value={stats.inactive}
                        />
                    </section>

                    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
                        <CardHeader className="border-b border-slate-200 p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold text-slate-950">
                                        Daftar Akun Admin
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Menampilkan{' '}
                                        {formatStat(admins.data.length)} dari{' '}
                                        {formatStat(stats.total)} akun.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <form
                                        onSubmit={handleSearch}
                                        className="flex gap-3"
                                    >
                                        <div className="relative w-full sm:w-72">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                placeholder="Cari nama atau email"
                                                className="border-slate-300 bg-white pl-9 text-slate-950 placeholder:text-slate-400"
                                                value={search}
                                                onChange={(event) =>
                                                    setSearch(event.target.value)
                                                }
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(event) =>
                                                handleFilterChange(
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                        >
                                            <option value="all">
                                                Semua Status
                                            </option>
                                            <option value="active">
                                                Aktif
                                            </option>
                                            <option value="inactive">
                                                Nonaktif
                                            </option>
                                        </select>
                                        {filtering && (
                                            <Loader2 className="h-5 w-5 animate-spin self-center text-slate-500" />
                                        )}
                                    </form>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-5 py-3">
                                                Admin
                                            </th>
                                            <th className="px-5 py-3">
                                                Role
                                            </th>
                                            <th className="px-5 py-3">
                                                Status
                                            </th>
                                            <th className="px-5 py-3">
                                                Bergabung
                                            </th>
                                            <th className="px-5 py-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {admins.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-5 py-10 text-center text-slate-500"
                                                >
                                                    Tidak ada admin yang cocok
                                                    dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            admins.data.map((admin) => (
                                                <tr
                                                    key={admin.id}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                                <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                                                                    {getInitials(
                                                                        admin.name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold text-slate-950">
                                                                    {admin.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        admin.email
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                admin.role ===
                                                                'super_admin'
                                                                    ? 'rounded-md border-indigo-200 bg-indigo-50 text-indigo-800'
                                                                    : 'rounded-md border-slate-200 bg-slate-50 text-slate-700'
                                                            }
                                                        >
                                                            {admin.role ===
                                                            'super_admin'
                                                                ? 'Super Admin'
                                                                : 'Admin'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                admin.is_active
                                                                    ? 'rounded-md border-emerald-200 bg-emerald-50 text-emerald-800'
                                                                    : 'rounded-md border-slate-200 bg-slate-50 text-slate-600'
                                                            }
                                                        >
                                                            {admin.is_active
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        {formatDate(
                                                            admin.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={`/admin/${admin.id}/edit`}
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-9 gap-2 border-slate-300 hover:text-blue-600 hover:border-blue-300"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-9 gap-2 border-slate-300 hover:bg-rose text-white hover:text-yellow-700"
                                                                disabled={
                                                                    processingId ===
                                                                        admin.id ||
                                                                    admin.id ===
                                                                        auth
                                                                            .user
                                                                            .id
                                                                }
                                                                onClick={() =>
                                                                    handleToggle(
                                                                        admin.id,
                                                                    )
                                                                }
                                                            >
                                                                {admin.is_active ? (
                                                                    <PowerOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Power className="h-4 w-4" />
                                                                )}
                                                                {processingId ===
                                                                admin.id
                                                                    ? 'Memproses'
                                                                    : admin.is_active
                                                                      ? 'Nonaktifkan'
                                                                      : 'Aktifkan'}
                                                            </Button>
                                                            {admin.id !==
                                                                auth.user
                                                                    .id && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-9 gap-2 border-slate-300 hover:bg-rose :text-white hover:text-rose-700"
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
                                                                    <Trash2 className="h-4 w-4" />
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

                            {admins.links && admins.links.length > 3 && (
                                <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-200 p-5">
                                    {admins.links.map((link, index) =>
                                        link.url ? (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className={`h-9 min-w-9 rounded-md px-3 font-bold transition-all duration-300 ${
                                                    link.active
                                                        ? 'bg-slate-950 text-white hover:bg-slate-800'
                                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                                }`}
                                                onClick={() =>
                                                    router.get(
                                                        link.url ?? '/admin',
                                                        {},
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
                            )}
                        </CardContent>
                    </Card>

                    <Dialog
                        open={confirmModalOpen}
                        onOpenChange={(open) => {
                            if (!open && !deleteProcessing) closeDeleteModal();
                        }}
                    >
                        <DialogContent className="border border-slate-200 bg-white text-slate-950 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle>Hapus Akun Admin</DialogTitle>
                                <DialogDescription className="text-slate-600">
                                    Akun{' '}
                                    <span className="font-semibold text-slate-950">
                                        {selectedAdmin?.name}
                                    </span>{' '}
                                    ({selectedAdmin?.email}) akan dihapus dari
                                    daftar admin. Akun ini tidak bisa login lagi
                                    setelah dihapus.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-slate-300 text-slate-700"
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
                                        ? 'Menghapus'
                                        : 'Konfirmasi Hapus'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </AppLayout>
    );
}

function AdminMetric({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Users;
    label: string;
    value: number;
}) {
    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        {formatStat(value)}
                    </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-slate-700">
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}
