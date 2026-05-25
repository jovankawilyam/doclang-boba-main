<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Throwable;

class WhatsAppConnectionController extends Controller
{
    public function status(): JsonResponse
    {
        return $this->proxy((string) config('services.whatsapp.gateway_status_url'));
    }

    public function qr(): JsonResponse
    {
        return $this->proxy((string) config('services.whatsapp.gateway_qr_url'));
    }

    public function reconnect(): JsonResponse
    {
        return $this->proxy((string) config('services.whatsapp.gateway_reconnect_url'), 'post');
    }

    public function pairingCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:32'],
        ]);

        return $this->proxy(
            (string) config('services.whatsapp.gateway_pairing_code_url'),
            'post',
            $validated
        );
    }

    public function currentPairingCode(): JsonResponse
    {
        return $this->proxy((string) config('services.whatsapp.gateway_pairing_code_url'));
    }

    private function proxy(string $url, string $method = 'get', array $payload = []): JsonResponse
    {
        try {
            $response = $this->gatewayRequest()->{$method}($url, $payload);

            return response()->json(
                $response->json() ?? ['message' => $response->body()],
                $response->status()
            );
        } catch (Throwable $exception) {
            return response()->json([
                'online' => false,
                'message' => 'Gateway WhatsApp tidak dapat dihubungi.',
                'error' => $exception->getMessage(),
            ], 503);
        }
    }

    private function gatewayRequest(): PendingRequest
    {
        $request = Http::acceptJson()->timeout(3);
        $token = config('services.whatsapp.gateway_token');

        return is_string($token) && trim($token) !== ''
            ? $request->withToken($token)
            : $request;
    }
}
