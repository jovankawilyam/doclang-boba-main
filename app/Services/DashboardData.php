<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\JenisLayanan;
use App\Models\DoclangProses;
use App\Models\User;
use App\Models\WhatsAppNotification;

class DashboardData
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $documentStats = \App\Http\Controllers\DocumentController::getStatistics();

        return [
            'admins' => $this->admins(),
            'stats' => $this->adminStats(),
            'statistics' => $documentStats,
            'docStats' => $documentStats[JenisLayanan::Kuitansi->value],
            'docStatsKutipan' => $documentStats['kutipan_rl'],
            'docStatsValidasi' => $documentStats[JenisLayanan::ValidasiPph->value],
            'todayDocumentTotal' => DoclangProses::whereDate('created_at', today())->count(),
            'recentDocuments' => $this->recentDocuments(),
            'whatsappStats' => $this->whatsappStats(),
        ];
    }

    private function admins(): mixed
    {
        return User::whereIn('role', ['super_admin', 'admin'])
            ->orderByRaw("CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'is_active']);
    }

    /**
     * @return array<string, int>
     */
    private function adminStats(): array
    {
        return [
            'super_admin' => User::where('role', 'super_admin')->count(),
            'admin' => User::where('role', 'admin')->count(),
            'total' => User::whereIn('role', ['super_admin', 'admin'])->count(),
        ];
    }

    private function recentDocuments(): mixed
    {
        return DoclangProses::query()
            ->orderByDesc('created_at')
            ->limit(6)
            ->get([
                'id',
                'id_pengajuan',
                'kode_lot_lelang',
                'nama_pemohon',
                'jenis_layanan',
                'status_proses',
                'created_at',
                'tanggal_masuk_pengambilan_dokumen',
            ]);
    }

    /**
     * @return array<string, int>
     */
    private function whatsappStats(): array
    {
        return [
            'pending' => WhatsAppNotification::query()->where('status', 'pending')->count(),
            'failed' => WhatsAppNotification::query()->where('status', 'failed')->count(),
        ];
    }
}
