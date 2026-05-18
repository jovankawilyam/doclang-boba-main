<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        $token = config('services.fonnte.token');
        $endpoint = config('services.fonnte.endpoint');
        $senderNumber = config('services.whatsapp.sender_number');

        if (! is_string($token) || $token === '') {
            Log::warning('WhatsApp notification skipped: FONNTE_TOKEN is not configured.', [
                'sender_number' => $senderNumber,
                'target_number' => $this->targetNumber,
            ]);

            return;
        }

        $response = Http::asForm()
            ->withHeaders(['Authorization' => $token])
            ->timeout(15)
            ->post($endpoint, [
                'target' => $this->normalizeTargetNumber($this->targetNumber),
                'message' => $this->message,
                'countryCode' => '62',
            ]);

        if ($response->failed()) {
            Log::error('WhatsApp notification failed.', [
                'sender_number' => $senderNumber,
                'target_number' => $this->targetNumber,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $response->throw();
        }
    }

    private function normalizeTargetNumber(string $number): string
    {
        $number = preg_replace('/\D+/', '', $number) ?? '';

        if (str_starts_with($number, '0')) {
            return '62'.substr($number, 1);
        }

        return $number;
    }
}
