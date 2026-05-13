<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentRLController extends Controller
{
    /**
     * Tampilkan daftar Kutipan RL lama dengan pencarian.
     */
    public function index(Request $request): Response
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
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Simpan dokumen Kutipan RL lama dan bersihkan catatan.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Expect formatted nomor_pengajuan like '146/K-RL/2026'
            'nomor_pengajuan' => ['required', 'string', 'unique:documents,nomor_pengajuan', 'regex:/^\\d+\/K-RL\/2026$/'],
            'status_proses' => 'required|in:proses,siap_diambil,selesai,tidak_valid',
            'catatan' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['category'] = 'kutipan_rl';
        $validated['catatan'] = isset($validated['catatan']) ? strip_tags($validated['catatan']) : null;

        Document::create($validated);

        return redirect()->back()->with('success', 'Dokumen Kutipan RL berhasil ditambahkan.');
    }

    /**
     * Perbarui dokumen Kutipan RL lama dan bersihkan catatan.
     */
    public function update(Request $request, Document $document): RedirectResponse
    {
        // ensure this is a kutipan_rl document
        if ($document->category !== 'kutipan_rl') {
            abort(404);
        }

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

    /**
     * Hapus dokumen Kutipan RL lama.
     */
    public function destroy(Document $document): RedirectResponse
    {
        if ($document->category !== 'kutipan_rl') {
            abort(404);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Dokumen pengajuan berhasil dihapus.');
    }
}
