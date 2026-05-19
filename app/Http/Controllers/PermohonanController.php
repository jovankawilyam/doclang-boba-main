<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\SendWhatsAppNotification;
use App\Models\DoclangProses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PermohonanController extends Controller
{
    private const JENIS_LAYANAN = [
        'Pemberian Kuitansi Pembayaran',
        'Pemberian Kutipan Risalah Lelang',
        'Validasi PPh',
    ];

    private const DOKUMEN_RULES = ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'];

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->merge([
            'jenis_layanan' => $this->normalizeJenisLayanan((string) $request->input('jenis_layanan')),
        ]);

        $validated = $request->validate([
            'peran_pemohon' => ['required', Rule::in(['pemenang', 'kuasa'])],
            'nama_pemohon' => ['required', 'string', 'max:255'],
            'nomor_wa_pemohon' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'kode_lot_lelang' => ['required', 'string', 'max:255'],
            'tanggal_masuk_pengambilan_dokumen' => ['nullable', 'date'],
            'jenis_layanan' => ['required', 'string'],
            'nomor_dokumen' => ['nullable', 'string', 'max:255'],
            'tanggal_dokumen' => ['nullable', 'date'],
            'dokumen_identitas_pemohon' => ['required', ...self::DOKUMEN_RULES],
            'bukti_pelunasan' => [
                Rule::requiredIf($request->input('jenis_layanan') === 'Validasi PPh'),
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
            'nomor_wa_pemohon.regex' => 'Nomor WhatsApp hanya boleh berisi angka dan tanda +.',
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

        $buktiPelunasanPath = $request->file('bukti_pelunasan')?->store('doclang/bukti-pelunasan', 'public');
        $dokumenIdentitasPemohonPath = $request->file('dokumen_identitas_pemohon')?->store('doclang/identitas-pemohon', 'public');
        $dokumenIdentitasPemberiKuasaPath = $request->file('dokumen_identitas_pemberi_kuasa')?->store('doclang/identitas-pemberi-kuasa', 'public');
        $suratKuasaPath = $request->file('surat_kuasa')?->store('doclang/surat-kuasa', 'public');

        $permohonan = DB::transaction(function () use ($buktiPelunasanPath, $dokumenIdentitasPemohonPath, $dokumenIdentitasPemberiKuasaPath, $suratKuasaPath, $validated): DoclangProses {
            $permohonan = DoclangProses::create([
                'kode_lot_lelang' => strip_tags($validated['kode_lot_lelang']),
                'id_pengajuan' => $this->generateIdPengajuan(),
                'tanggal_masuk_pengambilan_dokumen' => $validated['tanggal_masuk_pengambilan_dokumen'] ?? now()->toDateString(),
                'peran_pemohon' => $validated['peran_pemohon'],
                'nama_pemohon' => strip_tags($validated['nama_pemohon']),
                'nomor_wa_pemohon' => $validated['nomor_wa_pemohon'],
                'jenis_layanan' => $validated['jenis_layanan'],
                'nomor_dokumen' => isset($validated['nomor_dokumen']) ? strip_tags($validated['nomor_dokumen']) : null,
                'tanggal_dokumen' => $validated['tanggal_dokumen'] ?? null,
                'dokumen_identitas_pemohon_path' => $dokumenIdentitasPemohonPath,
                'dokumen_identitas_pemberi_kuasa_path' => $dokumenIdentitasPemberiKuasaPath,
                'surat_kuasa_path' => $suratKuasaPath,
                'bukti_pelunasan_path' => $buktiPelunasanPath,
                'status_proses' => 'proses',
            ]);

            SendWhatsAppNotification::dispatch(
                $permohonan->nomor_wa_pemohon,
                "Permohonan Doclang Boba berhasil diterima.\n\nNomor Tiket: {$permohonan->id_pengajuan}\nLayanan: {$permohonan->jenis_layanan}\nStatus: proses\n\nSimpan nomor tiket ini untuk pengecekan layanan KPKNL Bogor."
            );

            return $permohonan;
        });

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Permohonan berhasil dikirim. Data telah tersimpan untuk Dashboard Admin.',
                'id_pengajuan' => $permohonan->id_pengajuan,
            ]);
        }

        return redirect()
            ->back()
            ->with('success', "Permohonan berhasil dikirim. Nomor tiket: {$permohonan->id_pengajuan}");
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

        $wasInvalid = $permohonan->status_proses !== 'tidak_valid' && $validated['status_proses'] === 'tidak_valid';

        $permohonan->update([
            'nomor_dokumen' => array_key_exists('nomor_dokumen', $validated)
                ? strip_tags((string) $validated['nomor_dokumen'])
                : $permohonan->nomor_dokumen,
            'tanggal_dokumen' => $validated['tanggal_dokumen'] ?? $permohonan->tanggal_dokumen,
            'tanggal_masuk_pengambilan_dokumen' => $validated['tanggal_masuk_pengambilan_dokumen'] ?? $permohonan->tanggal_masuk_pengambilan_dokumen,
            'status_proses' => $validated['status_proses'],
            'catatan_tidak_valid' => isset($validated['catatan_tidak_valid']) ? strip_tags($validated['catatan_tidak_valid']) : null,
        ]);

        if ($wasInvalid) {
            SendWhatsAppNotification::dispatch(
                $permohonan->nomor_wa_pemohon,
                "Permohonan Doclang Boba tidak valid.\n\nNomor Tiket: {$permohonan->id_pengajuan}\nLayanan: {$permohonan->jenis_layanan}\nAlasan: {$permohonan->catatan_tidak_valid}\n\nSilakan perbaiki berkas sesuai catatan tersebut."
            );
        }

        return redirect()->back()->with('success', 'Status permohonan berhasil diperbarui.');
    }

    public function destroy(DoclangProses $permohonan): RedirectResponse
    {
        $permohonan->delete();

        return redirect()->back()->with('success', 'Permohonan berhasil dihapus.');
    }

    private function generateIdPengajuan(): string
    {
        $prefix = 'REQ-BOGOR-'.now()->format('Ymd');
        $sequence = DoclangProses::where('id_pengajuan', 'like', "{$prefix}-%")->lockForUpdate()->count() + 1;

        do {
            $id = sprintf('%s-%04d', $prefix, $sequence);
            $sequence++;
        } while (DoclangProses::where('id_pengajuan', $id)->exists());

        return $id;
    }

    private function normalizeJenisLayanan(string $jenisLayanan): string
    {
        if (str_contains($jenisLayanan, 'Kuitansi')) {
            return 'Pemberian Kuitansi Pembayaran';
        }

        if (str_contains($jenisLayanan, 'Kutipan Risalah Lelang')) {
            return 'Pemberian Kutipan Risalah Lelang';
        }

        if (str_contains($jenisLayanan, 'Validasi PPh')) {
            return 'Validasi PPh';
        }

        return $jenisLayanan;
    }
}
