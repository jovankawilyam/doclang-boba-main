<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $documents = Document::with('creator')
            // Only list documents in the 'kuitansi' category for this controller
            ->where('category', 'kuitansi')
            ->when($search, function ($query, $search) {
                $query->where('nomor_pengajuan', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Render the kuitansi page (frontend at resources/js/pages/documents/kuitansi.tsx)
        return Inertia::render('documents/kuitansi', [
            'documents' => $documents,
            'filters' => ['search' => $search]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Expect full formatted nomor_pengajuan like '200/KPHL/2026'
            'nomor_pengajuan' => ['required', 'string', 'unique:documents,nomor_pengajuan', 'regex:/^\\d+\/KPHL\/2026$/'],
            'status_proses' => 'required|in:proses,siap_diambil,selesai',
            'catatan' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        // Force category to 'kuitansi' regardless of input to prevent cross-category insertion
        $validated['category'] = 'kuitansi';

        Document::create($validated);

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil ditambahkan.');
    }

    public function update(Request $request, Document $document)
    {
        // Only allow updates on 'kuitansi' documents via this controller
        if ($document->category !== 'kuitansi') {
            abort(404);
        }

        $validated = $request->validate([
            'status_proses' => 'sometimes|required|in:proses,siap_diambil,selesai',
            'catatan' => 'nullable|string',
        ]);

        $document->update($validated);

        return redirect()->back()->with('success', 'Status dokumen berhasil diperbarui.');
    }

    public function destroy(Document $document)
    {
        // Only allow deletion of kuitansi documents via this controller
        if ($document->category !== 'kuitansi') {
            abort(404);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil dihapus.');
    }
}
