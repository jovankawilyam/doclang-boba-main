<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\JenisLayanan;
use App\Enums\PermohonanStatus;
use App\Http\Requests\StorePermohonanRequest;
use App\Models\DoclangProses;
use App\Services\PermohonanFileStorage;
use App\Services\PermohonanNumberGenerator;
use App\Services\WhatsAppNotificationService;
use Illuminate\Support\Facades\DB;
use Throwable;

class CreatePermohonanAction
{
    public function __construct(
        private readonly PermohonanNumberGenerator $numberGenerator,
        private readonly PermohonanFileStorage $fileStorage,
        private readonly WhatsAppNotificationService $whatsApp,
    ) {}

    public function execute(StorePermohonanRequest $request): DoclangProses
    {
        $data = $request->sanitized();
        $jenisLayanan = JenisLayanan::from($data['jenis_layanan']);
        $storedPaths = [];
        $notificationIds = [];

        try {
            $permohonan = DB::transaction(function () use ($request, $data, $jenisLayanan, &$storedPaths, &$notificationIds): DoclangProses {
                $storedPaths = $this->fileStorage->store($request);

                $permohonan = DoclangProses::create([
                    'kode_lot_lelang' => $data['kode_lot_lelang'],
                    'id_pengajuan' => $this->numberGenerator->generate($jenisLayanan),
                    'tanggal_masuk_pengambilan_dokumen' => $data['tanggal_masuk_pengambilan_dokumen'] ?? now()->toDateString(),
                    'peran_pemohon' => $data['peran_pemohon'],
                    'email_pemohon' => $data['email_pemohon'] ?? null,
                    'jenis_identitas_pemohon' => $data['jenis_identitas_pemohon'] ?? null,
                    'nomor_identitas_pemohon' => $data['nomor_identitas_pemohon'] ?? null,
                    'alamat_pemohon' => $data['alamat_pemohon'] ?? null,
                    'nama_pemohon' => $data['nama_pemohon'],
                    'nomor_wa_pemohon' => $data['nomor_wa_pemohon'],
                    'nama_pemberi_kuasa' => $data['nama_pemberi_kuasa'] ?? null,
                    'jenis_identitas_pemberi_kuasa' => $data['jenis_identitas_pemberi_kuasa'] ?? null,
                    'nomor_identitas_pemberi_kuasa' => $data['nomor_identitas_pemberi_kuasa'] ?? null,
                    'alamat_pemberi_kuasa' => $data['alamat_pemberi_kuasa'] ?? null,
                    'nomor_wa_pemberi_kuasa' => $data['nomor_wa_pemberi_kuasa'] ?? null,
                    'jenis_layanan' => $jenisLayanan,
                    'tanggal_pelunasan' => $data['tanggal_pelunasan'],
                    'jenis_objek_risalah' => $data['jenis_objek_risalah'] ?? null,
                    'nomor_kuitansi_pembayaran_harga_lelang' => $data['nomor_kuitansi_pembayaran_harga_lelang'] ?? null,
                    'nomor_objek_pajak' => $data['nomor_objek_pajak'] ?? null,
                    'alamat_objek_lelang' => $data['alamat_objek_lelang'] ?? null,
                    'ntpn' => $data['ntpn'] ?? null,
                    'npwp_pemenang_lelang' => $data['npwp_pemenang_lelang'] ?? null,
                    'nomor_dokumen' => $data['nomor_dokumen'] ?? null,
                    'tanggal_dokumen' => $data['tanggal_dokumen'] ?? null,
                    ...$storedPaths,
                    'status_proses' => PermohonanStatus::Proses,
                ]);

                $notificationIds = $this->whatsApp->createNotifications(
                    $permohonan,
                    'submission',
                    $this->whatsApp->submissionMessage($permohonan),
                );

                return $permohonan;
            });
        } catch (Throwable $exception) {
            $this->fileStorage->deleteStoredPaths($storedPaths);

            throw $exception;
        }

        $this->whatsApp->dispatchNotifications($notificationIds);

        return $permohonan;
    }
}
