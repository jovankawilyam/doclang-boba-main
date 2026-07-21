import { Head } from '@inertiajs/react';
import { WhatsappGatewayPanel } from '@/components/whatsapp/whatsapp-gateway-panel';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'WhatsApp Gateway',
        href: '/admin/whatsapp',
    },
];

interface Props {
    whatsappStats: {
        pending: number;
        failed: number;
    };
}

export default function WhatsAppGateway({ whatsappStats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="WhatsApp Gateway" />

            <main className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 text-slate-950 md:p-6">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
                    <header>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                            WhatsApp Gateway
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola koneksi WhatsApp untuk mengirim notifikasi
                            dokumen ke pemohon.
                        </p>
                    </header>

                    <WhatsappGatewayPanel stats={whatsappStats} />
                </div>
            </main>
        </AppLayout>
    );
}
