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
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Card className="shadow-lg rounded-2xl border-slate-200/60 dark:border-slate-800">
                <CardContent className="p-6 md:p-8">
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-medium text-slate-700 dark:text-slate-300">
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
                                            className="transition-all duration-200 border-slate-300 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-700"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="font-medium text-slate-700 dark:text-slate-300">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="transition-all duration-200 border-slate-300 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-700"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-3 pt-1">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary"
                                        />
                                        <Label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer dark:text-slate-400">
                                            Remember me
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full font-semibold shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner className="mr-2 h-4 w-4" />}
                                        Log in
                                    </Button>
                                </div>

                                {canRegister && (
                                    <div className="mt-6 text-center text-sm font-medium text-muted-foreground">
                                        Don't have an account?{' '}
                                        <TextLink href={register()} tabIndex={5} className="font-semibold text-primary hover:underline transition-colors">
                                            Sign up
                                        </TextLink>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
