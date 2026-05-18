<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\DoclangProses;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    private const CATEGORY_TO_SERVICE = [
        'kuitansi' => 'Pemberian Kuitansi Pembayaran',
        'kutipan_rl' => 'Pemberian Kutipan Risalah Lelang',
        'validasi_pph' => 'Validasi PPh',
    ];

    public static function getStatistics(): array
    {
        $categories = ['kuitansi', 'kutipan_rl', 'validasi_pph'];
        $statuses = ['proses', 'siap_diambil', 'selesai', 'tidak_valid'];
        $stats = [];

        foreach ($categories as $cat) {
            $stats[$cat] = array_fill_keys($statuses, 0);
            $stats[$cat]['total'] = 0;
        }

        $serviceToCategory = array_flip(self::CATEGORY_TO_SERVICE);

        $rows = DB::table('doclang_proses')
            ->select('jenis_layanan', 'status_proses', DB::raw('count(*) as total'))
            ->whereIn('jenis_layanan', array_values(self::CATEGORY_TO_SERVICE))
            ->groupBy('jenis_layanan', 'status_proses')
            ->get();

        foreach ($rows as $row) {
            $category = $serviceToCategory[$row->jenis_layanan] ?? null;
            if (! $category) {
                continue;
            }

            $total = (int) $row->total;
            if (in_array($row->status_proses, $statuses, true)) {
                $stats[$category][$row->status_proses] = $total;
            }
            $stats[$category]['total'] += $total;
        }

        return $stats;
    }

    public function index(Request $request, string $category = 'kuitansi'): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $service = self::CATEGORY_TO_SERVICE[$category] ?? self::CATEGORY_TO_SERVICE['kuitansi'];

        $documents = DoclangProses::query()
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
            'kuitansi' => 'documents/kuitansi',
            'kutipan_rl' => 'documents/rl',
            'validasi_pph' => 'documents/validasi-pph',
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
            'category' => 'required|in:kuitansi,kutipan_rl,validasi_pph',
            'status_proses' => 'nullable|in:proses,siap_diambil,selesai,tidak_valid',
        ]);

        DB::transaction(function () use ($validated): void {
            DoclangProses::create([
                'kode_lot_lelang' => strip_tags($validated['nomor_pengajuan']),
                'id_pengajuan' => $this->generateIdPengajuan(),
                'tanggal_masuk_pengambilan_dokumen' => now()->toDateString(),
                'nama_pemohon' => 'Input Admin',
                'nomor_wa_pemohon' => config('services.whatsapp.sender_number', '081911883609'),
                'jenis_layanan' => self::CATEGORY_TO_SERVICE[$validated['category']],
                'status_proses' => $validated['status_proses'] ?? 'proses',
            ]);
        });

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil ditambahkan.');
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'status_proses' => 'sometimes|required|in:proses,siap_diambil,selesai,tidak_valid',
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
}
