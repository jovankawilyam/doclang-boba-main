<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\JenisLayanan;
use App\Enums\PermohonanStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DoclangProses extends Model
{
    protected $table = 'doclang_proses';

    protected $fillable = [
        'kode_lot_lelang',
        'id_pengajuan',
        'tanggal_masuk_pengambilan_dokumen',
        'peran_pemohon',
        'email_pemohon',
        'jenis_identitas_pemohon',
        'nomor_identitas_pemohon',
        'alamat_pemohon',
        'nama_pemohon',
        'nomor_wa_pemohon',
        'nama_pemberi_kuasa',
        'jenis_identitas_pemberi_kuasa',
        'nomor_identitas_pemberi_kuasa',
        'alamat_pemberi_kuasa',
        'nomor_wa_pemberi_kuasa',
        'jenis_layanan',
        'tanggal_pelunasan',
        'jenis_objek_risalah',
        'bukti_validasi_sspd_bphtb_path',
        'kuitansi_pembayaran_harga_lelang_path',
        'nomor_kuitansi_pembayaran_harga_lelang',
        'nomor_objek_pajak',
        'slip_setor_pbb_atau_bphtb_path',
        'alamat_objek_lelang',
        'ntpn',
        'slip_setor_pph_path',
        'npwp_pemenang_lelang',
        'npwp_pemenang_lelang_path',
        'nomor_dokumen',
        'tanggal_dokumen',
        'dokumen_identitas_pemohon_path',
        'dokumen_identitas_pemberi_kuasa_path',
        'surat_kuasa_path',
        'bukti_pelunasan_path',
        'status_proses',
        'catatan_tidak_valid',
        'invalid_whatsapp_sent_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_masuk_pengambilan_dokumen' => 'date',
            'tanggal_pelunasan' => 'date',
            'tanggal_dokumen' => 'date',
            'jenis_layanan' => JenisLayanan::class,
            'status_proses' => PermohonanStatus::class,
            'invalid_whatsapp_sent_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (DoclangProses $permohonan): void {
            $permohonan->tanggal_masuk_pengambilan_dokumen ??= now()->toDateString();
        });
    }

    public function whatsappNotifications(): HasMany
    {
        return $this->hasMany(WhatsAppNotification::class, 'doclang_proses_id');
    }
}
