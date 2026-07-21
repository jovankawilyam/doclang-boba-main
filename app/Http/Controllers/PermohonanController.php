<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreatePermohonanAction;
use App\Enums\PermohonanStatus;
use App\Http\Requests\StorePermohonanRequest;
use App\Models\DoclangProses;
use App\Models\WhatsAppNotification;
use App\Services\WhatsAppNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PermohonanController extends Controller
{
    public function store(
        StorePermohonanRequest $request,
        CreatePermohonanAction $createPermohonan,
    ): RedirectResponse|JsonResponse {
        $permohonan = $createPermohonan->execute($request);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Permohonan berhasil dikirim.',
                'id_pengajuan' => $permohonan->id_pengajuan,
                'token' => $permohonan->id_pengajuan,
            ]);
        }

        return redirect()
            ->back()
            ->with('success', "Permohonan berhasil dikirim. Token permohonan: {$permohonan->id_pengajuan}");
    }

    public function update(Request $request, DoclangProses $permohonan): RedirectResponse
    {
        $validated = $request->validate([
            'nomor_dokumen' => ['nullable', 'string', 'max:255'],
            'tanggal_dokumen' => ['nullable', 'date'],
            'tanggal_masuk_pengambilan_dokumen' => ['nullable', 'date'],
            'status_proses' => ['required', Rule::enum(PermohonanStatus::class)],
            'catatan_tidak_valid' => [
                Rule::requiredIf($request->input('status_proses') === PermohonanStatus::TidakValid->value),
                'string',
                'max:5000',
            ],
        ]);

        $data = [
            'nomor_dokumen' => array_key_exists('nomor_dokumen', $validated)
                ? strip_tags((string) $validated['nomor_dokumen'])
                : $permohonan->nomor_dokumen,
            'tanggal_dokumen' => $validated['tanggal_dokumen'] ?? $permohonan->tanggal_dokumen,
            'tanggal_masuk_pengambilan_dokumen' => $validated['tanggal_masuk_pengambilan_dokumen'] ?? $permohonan->tanggal_masuk_pengambilan_dokumen,
            'status_proses' => $validated['status_proses'],
            'catatan_tidak_valid' => isset($validated['catatan_tidak_valid']) ? strip_tags($validated['catatan_tidak_valid']) : null,
        ];

        if ($validated['status_proses'] === PermohonanStatus::Selesai->value) {
            $data['completed_at'] = now();
        } elseif ($permohonan->status_proses === PermohonanStatus::Selesai) {
            $data['completed_at'] = null;
        }

        $permohonan->update($data);

        return redirect()->back()->with('success', 'Status permohonan berhasil diperbarui.');
    }

    public function sendInvalidNotification(
        DoclangProses $permohonan,
        WhatsAppNotificationService $whatsApp,
    ): RedirectResponse {
        if ($permohonan->status_proses !== PermohonanStatus::TidakValid) {
            return redirect()->back()->with('error', 'Notifikasi hanya dapat dikirim untuk permohonan tidak valid.');
        }

        if (! is_string($permohonan->catatan_tidak_valid) || trim($permohonan->catatan_tidak_valid) === '') {
            return redirect()->back()->with('error', 'Catatan tidak valid wajib diisi sebelum mengirim WhatsApp.');
        }

        if ($permohonan->whatsappNotifications()
            ->where('type', 'invalid')
            ->where('status', 'pending')
            ->exists()) {
            return redirect()->back()->with('error', 'Pengiriman WhatsApp tidak valid masih diproses.');
        }

        $notificationIds = $whatsApp->createNotifications(
            $permohonan,
            'invalid',
            $whatsApp->invalidMessage($permohonan),
            auth()->id(),
        );
        $failedImmediately = $whatsApp->dispatchNotifications($notificationIds);

        return $failedImmediately
            ? redirect()->back()->with('error', 'WhatsApp tidak valid gagal dikirim. Periksa riwayat dan koneksi WhatsApp, lalu kirim ulang.')
            : redirect()->back()->with('success', 'WhatsApp tidak valid masuk antrean pengiriman.');
    }

    public function retryWhatsAppNotification(
        WhatsAppNotification $notification,
        WhatsAppNotificationService $whatsApp,
    ): RedirectResponse {
        if ($notification->status !== 'failed') {
            return redirect()->back()->with('error', 'Hanya notifikasi gagal yang dapat dikirim ulang.');
        }

        if ($whatsApp->retry($notification, auth()->id())) {
            return redirect()->back()->with('error', 'Pengiriman ulang WhatsApp gagal. Periksa koneksi WhatsApp lalu coba kembali.');
        }

        return redirect()->back()->with('success', 'WhatsApp dijadwalkan untuk dikirim ulang.');
    }

    public function destroy(DoclangProses $permohonan): RedirectResponse
    {
        $permohonan->delete();

        return redirect()->back()->with('success', 'Permohonan berhasil dihapus.');
    }

    public function downloadFile(DoclangProses $permohonan, string $field): StreamedResponse
    {
        $columns = [
            'identitas-pemohon' => 'dokumen_identitas_pemohon_path',
            'identitas-pemberi-kuasa' => 'dokumen_identitas_pemberi_kuasa_path',
            'surat-kuasa' => 'surat_kuasa_path',
            'bukti-pelunasan' => 'bukti_pelunasan_path',
            'bukti-validasi-sspd-bphtb' => 'bukti_validasi_sspd_bphtb_path',
            'kuitansi-pembayaran-harga-lelang' => 'kuitansi_pembayaran_harga_lelang_path',
            'slip-setor-pbb-atau-bphtb' => 'slip_setor_pbb_atau_bphtb_path',
            'slip-setor-pph' => 'slip_setor_pph_path',
            'npwp-pemenang-lelang' => 'npwp_pemenang_lelang_path',
        ];

        abort_unless(array_key_exists($field, $columns), 404);

        $path = $permohonan->{$columns[$field]};

        abort_unless(is_string($path) && $path !== '', 404);

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }

        abort_unless(Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->response($path);
    }
}
