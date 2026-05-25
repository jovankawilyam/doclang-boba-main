<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppNotification extends Model
{
    protected $table = 'whatsapp_notifications';

    protected $fillable = [
        'type',
        'target_number',
        'message',
        'status',
        'retry_count',
        'error_message',
        'gateway_message_id',
        'attempted_at',
        'sent_at',
        'failed_at',
        'requested_by',
    ];

    protected function casts(): array
    {
        return [
            'attempted_at' => 'datetime',
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function permohonan(): BelongsTo
    {
        return $this->belongsTo(DoclangProses::class, 'doclang_proses_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
