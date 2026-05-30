<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\SendWhatsAppNotification;
use App\Models\DoclangProses;
use App\Models\WhatsAppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class PermohonanController extends Controller
{
    private const JENIS_LAYANAN = [
        'kuitansi',
        'risalah_lelang',
        'validasi_pph',
    ];

    private const JENIS_LAYANAN_LABEL = [
        'kuitansi' => 'Pemberian Kuitansi Pembayaran',
        'risalah_lelang' => 'Pemberian Kutipan Risalah Lelang',
        'validasi_pph' => 'Validasi PPh',
    ];

    private const DOKUMEN_RULES = ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'];

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->merge([
            'jenis_layanan' => $this->normalizeJenisLayanan((string) $request->input('jenis_layanan')),
        ]);

        $validated = $request->validate([
            'peran_pemohon' => ['required', Rule::in(['pemenang', 'kuasa'])],
            'email_pemohon' => ['required', 'email', 'max:255'],
            'jenis_identitas_pemohon' => ['required', Rule::in(['KTP', 'SIM', 'NPWP'])],
            'nomor_identitas_pemohon' => ['required', 'string', 'max:255', 'regex:/^[0-9]+$/'],
            'alamat_pemohon' => ['required', 'string', 'max:5000'],
            'nama_pemohon' => ['required', 'string', 'max:255'],
            'nomor_wa_pemohon' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'nama_pemberi_kuasa' => [
                Rule::requiredIf($request->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:255',
            ],
            'jenis_identitas_pemberi_kuasa' => [
                Rule::requiredIf($request->input('peran_pemohon') === 'kuasa'),
                'nullable',
                Rule::in(['KTP', 'SIM', 'Akta Pendirian']),
            ],
            'nomor_identitas_pemberi_kuasa' => [
                Rule::requiredIf($request->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:255',
            ],
            'alamat_pemberi_kuasa' => [
                Rule::requiredIf($request->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:5000',
            ],
            'nomor_wa_pemberi_kuasa' => [
                Rule::requiredIf($request->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:30',
                'regex:/^[0-9+\-\s()]+$/',
            ],
            'kode_lot_lelang' => ['required', 'string', 'max:255'],
            'tanggal_masuk_pengambilan_dokumen' => ['nullable', 'date'],
            'jenis_layanan' => ['required', 'string'],
            'tanggal_pelunasan' => ['required', 'date'],
            'jenis_objek_risalah' => [
                'nullable',
                Rule::in(['tanah_bangunan', 'kendaraan']),
            ],
            'nomor_kuitansi_pembayaran_harga_lelang' => [
                'nullable',
                'string',
                'max:255',
            ],
            'nomor_objek_pajak' => [
                'nullable',
                'string',
                'max:255',
            ],
            'alamat_objek_lelang' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'ntpn' => [
                'nullable',
                'string',
                'max:255',
            ],
            'npwp_pemenang_lelang' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[0-9]+$/',
            ],
            'nomor_dokumen' => ['nullable', 'string', 'max:255'],
            'tanggal_dokumen' => ['nullable', 'date'],
            'dokumen_identitas_pemohon' => ['required', ...self::DOKUMEN_RULES],
            'bukti_pelunasan' => [
                ...self::DOKUMEN_RULES,
            ],
            'bukti_validasi_sspd_bphtb' => [
                ...self::DOKUMEN_RULES,
            ],
            'kuitansi_pembayaran_harga_lelang' => [
                ...self::DOKUMEN_RULES,
            ],
            'slip_setor_pbb_atau_bphtb' => [
                ...self::DOKUMEN_RULES,
            ],
            'slip_setor_pph' => [
                ...self::DOKUMEN_RULES,
            ],
            'npwp_pemenang_lelang_file' => [
                ...self::DOKUMEN_RULES,
            ],
            'dokumen_identitas_pemberi_kuasa' => [
                Rule::requiredIf($request->input('peran_pemohon') === 'kuasa'),
                ...self::DOKUMEN_RULES,
            ],
            'surat_kuasa' => [
                Rule::requiredIf($request->input('peran_pemohon') === 'kuasa'),
                ...self::DOKUMEN_RULES,
            ],
        ], [
            'nomor_identitas_pemohon.regex' => 'Nomor Identitas Pemohon wajib berisi angka saja.',
            'nomor_wa_pemohon.regex' => 'Nomor WhatsApp hanya boleh berisi angka dan tanda +.',
            'npwp_pemenang_lelang.regex' => 'NPWP Pemenang Lelang wajib berisi angka saja.',
            'dokumen_identitas_pemohon.required' => 'Dokumen identitas pemohon wajib diunggah.',
            'dokumen_identitas_pemohon.mimes' => 'Dokumen identitas pemohon harus berupa PDF, JPG, JPEG, atau PNG.',
            'dokumen_identitas_pemohon.max' => 'Ukuran dokumen identitas pemohon maksimal 10 MB.',
            'bukti_pelunasan.mimes' => 'Bukti pelunasan harus berupa PDF atau gambar.',
            'bukti_pelunasan.max' => 'Ukuran bukti pelunasan maksimal 10 MB.',
            'dokumen_identitas_pemberi_kuasa.required' => 'Dokumen identitas pemberi kuasa wajib diunggah.',
            'dokumen_identitas_pemberi_kuasa.mimes' => 'Dokumen identitas pemberi kuasa harus berupa PDF, JPG, JPEG, atau PNG.',
            'dokumen_identitas_pemberi_kuasa.max' => 'Ukuran dokumen identitas pemberi kuasa maksimal 10 MB.',
            'surat_kuasa.required' => 'Surat kuasa wajib diunggah.',
            'surat_kuasa.mimes' => 'Surat kuasa harus berupa PDF, JPG, JPEG, atau PNG.',
            'surat_kuasa.max' => 'Ukuran surat kuasa maksimal 10 MB.',
        ]);

        validator($validated, [
            'jenis_layanan' => ['required', Rule::in(self::JENIS_LAYANAN)],
        ])->validate();

        $buktiPelunasanPath = $request->file('bukti_pelunasan')?->store('doclang/bukti-pelunasan', 'local');
        $buktiValidasiSspdBphtbPath = $request->file('bukti_validasi_sspd_bphtb')?->store('doclang/bukti-validasi-sspd-bphtb', 'local');
        $kuitansiPembayaranHargaLelangPath = $request->file('kuitansi_pembayaran_harga_lelang')?->store('doclang/kuitansi-pembayaran-harga-lelang', 'local');
        $slipSetorPbbAtauBphtbPath = $request->file('slip_setor_pbb_atau_bphtb')?->store('doclang/slip-setor-pbb-atau-bphtb', 'local');
        $slipSetorPphPath = $request->file('slip_setor_pph')?->store('doclang/slip-setor-pph', 'local');
        $npwpPemenangLelangPath = $request->file('npwp_pemenang_lelang_file')?->store('doclang/npwp-pemenang-lelang', 'local');
        $dokumenIdentitasPemohonPath = $request->file('dokumen_identitas_pemohon')?->store('doclang/identitas-pemohon', 'local');
        $dokumenIdentitasPemberiKuasaPath = $request->file('dokumen_identitas_pemberi_kuasa')?->store('doclang/identitas-pemberi-kuasa', 'local');
        $suratKuasaPath = $request->file('surat_kuasa')?->store('doclang/surat-kuasa', 'local');

        $permohonan = DB::transaction(function () use ($buktiPelunasanPath, $buktiValidasiSspdBphtbPath, $dokumenIdentitasPemohonPath, $dokumenIdentitasPemberiKuasaPath, $kuitansiPembayaranHargaLelangPath, $npwpPemenangLelangPath, $slipSetorPbbAtauBphtbPath, $slipSetorPphPath, $suratKuasaPath, $validated): DoclangProses {
            $permohonan = DoclangProses::create([
                'kode_lot_lelang' => strip_tags($validated['kode_lot_lelang']),
                'id_pengajuan' => $this->generateIdPengajuan($validated['jenis_layanan']),
                'tanggal_masuk_pengambilan_dokumen' => $validated['tanggal_masuk_pengambilan_dokumen'] ?? now()->toDateString(),
                'peran_pemohon' => $validated['peran_pemohon'],
                'email_pemohon' => $validated['email_pemohon'] ?? null,
                'jenis_identitas_pemohon' => $validated['jenis_identitas_pemohon'] ?? null,
                'nomor_identitas_pemohon' => isset($validated['nomor_identitas_pemohon']) ? strip_tags($validated['nomor_identitas_pemohon']) : null,
                'alamat_pemohon' => isset($validated['alamat_pemohon']) ? strip_tags($validated['alamat_pemohon']) : null,
                'nama_pemohon' => strip_tags($validated['nama_pemohon']),
                'nomor_wa_pemohon' => $validated['nomor_wa_pemohon'],
                'nama_pemberi_kuasa' => isset($validated['nama_pemberi_kuasa']) ? strip_tags($validated['nama_pemberi_kuasa']) : null,
                'jenis_identitas_pemberi_kuasa' => $validated['jenis_identitas_pemberi_kuasa'] ?? null,
                'nomor_identitas_pemberi_kuasa' => isset($validated['nomor_identitas_pemberi_kuasa']) ? strip_tags($validated['nomor_identitas_pemberi_kuasa']) : null,
                'alamat_pemberi_kuasa' => isset($validated['alamat_pemberi_kuasa']) ? strip_tags($validated['alamat_pemberi_kuasa']) : null,
                'nomor_wa_pemberi_kuasa' => $validated['nomor_wa_pemberi_kuasa'] ?? null,
                'jenis_layanan' => $validated['jenis_layanan'],
                'tanggal_pelunasan' => $validated['tanggal_pelunasan'],
                'jenis_objek_risalah' => $validated['jenis_objek_risalah'] ?? null,
                'nomor_kuitansi_pembayaran_harga_lelang' => isset($validated['nomor_kuitansi_pembayaran_harga_lelang']) ? strip_tags($validated['nomor_kuitansi_pembayaran_harga_lelang']) : null,
                'nomor_objek_pajak' => isset($validated['nomor_objek_pajak']) ? strip_tags($validated['nomor_objek_pajak']) : null,
                'alamat_objek_lelang' => isset($validated['alamat_objek_lelang']) ? strip_tags($validated['alamat_objek_lelang']) : null,
                'ntpn' => isset($validated['ntpn']) ? strip_tags($validated['ntpn']) : null,
                'npwp_pemenang_lelang' => isset($validated['npwp_pemenang_lelang']) ? strip_tags($validated['npwp_pemenang_lelang']) : null,
                'nomor_dokumen' => isset($validated['nomor_dokumen']) ? strip_tags($validated['nomor_dokumen']) : null,
                'tanggal_dokumen' => $validated['tanggal_dokumen'] ?? null,
                'dokumen_identitas_pemohon_path' => $dokumenIdentitasPemohonPath,
                'dokumen_identitas_pemberi_kuasa_path' => $dokumenIdentitasPemberiKuasaPath,
                'surat_kuasa_path' => $suratKuasaPath,
                'bukti_pelunasan_path' => $buktiPelunasanPath,
                'bukti_validasi_sspd_bphtb_path' => $buktiValidasiSspdBphtbPath,
                'kuitansi_pembayaran_harga_lelang_path' => $kuitansiPembayaranHargaLelangPath,
                'slip_setor_pbb_atau_bphtb_path' => $slipSetorPbbAtauBphtbPath,
                'slip_setor_pph_path' => $slipSetorPphPath,
                'npwp_pemenang_lelang_path' => $npwpPemenangLelangPath,
                'status_proses' => 'proses',
            ]);

            $message = "Permohonan Doclang Boba berhasil diterima.\n\nToken Permohonan: {$permohonan->id_pengajuan}\nLayanan: ".self::JENIS_LAYANAN_LABEL[$permohonan->jenis_layanan]."\nStatus: proses\n\nSimpan token ini untuk pengecekan layanan KPKNL Bogor.";

            $this->queueWhatsAppNotifications($permohonan, 'submission', $message);

            return $permohonan;
        });

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
            'status_proses' => ['required', Rule::in(['proses', 'siap_diambil', 'selesai', 'tidak_valid'])],
            'catatan_tidak_valid' => [
                Rule::requiredIf($request->input('status_proses') === 'tidak_valid'),
                'string',
                'max:5000',
            ],
        ]);

        $permohonan->update([
            'nomor_dokumen' => array_key_exists('nomor_dokumen', $validated)
                ? strip_tags((string) $validated['nomor_dokumen'])
                : $permohonan->nomor_dokumen,
            'tanggal_dokumen' => $validated['tanggal_dokumen'] ?? $permohonan->tanggal_dokumen,
            'tanggal_masuk_pengambilan_dokumen' => $validated['tanggal_masuk_pengambilan_dokumen'] ?? $permohonan->tanggal_masuk_pengambilan_dokumen,
            'status_proses' => $validated['status_proses'],
            'catatan_tidak_valid' => isset($validated['catatan_tidak_valid']) ? strip_tags($validated['catatan_tidak_valid']) : null,
        ]);

        return redirect()->back()->with('success', 'Status permohonan berhasil diperbarui.');
    }

    public function sendInvalidNotification(DoclangProses $permohonan): RedirectResponse
    {
        if ($permohonan->status_proses !== 'tidak_valid') {
            return redirect()->back()->with('error', 'Notifikasi hanya dapat dikirim untuk permohonan tidak valid.');
        }

        if (! is_string($permohonan->catatan_tidak_valid) || trim($permohonan->catatan_tidak_valid) === '') {
            return redirect()->back()->with('error', 'Catatan tidak valid wajib diisi sebelum mengirim WhatsApp.');
        }

        $message = "Permohonan Doclang Boba *TIDAK VALID*.\n\nNomor Tiket: {$permohonan->id_pengajuan}\nLayanan: ".(self::JENIS_LAYANAN_LABEL[$permohonan->jenis_layanan] ?? $permohonan->jenis_layanan)."\nAlasan: {$permohonan->catatan_tidak_valid}\n\nSilakan perbaiki berkas sesuai catatan tersebut.";

        if ($permohonan->whatsappNotifications()
            ->where('type', 'invalid')
            ->where('status', 'pending')
            ->exists()) {
            return redirect()->back()->with('error', 'Pengiriman WhatsApp tidak valid masih diproses.');
        }

        $failedImmediately = $this->queueWhatsAppNotifications($permohonan, 'invalid', $message, auth()->id());

        return $failedImmediately
            ? redirect()->back()->with('error', 'WhatsApp tidak valid gagal dikirim. Periksa riwayat dan koneksi WhatsApp, lalu kirim ulang.')
            : redirect()->back()->with('success', 'WhatsApp tidak valid masuk antrean pengiriman.');
    }

    public function retryWhatsAppNotification(WhatsAppNotification $notification): RedirectResponse
    {
        if ($notification->status !== 'failed') {
            return redirect()->back()->with('error', 'Hanya notifikasi gagal yang dapat dikirim ulang.');
        }

        $notification->forceFill([
            'status' => 'pending',
            'retry_count' => $notification->retry_count + 1,
            'error_message' => null,
            'failed_at' => null,
            'requested_by' => auth()->id(),
        ])->save();

        if ($this->dispatchWhatsAppNotification($notification->id)) {
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

    private function generateIdPengajuan(string $jenisLayanan): string
    {
        $suffix = match ($jenisLayanan) {
            'risalah_lelang' => 'K-RL',
            'validasi_pph' => 'V-PPh',
            default => 'KPHL',
        };
        $year = now()->format('Y');
        $pattern = "%/{$suffix}/{$year}";
        $sequence = DoclangProses::where('id_pengajuan', 'like', $pattern)->lockForUpdate()->count() + 1;

        do {
            $id = sprintf('%04d/%s/%s', $sequence, $suffix, $year);
            $sequence++;
        } while (DoclangProses::where('id_pengajuan', $id)->exists());

        return $id;
    }

    /**
     * @return list<string>
     */
    private function whatsappTargets(DoclangProses $permohonan): array
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

    private function queueWhatsAppNotifications(
        DoclangProses $permohonan,
        string $type,
        string $message,
        ?int $requestedBy = null,
    ): bool {
        $failedImmediately = false;

        foreach ($this->whatsappTargets($permohonan) as $targetNumber) {
            $notification = $permohonan->whatsappNotifications()->create([
                'type' => $type,
                'target_number' => $targetNumber,
                'message' => $message,
                'status' => 'pending',
                'requested_by' => $requestedBy,
            ]);

            if ($this->dispatchWhatsAppNotification($notification->id)) {
                $failedImmediately = true;
            }
        }

        return $failedImmediately;
    }

    private function dispatchWhatsAppNotification(int $notificationId): bool
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

    private function normalizeJenisLayanan(string $jenisLayanan): string
    {
        if (in_array($jenisLayanan, self::JENIS_LAYANAN, true)) {
            return $jenisLayanan;
        }

        if (str_contains($jenisLayanan, 'Kuitansi')) {
            return 'kuitansi';
        }

        if (str_contains($jenisLayanan, 'Kutipan Risalah Lelang')) {
            return 'risalah_lelang';
        }

        if (str_contains($jenisLayanan, 'Validasi PPh')) {
            return 'validasi_pph';
        }

        return $jenisLayanan;
    }
}
