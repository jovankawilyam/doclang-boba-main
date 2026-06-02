<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Requests\StorePermohonanRequest;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PermohonanFileStorage
{
    private const DISK = 'local';

    private const FILES = [
        'bukti_pelunasan' => [
            'column' => 'bukti_pelunasan_path',
            'directory' => 'doclang/bukti-pelunasan',
        ],
        'bukti_validasi_sspd_bphtb' => [
            'column' => 'bukti_validasi_sspd_bphtb_path',
            'directory' => 'doclang/bukti-validasi-sspd-bphtb',
        ],
        'kuitansi_pembayaran_harga_lelang' => [
            'column' => 'kuitansi_pembayaran_harga_lelang_path',
            'directory' => 'doclang/kuitansi-pembayaran-harga-lelang',
        ],
        'slip_setor_pbb_atau_bphtb' => [
            'column' => 'slip_setor_pbb_atau_bphtb_path',
            'directory' => 'doclang/slip-setor-pbb-atau-bphtb',
        ],
        'slip_setor_pph' => [
            'column' => 'slip_setor_pph_path',
            'directory' => 'doclang/slip-setor-pph',
        ],
        'npwp_pemenang_lelang_file' => [
            'column' => 'npwp_pemenang_lelang_path',
            'directory' => 'doclang/npwp-pemenang-lelang',
        ],
        'dokumen_identitas_pemohon' => [
            'column' => 'dokumen_identitas_pemohon_path',
            'directory' => 'doclang/identitas-pemohon',
        ],
        'dokumen_identitas_pemberi_kuasa' => [
            'column' => 'dokumen_identitas_pemberi_kuasa_path',
            'directory' => 'doclang/identitas-pemberi-kuasa',
        ],
        'surat_kuasa' => [
            'column' => 'surat_kuasa_path',
            'directory' => 'doclang/surat-kuasa',
        ],
    ];

    /**
     * @return array<string, string|null>
     */
    public function store(StorePermohonanRequest $request): array
    {
        $paths = [];

        try {
            foreach (self::FILES as $field => $config) {
                $paths[$config['column']] = $request->file($field)?->store($config['directory'], self::DISK);
            }

            return $paths;
        } catch (Throwable $exception) {
            $this->deleteStoredPaths($paths);

            throw $exception;
        }
    }

    /**
     * @param  array<string, string|null>  $paths
     */
    public function deleteStoredPaths(array $paths): void
    {
        foreach ($paths as $path) {
            if (is_string($path) && $path !== '') {
                Storage::disk(self::DISK)->delete($path);
            }
        }
    }
}
