<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public static function getStatistics(): array
    {
        $categories = ['kuitansi', 'kutipan_rl', 'validasi_pph'];
        $statuses = ['proses', 'siap_diambil', 'selesai', 'tidak_valid'];
        $stats = [];

        foreach ($categories as $cat) {
            $stats[$cat] = array_fill_keys($statuses, 0);
            $stats[$cat]['total'] = 0;
        }

        $rows = DB::table('documents')
            ->select('category', 'status_proses', DB::raw('count(*) as total'))
            ->whereIn('category', $categories)
            ->groupBy('category', 'status_proses')
            ->get();

        foreach ($rows as $row) {
            $total = (int) $row->total;
            if (in_array($row->status_proses, $statuses, true)) {
                $stats[$row->category][$row->status_proses] = $total;
            }
            $stats[$row->category]['total'] += $total;
        }

        return $stats;
    }

    public function index(Request $request, string $category = 'kuitansi'): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');

        $documents = Document::with('creator')
            ->where('category', $category)
            ->when($search, function ($query, $search) {
                $query->where('nomor_pengajuan', 'like', "%{$search}%");
            })
            ->when($status, function ($query, $status) {
                $query->where('status_proses', $status);
            })
            ->orderBy('created_at', 'desc')
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
            'nomor_pengajuan' => [
                'required',
                'string',
                Rule::unique('documents', 'nomor_pengajuan')->where('category', $request->input('category')),
            ],
            'status_proses' => 'required|in:proses,siap_diambil,selesai,tidak_valid',
            'catatan' => 'nullable|string',
            'category' => 'required|in:kuitansi,kutipan_rl,validasi_pph',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['catatan'] = isset($validated['catatan']) ? strip_tags($validated['catatan']) : null;

        Document::create($validated);

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
}
