<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoclangProses extends Model
{
    protected $table = 'doclang_proses';

    protected $fillable = [
        'kode_lot_lelang',
        'id_pengajuan',
        'tanggal_masuk_pengambilan_dokumen',
        'peran_pemohon',
        'nama_pemohon',
        'nomor_wa_pemohon',
        'jenis_layanan',
        'nomor_dokumen',
        'tanggal_dokumen',
        'dokumen_identitas_pemohon_path',
        'dokumen_identitas_pemberi_kuasa_path',
        'surat_kuasa_path',
        'bukti_pelunasan_path',
        'status_proses',
        'catatan_tidak_valid',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_masuk_pengambilan_dokumen' => 'date',
            'tanggal_dokumen' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (DoclangProses $permohonan): void {
            $permohonan->tanggal_masuk_pengambilan_dokumen ??= now()->toDateString();
        });
    }
}
