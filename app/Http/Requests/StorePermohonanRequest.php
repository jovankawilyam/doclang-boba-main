<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\JenisLayanan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePermohonanRequest extends FormRequest
{
    private const DOKUMEN_RULES = ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'jenis_layanan' => JenisLayanan::fromInput((string) $this->input('jenis_layanan')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'peran_pemohon' => ['required', Rule::in(['pemenang', 'kuasa'])],
            'email_pemohon' => ['required', 'email', 'max:255'],
            'jenis_identitas_pemohon' => ['required', Rule::in(['KTP', 'SIM', 'NPWP'])],
            'nomor_identitas_pemohon' => ['required', 'string', 'max:255', 'regex:/^[0-9]+$/'],
            'alamat_pemohon' => ['required', 'string', 'max:5000'],
            'nama_pemohon' => ['required', 'string', 'max:255'],
            'nomor_wa_pemohon' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'nama_pemberi_kuasa' => [
                Rule::requiredIf($this->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:255',
            ],
            'jenis_identitas_pemberi_kuasa' => [
                Rule::requiredIf($this->input('peran_pemohon') === 'kuasa'),
                'nullable',
                Rule::in(['KTP', 'SIM', 'Akta Pendirian']),
            ],
            'nomor_identitas_pemberi_kuasa' => [
                Rule::requiredIf($this->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:255',
            ],
            'alamat_pemberi_kuasa' => [
                Rule::requiredIf($this->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:5000',
            ],
            'nomor_wa_pemberi_kuasa' => [
                Rule::requiredIf($this->input('peran_pemohon') === 'kuasa'),
                'nullable',
                'string',
                'max:30',
                'regex:/^[0-9+\-\s()]+$/',
            ],
            'kode_lot_lelang' => ['required', 'string', 'max:255'],
            'tanggal_masuk_pengambilan_dokumen' => ['nullable', 'date'],
            'jenis_layanan' => ['required', Rule::enum(JenisLayanan::class)],
            'tanggal_pelunasan' => ['required', 'date'],
            'jenis_objek_risalah' => ['nullable', Rule::in(['tanah_bangunan', 'kendaraan'])],
            'nomor_kuitansi_pembayaran_harga_lelang' => ['nullable', 'string', 'max:255'],
            'nomor_objek_pajak' => ['nullable', 'string', 'max:255'],
            'alamat_objek_lelang' => ['nullable', 'string', 'max:5000'],
            'ntpn' => ['nullable', 'string', 'max:255'],
            'npwp_pemenang_lelang' => ['nullable', 'string', 'max:255', 'regex:/^[0-9]+$/'],
            'nomor_dokumen' => ['nullable', 'string', 'max:255'],
            'tanggal_dokumen' => ['nullable', 'date'],
            'dokumen_identitas_pemohon' => ['required', ...self::DOKUMEN_RULES],
            'bukti_pelunasan' => [...self::DOKUMEN_RULES],
            'bukti_validasi_sspd_bphtb' => [...self::DOKUMEN_RULES],
            'kuitansi_pembayaran_harga_lelang' => [...self::DOKUMEN_RULES],
            'slip_setor_pbb_atau_bphtb' => [...self::DOKUMEN_RULES],
            'slip_setor_pph' => [...self::DOKUMEN_RULES],
            'npwp_pemenang_lelang_file' => [...self::DOKUMEN_RULES],
            'dokumen_identitas_pemberi_kuasa' => [
                Rule::requiredIf($this->input('peran_pemohon') === 'kuasa'),
                ...self::DOKUMEN_RULES,
            ],
            'surat_kuasa' => [
                Rule::requiredIf($this->input('peran_pemohon') === 'kuasa'),
                ...self::DOKUMEN_RULES,
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nomor_identitas_pemohon.regex' => 'Nomor Identitas Pemohon wajib berisi angka saja.',
            'nomor_wa_pemohon.regex' => 'Nomor WhatsApp hanya boleh berisi angka dan tanda +.',
            'npwp_pemenang_lelang.regex' => 'NPWP Pemenang Lelang wajib berisi angka saja.',
            'dokumen_identitas_pemohon.required' => 'Dokumen identitas pemohon wajib diunggah.',
            'dokumen_identitas_pemohon.mimes' => 'Dokumen identitas pemohon harus berupa PDF, JPG, JPEG, atau PNG.',
            'dokumen_identitas_pemohon.max' => 'Ukuran dokumen identitas pemohon maksimal 10 MB.',
            'bukti_pelunasan.mimes' => 'Bukti pelunasan harus berupa PDF atau gambar.',
            'bukti_pelunasan.max' => 'Ukuran bukti pelunasan maksimal 10 MB.',
            'dokumen_identitas_pemberi_kuasa.required' => 'Dokumen identitas pemberi kuasa wajib diunggah.',
            'dokumen_identitas_pemberi_kuasa.mimes' => 'Dokumen identitas pemberi kuasa harus berupa PDF, JPG, JPEG, atau PNG.',
            'dokumen_identitas_pemberi_kuasa.max' => 'Ukuran dokumen identitas pemberi kuasa maksimal 10 MB.',
            'surat_kuasa.required' => 'Surat kuasa wajib diunggah.',
            'surat_kuasa.mimes' => 'Surat kuasa harus berupa PDF, JPG, JPEG, atau PNG.',
            'surat_kuasa.max' => 'Ukuran surat kuasa maksimal 10 MB.',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function sanitized(): array
    {
        $data = $this->validated();

        foreach ($this->htmlFreeFields() as $field) {
            if (array_key_exists($field, $data) && is_string($data[$field])) {
                $data[$field] = strip_tags($data[$field]);
            }
        }

        return $data;
    }

    /**
     * @return list<string>
     */
    private function htmlFreeFields(): array
    {
        return [
            'kode_lot_lelang',
            'nomor_identitas_pemohon',
            'alamat_pemohon',
            'nama_pemohon',
            'nama_pemberi_kuasa',
            'nomor_identitas_pemberi_kuasa',
            'alamat_pemberi_kuasa',
            'nomor_kuitansi_pembayaran_harga_lelang',
            'nomor_objek_pajak',
            'alamat_objek_lelang',
            'ntpn',
            'npwp_pemenang_lelang',
            'nomor_dokumen',
        ];
    }
}
