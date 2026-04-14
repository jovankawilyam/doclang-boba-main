<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentRLController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $documents = Document::with('creator')
            ->where('category', 'kutipan_rl')
            ->when($search, function ($query, $search) {
                $query->where('nomor_pengajuan', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('documents/rl', [
            'documents' => $documents,
            'filters' => ['search' => $search]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Expect formatted nomor_pengajuan like '146/K-RL/2026'
            'nomor_pengajuan' => ['required', 'string', 'unique:documents,nomor_pengajuan', 'regex:/^\\d+\/K-RL\/2026$/'],
            'status_proses' => 'required|in:proses,siap_diambil,selesai',
            'catatan' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['category'] = 'kutipan_rl';

        Document::create($validated);

        return redirect()->back()->with('success', 'Dokumen Kutipan RL berhasil ditambahkan.');
    }

    public function update(Request $request, Document $document)
    {
        // ensure this is a kutipan_rl document
        if ($document->category !== 'kutipan_rl') {
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
        if ($document->category !== 'kutipan_rl') {
            abort(404);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil dihapus.');
    }
}
