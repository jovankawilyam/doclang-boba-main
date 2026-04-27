import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="block w-full bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                className="block w-full transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
                                autoFocus
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Confirm password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="block w-full transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
                                placeholder="••••••••"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full font-semibold shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                            Reset password
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
