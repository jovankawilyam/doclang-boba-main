<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'whatsapp' => [
        'sender_number' => env('WA_SENDER_NUMBER', '081911883609'),
        'gateway_url' => env('WA_GATEWAY_URL', 'http://127.0.0.1:3001/api/send-message'),
        'gateway_status_url' => env('WA_GATEWAY_STATUS_URL', 'http://127.0.0.1:3001/api/admin/status'),
        'gateway_qr_url' => env('WA_GATEWAY_QR_URL', 'http://127.0.0.1:3001/api/admin/qr'),
        'gateway_pairing_code_url' => env('WA_GATEWAY_PAIRING_CODE_URL', 'http://127.0.0.1:3001/api/admin/pairing-code'),
        'gateway_reconnect_url' => env('WA_GATEWAY_RECONNECT_URL', 'http://127.0.0.1:3001/api/admin/reconnect'),
        'gateway_token' => env('WA_GATEWAY_TOKEN'),
    ],

    'fonnte' => [
        'token' => env('FONNTE_TOKEN'),
        'endpoint' => env('FONNTE_ENDPOINT', 'https://api.fonnte.com/send'),
    ],

];
