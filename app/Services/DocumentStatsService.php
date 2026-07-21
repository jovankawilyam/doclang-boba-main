<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\JenisLayanan;
use App\Enums\PermohonanStatus;
use Illuminate\Support\Facades\DB;

class DocumentStatsService
{
    private const CATEGORY_MAP = [
        'kuitansi' => 'kuitansi',
        'risalah_lelang' => 'risalah_lelang',
        'validasi_pph' => 'validasi_pph',
    ];

    public function getStatistics(): array
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
            ->whereIn('jenis_layanan', array_values(self::CATEGORY_MAP))
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
}
