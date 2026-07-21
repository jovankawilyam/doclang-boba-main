import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Loader2,
    Save,
    Shield,
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

interface Admin {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'super_admin';
}

interface Props {
    admin: Admin;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Manajemen Admin', href: '/admin' },
    { title: 'Edit Admin', href: '#' },
];

export default function AdminEdit({ admin }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: admin.name,
        email: admin.email,
        password: '',
        password_confirmation: '',
        role: admin.role,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/${admin.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Admin" />

            <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 text-slate-950 md:p-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border-slate-300 text-slate-700"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    Administrasi Sistem
                                </p>
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                                    Edit Admin
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                    Ubah data akun petugas sistem internal
                                    Doclang Boba.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto w-full max-w-2xl">
                        <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                    <Save className="h-5 w-5 text-slate-600" />
                                    Informasi Admin
                                </CardTitle>
                                <CardDescription className="text-slate-500">
                    Ubah data admin. Biarkan password kosong jika tidak ingin mengganti.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Nama Lengkap
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="Contoh: John Doe"
                                            value={data.name}
                                            className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400"
                                            onChange={(e) =>
                                                setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            autoFocus
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-rose-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="email"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Alamat Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@example.com"
                                            value={data.email}
                                            className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400"
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-rose-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">
                                            Role / Hak Akses
                                        </Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label
                                                htmlFor="role-admin"
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                                                    data.role === 'admin'
                                                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <input
                                                    id="role-admin"
                                                    type="radio"
                                                    name="role"
                                                    value="admin"
                                                    checked={
                                                        data.role === 'admin'
                                                    }
                                                    onChange={() =>
                                                        setData('role', 'admin')
                                                    }
                                                    className="h-4 w-4 accent-slate-900"
                                                />
                                                <div>
                                                    <p
                                                        className={`text-sm font-medium ${
                                                            data.role ===
                                                            'admin'
                                                                ? 'text-slate-900'
                                                                : 'text-slate-700'
                                                        }`}
                                                    >
                                                        Admin
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Akses standar
                                                    </p>
                                                </div>
                                            </label>
                                            <label
                                                htmlFor="role-super"
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                                                    data.role === 'super_admin'
                                                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <input
                                                    id="role-super"
                                                    type="radio"
                                                    name="role"
                                                    value="super_admin"
                                                    checked={
                                                        data.role ===
                                                        'super_admin'
                                                    }
                                                    onChange={() =>
                                                        setData(
                                                            'role',
                                                            'super_admin',
                                                        )
                                                    }
                                                    className="h-4 w-4 accent-slate-900"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p
                                                            className={`text-sm font-medium ${
                                                                data.role ===
                                                                'super_admin'
                                                                    ? 'text-slate-900'
                                                                    : 'text-slate-700'
                                                            }`}
                                                        >
                                                            Super Admin
                                                        </p>
                                                        <Shield className="h-3 w-3 text-slate-500" />
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Akses penuh
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                        {errors.role && (
                                            <p className="text-xs text-rose-600">
                                                {errors.role}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Password Baru{' '}
                                            <span className="text-slate-400 font-normal">
                                                (kosongkan jika tidak diganti)
                                            </span>
                                        </Label>
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
                                                className="border-slate-300 bg-white pr-10 text-slate-950 placeholder:text-slate-400"
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
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-rose-600">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-sm font-medium text-slate-700"
                                        >
                                            Konfirmasi Password Baru
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={
                                                    showConfirm
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Ulangi password baru"
                                                value={
                                                    data.password_confirmation
                                                }
                                                className="border-slate-300 bg-white pr-10 text-slate-950 placeholder:text-slate-400"
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
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirm ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-xs text-rose-600">
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Link href="/admin">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-slate-300 text-slate-700"
                                            >
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="gap-2 bg-slate-950 text-white hover:bg-slate-800"
                                        >
                                            {processing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Simpan Perubahan
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
