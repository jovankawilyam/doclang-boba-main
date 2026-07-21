import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const formatDateTime = (value?: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          }).format(new Date(value))
        : '-';

export function WhatsappGatewayPanel({
    stats,
}: {
    stats: { pending: number; failed: number };
}) {
    const [status, setStatus] = useState<{
        loading: boolean;
        ready: boolean;
        hasQr: boolean;
        reconnecting: boolean;
        wid: string | null;
        lastReadyAt: string | null;
        message?: string;
    }>({
        loading: true,
        ready: false,
        hasQr: false,
        reconnecting: false,
        wid: null,
        lastReadyAt: null,
    });
    const [qr, setQr] = useState<string | null>(null);
    const [qrError, setQrError] = useState<string | null>(null);
    const [changingNumber, setChangingNumber] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [linkMethod, setLinkMethod] = useState<'qr' | 'code'>('qr');
    const [pairingPhone, setPairingPhone] = useState('');
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [pairingPhoneNumber, setPairingPhoneNumber] = useState<string | null>(
        null,
    );
    const [pairingGeneratedAt, setPairingGeneratedAt] = useState<string | null>(
        null,
    );
    const [pairingError, setPairingError] = useState<string | null>(null);
    const [requestingPairingCode, setRequestingPairingCode] = useState(false);

    useEffect(() => {
        let active = true;

        const loadStatus = async () => {
            try {
                const response = await fetch('/admin/whatsapp/status', {
                    headers: { Accept: 'application/json' },
                });
                const payload = await response.json();
                const whatsapp = payload.whatsapp;

                if (!active) return;

                setStatus({
                    loading: false,
                    ready: response.ok && Boolean(whatsapp?.ready),
                    hasQr: Boolean(whatsapp?.hasQr),
                    reconnecting: Boolean(whatsapp?.isReconnecting),
                    wid: whatsapp?.wid ?? null,
                    lastReadyAt: whatsapp?.lastReadyAt ?? null,
                    message: payload.message ?? payload.error,
                });

                if (whatsapp?.ready) {
                    setPairingCode(null);
                    setPairingPhoneNumber(null);
                    setPairingGeneratedAt(null);
                    setPairingError(null);
                }

                if (whatsapp?.hasQr && !whatsapp?.ready) {
                    const qrResponse = await fetch('/admin/whatsapp/qr', {
                        headers: { Accept: 'application/json' },
                    });
                    const qrPayload = await qrResponse.json();

                    if (!active) return;

                    if (qrResponse.ok && qrPayload.qrDataUrl) {
                        setQr(qrPayload.qrDataUrl);
                        setQrError(null);
                    } else {
                        setQr(null);
                        setQrError(
                            qrPayload.error ??
                                'QR WhatsApp gagal dimuat dari gateway.',
                        );
                    }
                } else {
                    setQr(null);
                    setQrError(null);
                }
            } catch {
                if (active) {
                    setQr(null);
                    setQrError(null);
                    setStatus((current) => ({
                        ...current,
                        loading: false,
                        ready: false,
                        reconnecting: false,
                        message: 'Gateway WhatsApp tidak dapat dihubungi.',
                    }));
                }
            }
        };

        void loadStatus();
        const interval = window.setInterval(loadStatus, 10000);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!pairingCode || status.ready) return;

        let active = true;

        const loadCurrentPairingCode = async () => {
            try {
                const response = await fetch('/admin/whatsapp/pairing-code', {
                    headers: { Accept: 'application/json' },
                });
                const payload = await response.json();

                if (!active || !response.ok || !payload.pairingCode) return;

                setPairingCode(payload.pairingCode);
                setPairingPhoneNumber(payload.phoneNumber ?? null);
                setPairingGeneratedAt(payload.generatedAt ?? null);
            } catch {
                // Kode yang sudah tampil tetap dapat digunakan sampai gateway memperbaruinya.
            }
        };

        const interval = window.setInterval(loadCurrentPairingCode, 10000);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [pairingCode, status.ready]);

    const handleChangeNumber = () => {
        const isConnected = status.ready;

        Swal.fire({
            title: isConnected ? 'Putuskan WhatsApp?' : 'Minta QR WhatsApp?',
            text: isConnected
                ? 'Putuskan nomor WhatsApp yang terhubung sekarang dan pilih cara menautkan nomor baru?'
                : 'Mulai ulang koneksi WhatsApp agar QR atau kode tautan baru bisa dibuat?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#dc2626',
            confirmButtonText: isConnected ? 'Ya, Putuskan' : 'Ya, Minta QR',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            setChangingNumber(true);
            setActionError(null);

            try {
                const csrfToken = document
                    .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                    ?.getAttribute('content');
                const response = await fetch('/admin/whatsapp/reconnect', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                });
                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(
                        payload.error || 'Gagal memulai penautan WhatsApp.',
                    );
                }

                setQr(null);
                setQrError(null);
                setLinkMethod('qr');
                setPairingPhone('');
                setPairingCode(null);
                setPairingPhoneNumber(null);
                setPairingGeneratedAt(null);
                setPairingError(null);
                setStatus((current) => ({
                    ...current,
                    ready: false,
                    hasQr: false,
                    reconnecting: true,
                    wid: null,
                    message: payload.message,
                }));
            } catch (error) {
                setActionError(
                    error instanceof Error
                        ? error.message
                        : 'Gagal memulai penautan WhatsApp.',
                );
            } finally {
                setChangingNumber(false);
            }
        });
    };

    const handlePairingCodeRequest = async (event: FormEvent) => {
        event.preventDefault();
        setRequestingPairingCode(true);
        setPairingError(null);
        setPairingCode(null);
        setPairingPhoneNumber(null);
        setPairingGeneratedAt(null);

        try {
            const csrfToken = document
                .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.getAttribute('content');
            const response = await fetch('/admin/whatsapp/pairing-code', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ phone: pairingPhone }),
            });
            const payload = await response.json();

            if (!response.ok || !payload.pairingCode) {
                throw new Error(
                    payload.error || 'Gagal membuat kode tautan WhatsApp.',
                );
            }

            setPairingCode(payload.pairingCode);
            setPairingPhoneNumber(payload.phoneNumber ?? null);
            setPairingGeneratedAt(payload.generatedAt ?? null);
        } catch (error) {
            setPairingError(
                error instanceof Error
                    ? error.message
                    : 'Gagal membuat kode tautan WhatsApp.',
            );
        } finally {
            setRequestingPairingCode(false);
        }
    };

    return (
        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-3">
                    <div
                        className={`rounded-md border p-2 ${status.ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
                    >
                        {status.ready ? (
                            <Wifi className="h-5 w-5" />
                        ) : (
                            <WifiOff className="h-5 w-5" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-950">
                            Koneksi WhatsApp
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                            {status.loading
                                ? 'Memeriksa koneksi...'
                                : status.ready
                                  ? `Terhubung${status.wid ? ` (${status.wid.replace('@c.us', '')})` : ''}`
                                  : status.reconnecting
                                    ? status.message ||
                                      'Menyiapkan pilihan penautan WhatsApp...'
                                    : status.hasQr
                                      ? qrError ||
                                        'Pilih QR Code atau kode telepon untuk menautkan WhatsApp.'
                                      : status.message ||
                                        'Gateway aktif, menunggu QR WhatsApp dibuat.'}
                        </p>
                        {status.lastReadyAt && (
                            <p className="mt-1 text-xs text-slate-500">
                                Terhubung terakhir:{' '}
                                {formatDateTime(status.lastReadyAt)}
                            </p>
                        )}
                        <div className="mt-3 flex gap-2 text-xs font-semibold">
                            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
                                Menunggu: {stats.pending}
                            </span>
                            <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-800">
                                Gagal: {stats.failed}
                            </span>
                        </div>
                        {actionError && (
                            <p className="mt-3 text-sm font-medium text-rose-700">
                                {actionError}
                            </p>
                        )}
                        {status.ready && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={changingNumber}
                                onClick={handleChangeNumber}
                                className="mt-4 border-black bg-black text-white hover:bg-white hover:text-black"
                            >
                                {changingNumber
                                    ? status.ready
                                        ? 'Memutus koneksi...'
                                        : 'Menyiapkan QR...'
                                    : 'Ganti Nomor WhatsApp'}
                            </Button>
                        )}
                        {!status.ready &&
                            !status.hasQr &&
                            !status.loading &&
                            !status.reconnecting && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={changingNumber}
                                    onClick={handleChangeNumber}
                                    className="mt-4 border-black bg-black text-white hover:bg-white hover:text-black"
                                >
                                    {changingNumber
                                        ? 'Menyiapkan QR...'
                                        : 'Minta QR WhatsApp'}
                                </Button>
                            )}
                    </div>
                </div>
                {!status.ready && status.hasQr && (
                    <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-3">
                        <div className="mb-3 grid grid-cols-2 rounded-md bg-slate-100 p-1 text-sm font-medium">
                            <button
                                type="button"
                                onClick={() => setLinkMethod('qr')}
                                className={`rounded px-3 py-2 ${linkMethod === 'qr' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
                            >
                                QR Code
                            </button>
                            <button
                                type="button"
                                onClick={() => setLinkMethod('code')}
                                className={`rounded px-3 py-2 ${linkMethod === 'code' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-900'}`}
                            >
                                Kode Telepon
                            </button>
                        </div>
                        {linkMethod === 'qr' ? (
                            <div className="flex flex-col items-center">
                                {qr ? (
                                    <img
                                        src={qr}
                                        alt="QR koneksi WhatsApp"
                                        className="h-48 w-48"
                                    />
                                ) : (
                                    <p className="p-5 text-sm text-rose-700">
                                        {qrError || 'QR belum tersedia.'}
                                    </p>
                                )}
                                <p className="mt-2 max-w-52 text-center text-xs text-slate-500">
                                    Scan dari WhatsApp melalui menu Perangkat
                                    Tertaut.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handlePairingCodeRequest}
                                className="space-y-3"
                            >
                                <p className="text-sm text-slate-600">
                                    Masukkan nomor akun WhatsApp yang sedang
                                    terbuka di HP utama.
                                </p>
                                <Input
                                    type="tel"
                                    inputMode="tel"
                                    value={pairingPhone}
                                    onChange={(event) =>
                                        setPairingPhone(event.target.value)
                                    }
                                    placeholder="Contoh: 081234567890"
                                    required
                                    className="text-black placeholder:text-slate-400"
                                />
                                <Button
                                    type="submit"
                                    disabled={requestingPairingCode}
                                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    {requestingPairingCode
                                        ? 'Meminta kode...'
                                        : 'Dapatkan Kode'}
                                </Button>
                                {pairingError && (
                                    <p className="text-sm text-rose-700">
                                        {pairingError}
                                    </p>
                                )}
                                {pairingCode && (
                                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center">
                                        <p className="text-xs text-slate-600">
                                            Masukkan kode ini di WhatsApp
                                            {pairingPhoneNumber
                                                ? ` (+${pairingPhoneNumber})`
                                                : ''}
                                        </p>
                                        <p className="my-2 font-mono text-2xl font-bold tracking-widest text-slate-950">
                                            {pairingCode}
                                        </p>
                                        {pairingGeneratedAt && (
                                            <p className="mb-2 text-xs text-slate-500">
                                                Kode terbaru:{' '}
                                                {formatDateTime(
                                                    pairingGeneratedAt,
                                                )}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-600">
                                            Di HP utama: Perangkat Tertaut &gt;
                                            Tautkan perangkat &gt; Tautkan
                                            dengan nomor telepon. Ketik 8
                                            karakter di atas tanpa spasi.
                                        </p>
                                        <p className="mt-2 text-xs font-medium text-amber-800">
                                            Jika kode berubah, gunakan kode
                                            terbaru yang tampil di sini.
                                        </p>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
