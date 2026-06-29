<?php

return [
    /*
     * WhatsApp Gateway Configuration
     * Dynamically set based on APP_ENV and NGROK URLs
     */

    'gateway_url' => env('WA_GATEWAY_URL', 'http://127.0.0.1:3001/api/send-message'),
    'gateway_status_url' => env('WA_GATEWAY_STATUS_URL', 'http://127.0.0.1:3001/api/admin/status'),
    'gateway_qr_url' => env('WA_GATEWAY_QR_URL', 'http://127.0.0.1:3001/api/admin/qr'),
    'gateway_pairing_code_url' => env('WA_GATEWAY_PAIRING_CODE_URL', 'http://127.0.0.1:3001/api/admin/pairing-code'),
    'gateway_reconnect_url' => env('WA_GATEWAY_RECONNECT_URL', 'http://127.0.0.1:3001/api/admin/reconnect'),
    'gateway_token' => env('WA_GATEWAY_TOKEN', ''),
    'sender_number' => env('WA_SENDER_NUMBER', ''),

    /*
     * Vite Configuration
     */
    'vite_url' => env('NGROK_VITE_URL', 'http://localhost:5173'),

    /*
     * Ngrok URLs (for reference)
     */
    'ngrok' => [
        'laravel' => env('NGROK_LARAVEL_URL', 'http://localhost:8000'),
        'vite' => env('NGROK_VITE_URL', 'http://localhost:5173'),
        'whatsapp' => env('NGROK_WHATSAPP_URL', 'http://localhost:3001'),
    ],
];
