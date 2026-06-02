<?php

declare(strict_types=1);

namespace App\Enums;

enum PermohonanStatus: string
{
    case Proses = 'proses';
    case SiapDiambil = 'siap_diambil';
    case Selesai = 'selesai';
    case TidakValid = 'tidak_valid';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            fn (self $status): string => $status->value,
            self::cases(),
        );
    }
}
