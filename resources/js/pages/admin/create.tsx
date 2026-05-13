import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Loader2,
    Shield,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Manajemen Admin', href: '/admin' },
    { title: 'Tambah Admin', href: '/admin/create' },
];

export default function AdminCreate() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin' as 'admin' | 'super_admin',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Admin Baru" />

            <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 p-6">
                <div className="flex items-center gap-4 border-b border-white/20 pb-5">
                    <Link href="/admin">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-white/20 bg-white/10 text-white hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <p className="text-sm font-semibold tracking-wide text-cyan-100 uppercase">
                            Administrasi Sistem
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                            Tambah Admin Baru
                        </h1>
                        <p className="text-sm font-medium text-blue-100">
                            Buat akun petugas untuk sistem internal Doclang
                            Boba.
                        </p>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-2xl">
                    <Card className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
                        <CardHeader className="border-b border-white/15 bg-white/10 px-6 py-5 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Informasi Admin
                            </CardTitle>
                            <CardDescription className="text-blue-100">
                                Isi data lengkap admin yang akan ditambahkan ke
                                sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Contoh: John Doe"
                                        value={data.name}
                                        className="border-white/20 bg-white/10 text-white placeholder:text-blue-100"
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={data.email}
                                        className="border-white/20 bg-white/10 text-white placeholder:text-blue-100"
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Role / Hak Akses</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label
                                            htmlFor="role-admin"
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                                                data.role === 'admin'
                                                    ? 'border-white/30 bg-white/15'
                                                    : 'border-white/20 bg-white/10 hover:bg-white/15'
                                            }`}
                                        >
                                            <input
                                                id="role-admin"
                                                type="radio"
                                                name="role"
                                                value="admin"
                                                checked={data.role === 'admin'}
                                                onChange={() =>
                                                    setData('role', 'admin')
                                                }
                                                className="accent-primary"
                                            />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Admin
                                                </p>
                                                <p className="text-xs text-blue-100">
                                                    Akses standar
                                                </p>
                                            </div>
                                        </label>
                                        <label
                                            htmlFor="role-super"
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                                                data.role === 'super_admin'
                                                    ? 'border-white/30 bg-white/15'
                                                    : 'border-white/20 bg-white/10 hover:bg-white/15'
                                            }`}
                                        >
                                            <input
                                                id="role-super"
                                                type="radio"
                                                name="role"
                                                value="super_admin"
                                                checked={
                                                    data.role === 'super_admin'
                                                }
                                                onChange={() =>
                                                    setData(
                                                        'role',
                                                        'super_admin',
                                                    )
                                                }
                                                className="accent-purple-600"
                                            />
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <p className="text-sm font-medium">
                                                        Super Admin
                                                    </p>
                                                    <Shield className="h-3 w-3 text-cyan-100" />
                                                </div>
                                                <p className="text-xs text-blue-100">
                                                    Akses penuh
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                    {errors.role && (
                                        <p className="text-xs text-destructive">
                                            {errors.role}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Minimal 8 karakter"
                                            value={data.password}
                                            className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-blue-100"
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-blue-100 hover:text-white"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={
                                                showConfirm
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Ulangi password"
                                            value={data.password_confirmation}
                                            className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-blue-100"
                                            onChange={(e) =>
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirm(!showConfirm)
                                            }
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-blue-100 hover:text-white"
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-xs text-destructive">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <Link href="/admin">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-white/20 bg-white/10 text-blue-50 hover:bg-white/20 hover:text-white"
                                        >
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="gap-2 border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-lg hover:bg-white/25"
                                    >
                                        {processing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="h-4 w-4" />
                                        )}
                                        Simpan Admin
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
