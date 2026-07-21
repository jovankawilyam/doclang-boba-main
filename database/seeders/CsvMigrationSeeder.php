<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\DoclangProses;
use Illuminate\Database\Seeder;

class CsvMigrationSeeder extends Seeder
{
    private const CSV_DIR = __DIR__.'/csv';

    private const FILES = [
        'kuitansi' => 'kuitansi.csv',
        'validasi_pph' => 'validasi_PPh.csv',
        'risalah_lelang' => 'kutipan RL.csv',
    ];

    private const STATUS_MAP = [
        'Selesai' => 'selesai',
        'Dalam Proses' => 'proses',
        'Siap Diambil' => 'siap_diambil',
        'Ditolak' => 'tidak_valid',
        'Perbaikan' => 'proses',
        'Tidak Valid' => 'tidak_valid',
        'Valid' => 'selesai',
    ];

    private const INDONESIAN_MONTHS = [
        'Januari' => 1, 'Februari' => 2, 'Maret' => 3, 'April' => 4,
        'Mei' => 5, 'Juni' => 6, 'Juli' => 7, 'Agustus' => 8,
        'September' => 9, 'Oktober' => 10, 'November' => 11, 'Desember' => 12,
    ];

    public function run(): void
    {
        foreach (self::FILES as $service => $filename) {
            $path = self::CSV_DIR.'/'.$filename;
            if (! file_exists($path)) {
                $this->command?->warn("CSV tidak ditemukan: {$filename}");

                continue;
            }

            $count = $this->importCsv($path, $service);
            $this->command?->info("{$filename}: {$count} record diimport.");
        }
    }

    private function importCsv(string $path, string $service): int
    {
        $handle = fopen($path, 'r');
        if (! $handle) {
            throw new \RuntimeException("Gagal membuka file: {$path}");
        }

        $headers = fgetcsv($handle);
        if ($headers === false || $headers === null) {
            fclose($handle);

            return 0;
        }

        $headers = array_map('trim', $headers);
        $headerIndex = array_flip($headers);

        $imported = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $data = $this->mapRow($row, $headerIndex, $headers, $service);
            if ($data === null) {
                continue;
            }

            DoclangProses::firstOrCreate(
                ['id_pengajuan' => $data['id_pengajuan']],
                $data,
            );

            $imported++;
        }

        fclose($handle);

