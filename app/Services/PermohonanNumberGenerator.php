<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\JenisLayanan;
use App\Models\DoclangProses;

class PermohonanNumberGenerator
{
    public function generate(JenisLayanan $jenisLayanan): string
    {
        $suffix = $jenisLayanan->ticketSuffix();
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
