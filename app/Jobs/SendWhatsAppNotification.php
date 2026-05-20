<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendWhatsAppNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        private readonly string $targetNumber,
        private readonly string $message,
    ) {}

    public function handle(): void
    {
        $endpoint = config('services.whatsapp.gateway_url');
        $senderNumber = config('services.whatsapp.sender_number');

        if (! is_string($endpoint) || trim($endpoint) === '') {
            Log::warning('WhatsApp notification skipped: WA_GATEWAY_URL is not configured.', [
                'sender_number' => $senderNumber,
                'target_number' => $this->targetNumber,
            ]);

            return;
        }

        $payload = [
            'phone' => $this->normalizeTargetNumber($this->targetNumber),
            'message' => $this->message,
        ];

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
                ->timeout(15)
                ->post($endpoint, $payload);
        } catch (Throwable $exception) {
            Log::error('WhatsApp Gateway request error.', [
                'sender_number' => $senderNumber,
                'target_number' => $this->targetNumber,
                'endpoint' => $endpoint,
                'payload' => $payload,
                'error' => $exception->getMessage(),
            ]);

            return;
        }

        if ($response->failed()) {
            Log::error('WhatsApp Gateway notification failed.', [
                'sender_number' => $senderNumber,
                'target_number' => $this->targetNumber,
                'endpoint' => $endpoint,
                'payload' => $payload,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return;
        }
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
