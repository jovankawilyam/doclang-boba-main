<?php

declare(strict_types=1);

namespace App\Enums;

enum JenisLayanan: string
{
    case Kuitansi = 'kuitansi';
    case RisalahLelang = 'risalah_lelang';
    case ValidasiPph = 'validasi_pph';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            fn (self $jenisLayanan): string => $jenisLayanan->value,
            self::cases(),
        );
    }

    public static function fromInput(string $jenisLayanan): string
    {
        if (self::tryFrom($jenisLayanan) instanceof self) {
            return $jenisLayanan;
        }

        if (str_contains($jenisLayanan, 'Kuitansi')) {
            return self::Kuitansi->value;
        }

        if (str_contains($jenisLayanan, 'Kutipan Risalah Lelang')) {
            return self::RisalahLelang->value;
        }

        if (str_contains($jenisLayanan, 'Validasi PPh')) {
            return self::ValidasiPph->value;
        }

        return $jenisLayanan;
    }

    public function label(): string
    {
        return match ($this) {
            self::Kuitansi => 'Pemberian Kuitansi Pembayaran',
            self::RisalahLelang => 'Pemberian Kutipan Risalah Lelang',
            self::ValidasiPph => 'Validasi PPh',
        };
    }

    public function ticketSuffix(): string
    {
        return match ($this) {
            self::RisalahLelang => 'K-RL',
            self::ValidasiPph => 'V-PPh',
            self::Kuitansi => 'KPHL',
        };
    }
}
