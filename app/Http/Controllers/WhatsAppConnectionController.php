<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\JsonResponse;
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

    private function proxy(string $url): JsonResponse
    {
        try {
            $response = $this->gatewayRequest()->get($url);

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
