import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10 dark:bg-slate-950">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform hover:scale-105">
                                <AppLogoIcon className="size-8 fill-current" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {title}
                            </h1>
                            <p className="text-sm font-medium text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
