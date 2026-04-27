import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    title?: string;
    description?: string;
};

export default function AuthLayout({ children, title, description }: Props) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 md:p-0">
            <div className="flex w-full max-w-[1200px] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 md:flex-row flex-col">
                
                {/* KOLOM KIRI - GAMBAR (Desktop Only) */}
                <div className="relative hidden w-1/2 bg-slate-100 md:block dark:bg-slate-800">
                    <img
                        src="/images/profile-3.png"
                        alt="Background"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/5" />
                </div>

                {/* KOLOM KANAN - FORM */}
                <div className="flex w-full flex-col justify-center p-8 sm:p-12 md:w-1/2 lg:p-16">
                    <div className="mb-8 flex justify-center md:justify-start">
                        <img 
                            src="/images/NAGARA-DANA-RAKCA.png" 
                            alt="Logo" 
                            className="h-16 w-auto object-contain"
                        />
                    </div>

                    <div className="mb-8 text-center md:text-left">
                        {title && (
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="mx-auto w-full max-w-md md:mx-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
