import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full font-semibold shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner className="mr-2 h-4 w-4" />}
                                Confirm password
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
