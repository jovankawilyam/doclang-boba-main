<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public static function getStatistics()
    {
        $categories = ['kuitansi', 'kutipan_rl', 'validasi_pph'];
        $stats = [];

        foreach ($categories as $cat) {
            $stats[$cat] = [
                'total' => Document::where('category', $cat)->count(),
                'proses' => Document::where('category', $cat)->where('status_proses', 'proses')->count(),
                'siap_diambil' => Document::where('category', $cat)->where('status_proses', 'siap_diambil')->count(),
                'selesai' => Document::where('category', $cat)->where('status_proses', 'selesai')->count(),
            ];
        }

        return $stats;
    }

    public function index(Request $request, $category = 'kuitansi')
    {
        $search = $request->input('search');

        $documents = Document::with('creator')
            ->where('category', $category)
            ->when($search, function ($query, $search) {
                $query->where('nomor_pengajuan', 'like', "%{$search}%");
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
            'filters' => ['search' => $search]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_pengajuan' => ['required', 'string', 'unique:documents,nomor_pengajuan'],
            'status_proses' => 'required|in:proses,siap_diambil,selesai',
            'catatan' => 'nullable|string',
            'category' => 'required|in:kuitansi,kutipan_rl,validasi_pph',
        ]);

        $validated['created_by'] = auth()->id();

        Document::create($validated);

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil ditambahkan.');
    }

    public function update(Request $request, Document $document)
    {
        $validated = $request->validate([
            'status_proses' => 'sometimes|required|in:proses,siap_diambil,selesai',
            'catatan' => 'nullable|string',
        ]);

        $document->update($validated);

        return redirect()->back()->with('success', 'Status dokumen berhasil diperbarui.');
    }

    public function destroy(Document $document)
    {
        $document->delete();

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil dihapus.');
    }
}
