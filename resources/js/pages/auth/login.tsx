import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    // State untuk mengontrol sembunyi/tampil password
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Card className="rounded-2xl border-slate-200/60 shadow-lg dark:border-slate-800">
                <CardContent className="p-6 md:p-8">
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-5">
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="email"
                                            className="font-medium text-slate-700 dark:text-slate-300"
                                        >
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            className="border-slate-300 transition-all duration-200 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-700"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field dengan Fitur Show/Hide */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="password"
                                                className="font-medium text-slate-700 dark:text-slate-300"
                                            >
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        
                                        {/* Wrapper Input & Tombol */}
                                        <div className="relative flex items-center">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"} // Dinamis berdasarkan state
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                // pr-10 diberikan agar text password panjang tidak tertumpuk di bawah icon mata
                                                className="pr-10 border-slate-300 transition-all duration-200 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-700"
                                            />
                                            
                                            <button
                                                type="button" // Menghindari tombol mentrigger submit form saat diklik
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                                tabIndex={-1} // Agar tombol ini dilewati saat menekan tombol 'Tab' di keyboard
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me Checkbox */}
                                    <div className="flex items-center space-x-3 pt-1">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="border-slate-300 data-[state=checked]:bg-primary dark:border-slate-600"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400"
                                        >
                                            Remember me
                                        </Label>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full font-semibold shadow-sm transition-all duration-300 ease-in-out hover:opacity-90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        )}
                                        Log in
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            {status && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}