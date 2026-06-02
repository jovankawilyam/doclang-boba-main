<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\JenisLayanan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $search = $request->input('search');
        $targetCategory = $request->input('category');

        $isKuitansiSearch = $search && $targetCategory === JenisLayanan::Kuitansi->value;
        $isRisalahLelangSearch = $search && in_array($targetCategory, ['kutipan_rl', JenisLayanan::RisalahLelang->value], true);
        $isValidasiPphSearch = $search && $targetCategory === JenisLayanan::ValidasiPph->value;

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'statistics' => DocumentController::getStatistics(),
            'document' => $isKuitansiSearch
                ? DocumentController::findPublicTrackingDocument($search, JenisLayanan::Kuitansi)
                : null,
            'search' => $isKuitansiSearch ? $search : null,
            'document_rl' => $isRisalahLelangSearch
                ? DocumentController::findPublicTrackingDocument($search, JenisLayanan::RisalahLelang)
                : null,
            'search_rl' => $isRisalahLelangSearch ? $search : null,
            'document_validasi' => $isValidasiPphSearch
                ? DocumentController::findPublicTrackingDocument($search, JenisLayanan::ValidasiPph)
                : null,
            'search_validasi' => $isValidasiPphSearch ? $search : null,
        ]);
    }
}
