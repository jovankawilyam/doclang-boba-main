import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                    className="transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                                <InputError
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
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
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    className="transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full font-semibold shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2 h-4 w-4" />}
                                Create account
                            </Button>
                        </div>

                        <div className="mt-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6} className="font-semibold text-primary hover:underline">
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