        return $imported;
    }

    /**
     * @param  array<int, string>  $row
     * @param  array<string, int>  $headerIndex
     * @param  list<string>  $headers
     * @return array<string, mixed>|null
     */
    private function mapRow(array $row, array $headerIndex, array $headers, string $service): ?array
    {
        $get = fn (string $col): ?string => isset($headerIndex[$col])
            ? trim($row[$headerIndex[$col]] ?? '')
            : null;

        $idPengajuan = $get('ID KPHL') ?? $get('ID VPPh') ?? $get('ID K-RL');
        if ($idPengajuan === null || $idPengajuan === '') {
            return null;
        }

        $data = [
            'id_pengajuan' => $idPengajuan,
            'jenis_layanan' => $service,
            'kode_lot_lelang' => $get('Kode Lot Lelang') ?? '',
            'nama_pemohon' => $get('Nama Pemohon') ?? '',
            'nomor_wa_pemohon' => $this->cleanPhone($get('Nomor Whatsapp Pemohon')),
            'email_pemohon' => $get('Email Address'),
            'nomor_identitas_pemohon' => $get('Nomor Identitas Pemohon'),
            'alamat_pemohon' => $get('Alamat Pemohon'),
            'jenis_identitas_pemohon' => $this->mapIdentityType(
                $get('Jenis Identitas Pemohon') ?? $get('Jenis Dokumen ID Pemohon'),
            ),
            'peran_pemohon' => $this->mapPeran($get('Jenis Pemohon')),
            'nama_pemberi_kuasa' => $get('Nama Pemberi Kuasa'),
            'jenis_identitas_pemberi_kuasa' => $this->mapIdentityType($get('Jenis Identitas Pemberi Kuasa')),
            'nomor_identitas_pemberi_kuasa' => $get('Nomor Identitas Pemberi Kuasa'),
            'alamat_pemberi_kuasa' => $get('Alamat Pemberi Kuasa'),
            'nomor_wa_pemberi_kuasa' => $this->cleanPhone($get('Nomor Whatsapp Pemberi Kuasa')),
            'tanggal_masuk_pengambilan_dokumen' => $this->parseDate($get('Tgl Permintaan')),
            'status_proses' => $this->mapStatus($get('Status Proses'), $get('Status Permohonan')),
            'catatan_tidak_valid' => $get('Keterangan Ditolak'),
        ];

        $this->applyServiceSpecificFields($data, $get, $service);

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function applyServiceSpecificFields(array &$data, \Closure $get, string $service): void
    {
        match ($service) {
            'kuitansi' => $this->applyKuitansiFields($data, $get),
            'validasi_pph' => $this->applyValidasiPphFields($data, $get),
            'risalah_lelang' => $this->applyRisalahLelangFields($data, $get),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function applyKuitansiFields(array &$data, \Closure $get): void
    {
        $data['tanggal_pelunasan'] = $this->parseIndonesianDate($get('Tanggal Pelunasan Pembayaran'));
        $data['nomor_dokumen'] = $get('Nomor Kuitansi');
        $data['tanggal_dokumen'] = $this->parseDate($get('Tanggal Kuitansi'));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function applyValidasiPphFields(array &$data, \Closure $get): void
    {
        $data['nomor_kuitansi_pembayaran_harga_lelang'] = $get('Nomor Kuitansi Pembayaran Harga Lelang');
        $data['npwp_pemenang_lelang'] = $get('NPWP Pemenang Lelang');
        $data['ntpn'] = $get('NTPN');
        $data['nomor_objek_pajak'] = $get('NOP');
        $data['alamat_objek_lelang'] = $get('Alamat Objek Lelang');
        $data['nomor_dokumen'] = $get('Nomor Validasi');
        $data['tanggal_dokumen'] = $this->parseDate($get('Tanggal Validasi'));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function applyRisalahLelangFields(array &$data, \Closure $get): void
    {
        $data['jenis_objek_risalah'] = $this->mapObjekRisalah($get('Objek Lelang'));
        $data['nomor_dokumen'] = $get('Nomor Kutipan');
        $data['tanggal_dokumen'] = $this->parseDate($get('Tanggal Kutipan'));
    }

    private function mapStatus(?string $statusProses, ?string $statusPermohonan): string
    {
        $status = $statusProses ?? $statusPermohonan;
        if ($status === null || $status === '') {
            return 'proses';
        }

        $normalized = trim((string) $status);

        return self::STATUS_MAP[$normalized] ?? 'proses';
    }

    private function mapPeran(?string $value): string
    {
        return match (trim((string) $value)) {
            'Penerima Kuasa' => 'penerima_kuasa',
            default => 'pemenang',
        };
    }

    private function mapIdentityType(?string $value): ?string
    {
        $normalized = strtoupper(trim((string) $value));

        return match (true) {
            str_contains($normalized, 'KTP') => 'KTP',
            str_contains($normalized, 'SIM') => 'SIM',
            str_contains($normalized, 'NPWP') => 'NPWP',
            default => $value ?: null,
        };
    }

    private function mapObjekRisalah(?string $value): ?string
    {
        $normalized = trim((string) $value);

        return match (true) {
            str_contains($normalized, 'Tanah') => 'tanah_bangunan',
            str_contains($normalized, 'Bangunan') => 'tanah_bangunan',
            str_contains($normalized, 'Kendaraan') => 'kendaraan',
            default => $value ?: null,
        };
    }

    private function parseDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = trim(explode(' ', $value)[0]);

        $parts = explode('/', $value);
        if (count($parts) === 3) {
            return "{$parts[2]}-{$parts[1]}-{$parts[0]}";
        }

        return null;
    }

    private function parseIndonesianDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        foreach (self::INDONESIAN_MONTHS as $monthName => $monthNumber) {
            if (str_contains($value, $monthName)) {
                $parts = explode(' ', $value);
                $day = $parts[0] ?? '';
                $year = $parts[2] ?? '';

                if ($day !== '' && $year !== '') {
                    return sprintf('%04d-%02d-%02d', (int) $year, $monthNumber, (int) $day);
                }
            }
        }

        return $this->parseDate($value);
    }

    private function cleanPhone(?string $value): string
    {
        if ($value === null || trim($value) === '') {
            return '';
        }

        $cleaned = preg_replace('/[^0-9]/', '', $value);

        return $cleaned !== '' ? $cleaned : '';
    }
}
