<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\JenisLayanan;
use App\Enums\PermohonanStatus;
use App\Jobs\SendWhatsAppNotification;
use App\Models\DoclangProses;
use App\Models\WhatsAppNotification;
use Illuminate\Support\Facades\Bus;
use Throwable;

class WhatsAppNotificationService
{
    public function submissionMessage(DoclangProses $permohonan): string
    {
        return "Permohonan Doclang Boba berhasil diterima.\n\nToken Permohonan: {$permohonan->id_pengajuan}\nLayanan: ".$this->serviceLabel($permohonan)."\nStatus: ".PermohonanStatus::Proses->value."\n\nSimpan token ini untuk pengecekan layanan KPKNL Bogor.";
    }

    public function invalidMessage(DoclangProses $permohonan): string
    {
        return "Permohonan Doclang Boba *TIDAK VALID*.\n\nNomor Tiket: {$permohonan->id_pengajuan}\nLayanan: ".$this->serviceLabel($permohonan)."\nAlasan: {$permohonan->catatan_tidak_valid}\n\nSilakan perbaiki berkas sesuai catatan tersebut.";
    }

    /**
     * @return list<int>
     */
    public function createNotifications(
        DoclangProses $permohonan,
        string $type,
        string $message,
        ?int $requestedBy = null,
    ): array {
        $notificationIds = [];

        foreach ($this->targets($permohonan) as $targetNumber) {
            $notification = $permohonan->whatsappNotifications()->create([
                'type' => $type,
                'target_number' => $targetNumber,
                'message' => $message,
                'status' => 'pending',
                'requested_by' => $requestedBy,
            ]);

            $notificationIds[] = $notification->id;
        }

        return $notificationIds;
    }

    /**
     * @param  list<int>  $notificationIds
     */
    public function dispatchNotifications(array $notificationIds): bool
    {
        $failedImmediately = false;

        foreach ($notificationIds as $notificationId) {
            if ($this->dispatchNotification($notificationId)) {
                $failedImmediately = true;
            }
        }

        return $failedImmediately;
    }

    public function retry(WhatsAppNotification $notification, ?int $requestedBy = null): bool
    {
        $notification->forceFill([
            'status' => 'pending',
            'retry_count' => $notification->retry_count + 1,
            'error_message' => null,
            'failed_at' => null,
            'requested_by' => $requestedBy,
        ])->save();

        return $this->dispatchNotification($notification->id);
    }

    private function dispatchNotification(int $notificationId): bool
    {
        $job = new SendWhatsAppNotification($notificationId);

        if (config('queue.default') !== 'sync') {
            $job->afterCommit();
        }

        try {
            Bus::dispatch($job);

            return false;
        } catch (Throwable $exception) {
            $job->failed($exception);

            return true;
        }
    }

    /**
     * @return list<string>
     */
    private function targets(DoclangProses $permohonan): array
    {
        return collect([
            $permohonan->nomor_wa_pemohon,
            $permohonan->nomor_wa_pemberi_kuasa,
        ])
            ->filter(fn ($number): bool => is_string($number) && trim($number) !== '')
            ->map(fn (string $number): string => trim($number))
            ->unique(fn (string $number): string => preg_replace('/\D+/', '', $number) ?? $number)
            ->values()
            ->all();
    }

    private function serviceLabel(DoclangProses $permohonan): string
    {
        return $permohonan->jenis_layanan instanceof JenisLayanan
            ? $permohonan->jenis_layanan->label()
            : (string) $permohonan->jenis_layanan;
    }
}
