<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Document extends Model
{
    /** @use HasFactory<\Database\Factories\DocumentFactory> */
    use HasFactory, Prunable;

    protected $fillable = [
        'nomor_pengajuan',
        'status_proses',
        'catatan',
        'category',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the prunable model query.
     */
    public function prunable()
    {
        return static::where('deleted_at', '<=', now()->subDays(60));
    }
}
