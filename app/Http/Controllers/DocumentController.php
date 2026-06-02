<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\JenisLayanan;
use App\Enums\PermohonanStatus;
use App\Models\DoclangProses;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public const CATEGORY_TO_SERVICE = [
        'kuitansi' => JenisLayanan::Kuitansi->value,
        'risalah_lelang' => JenisLayanan::RisalahLelang->value,
        'validasi_pph' => JenisLayanan::ValidasiPph->value,
    ];

    private const LEGACY_CATEGORY_ALIASES = [
        'kutipan_rl' => JenisLayanan::RisalahLelang->value,
    ];

    public static function getStatistics(): array
    {
        $categories = JenisLayanan::values();
        $statuses = PermohonanStatus::values();
        $stats = [];

        foreach ($categories as $cat) {
            $stats[$cat] = array_fill_keys($statuses, 0);
            $stats[$cat]['total'] = 0;
        }

        $rows = DB::table('doclang_proses')
            ->select('jenis_layanan', 'status_proses', DB::raw('count(*) as total'))
            ->whereIn('jenis_layanan', array_values(self::CATEGORY_TO_SERVICE))
            ->groupBy('jenis_layanan', 'status_proses')
            ->get();

        foreach ($rows as $row) {
            $category = $row->jenis_layanan;
            if (! $category) {
                continue;
            }

            $total = (int) $row->total;
            if (in_array($row->status_proses, $statuses, true)) {
                $stats[$category][$row->status_proses] = $total;
            }
            $stats[$category]['total'] += $total;
        }

        $stats['kutipan_rl'] = $stats[JenisLayanan::RisalahLelang->value];

        return $stats;
    }

    public static function findPublicTrackingDocument(string $search, JenisLayanan $service): ?array
    {
        $document = DoclangProses::query()
            ->where('jenis_layanan', $service->value)
            ->where(function ($query) use ($search): void {
                $query
                    ->where('id_pengajuan', $search)
                    ->orWhere('kode_lot_lelang', $search)
                    ->orWhere('nomor_dokumen', $search);
            })
            ->latest()
            ->first();

        if (! $document) {
            return null;
        }

        return [
            'id' => $document->id,
            'nomor_pengajuan' => $document->id_pengajuan,
            'kode_lot_lelang' => $document->kode_lot_lelang,
            'status_proses' => $document->status_proses?->value,
            'catatan' => $document->catatan_tidak_valid,
        ];
    }

    public function index(Request $request, string $category = JenisLayanan::Kuitansi->value): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $category = self::LEGACY_CATEGORY_ALIASES[$category] ?? $category;
        $service = self::CATEGORY_TO_SERVICE[$category] ?? self::CATEGORY_TO_SERVICE[JenisLayanan::Kuitansi->value];

        $documents = DoclangProses::query()
            ->with(['whatsappNotifications' => fn ($query) => $query->latest()])
            ->where('jenis_layanan', $service)
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('id_pengajuan', 'like', "%{$search}%")
                        ->orWhere('kode_lot_lelang', 'like', "%{$search}%")
                        ->orWhere('nama_pemohon', 'like', "%{$search}%")
                        ->orWhere('nomor_wa_pemohon', 'like', "%{$search}%")
                        ->orWhere('nomor_dokumen', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status_proses', $status);
            })
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $viewMap = [
            JenisLayanan::Kuitansi->value => 'documents/kuitansi',
            JenisLayanan::RisalahLelang->value => 'documents/rl',
            JenisLayanan::ValidasiPph->value => 'documents/validasi-pph',
        ];

        return Inertia::render($viewMap[$category] ?? 'documents/kuitansi', [
            'documents' => $documents,
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nomor_pengajuan' => ['required', 'string', 'max:255'],
            'category' => 'required|in:kuitansi,kutipan_rl,risalah_lelang,validasi_pph',
            'status_proses' => ['nullable', Rule::enum(PermohonanStatus::class)],
        ]);

        $category = self::LEGACY_CATEGORY_ALIASES[$validated['category']] ?? $validated['category'];

        DB::transaction(function () use ($category, $validated): void {
            DoclangProses::create([
                'kode_lot_lelang' => strip_tags($validated['nomor_pengajuan']),
                'id_pengajuan' => $this->generateIdPengajuan($category),
                'tanggal_masuk_pengambilan_dokumen' => now()->toDateString(),
                'nama_pemohon' => 'Input Admin',
                'nomor_wa_pemohon' => config('services.whatsapp.sender_number', '081911883609'),
                'jenis_layanan' => self::CATEGORY_TO_SERVICE[$category],
                'status_proses' => $validated['status_proses'] ?? PermohonanStatus::Proses,
            ]);
        });

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil ditambahkan.');
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'status_proses' => ['sometimes', 'required', Rule::enum(PermohonanStatus::class)],
            'catatan' => 'nullable|string',
        ]);

        if (array_key_exists('catatan', $validated)) {
            $validated['catatan'] = $validated['catatan'] !== null ? strip_tags($validated['catatan']) : null;
        }

        $document->update($validated);

        return redirect()->back()->with('success', 'Status dokumen berhasil diperbarui.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $document->delete();

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil dihapus.');
    }

    private function generateIdPengajuan(string $jenisLayanan): string
    {
        $suffix = match ($jenisLayanan) {
            JenisLayanan::RisalahLelang->value => JenisLayanan::RisalahLelang->ticketSuffix(),
            JenisLayanan::ValidasiPph->value => JenisLayanan::ValidasiPph->ticketSuffix(),
            default => JenisLayanan::Kuitansi->ticketSuffix(),
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
}
