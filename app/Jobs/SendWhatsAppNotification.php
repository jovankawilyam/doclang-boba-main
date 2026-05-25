<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\WhatsAppNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class SendWhatsAppNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(private readonly int $notificationId) {}

    public function handle(): void
    {
        $notification = WhatsAppNotification::query()->findOrFail($this->notificationId);
        $endpoint = config('services.whatsapp.gateway_url');

        $notification->forceFill([
            'status' => 'pending',
            'attempted_at' => now(),
            'error_message' => null,
            'failed_at' => null,
        ])->save();

        try {
            if (! is_string($endpoint) || trim($endpoint) === '') {
                throw new RuntimeException('WA_GATEWAY_URL belum dikonfigurasi.');
            }

            $request = Http::acceptJson()->asJson()->timeout(15);
            $gatewayToken = config('services.whatsapp.gateway_token');

            if (is_string($gatewayToken) && trim($gatewayToken) !== '') {
                $request = $request->withToken($gatewayToken);
            }

            $response = $request->post($endpoint, [
                'phone' => $this->normalizeTargetNumber($notification->target_number),
                'message' => $notification->message,
            ]);

            if ($response->failed()) {
                $reason = $response->json('error') ?? $response->body();
                throw new RuntimeException('Gateway menolak pengiriman: '.(string) $reason);
            }

            $notification->forceFill([
                'status' => 'sent',
                'gateway_message_id' => $response->json('data.messageId'),
                'sent_at' => now(),
                'error_message' => null,
                'failed_at' => null,
            ])->save();

            if ($notification->type === 'invalid') {
                $notification->permohonan()->update([
                    'invalid_whatsapp_sent_at' => now(),
                ]);
            }
        } catch (Throwable $exception) {
            $notification->forceFill([
                'error_message' => $exception->getMessage(),
            ])->save();

            Log::error('WhatsApp Gateway notification attempt failed.', [
                'notification_id' => $notification->id,
                'target_number' => $notification->target_number,
                'endpoint' => $endpoint,
                'error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }

    public function failed(?Throwable $exception): void
    {
        $notification = WhatsAppNotification::query()->find($this->notificationId);

        if (! $notification) {
            return;
        }

        $notification->forceFill([
            'status' => 'failed',
            'failed_at' => now(),
            'error_message' => $exception?->getMessage() ?? $notification->error_message,
        ])->save();
    }

    private function normalizeTargetNumber(string $number): string
    {
        $number = preg_replace('/\D+/', '', $number) ?? '';

        if (str_starts_with($number, '08')) {
            $number = '62'.substr($number, 1);
        }

        if (str_starts_with($number, '8')) {
            $number = '62'.$number;
        }

        return $number;
    }
}
