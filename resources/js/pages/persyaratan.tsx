{/* isi halaman ini dengan persayatan sebagai berikut.
     
1. Syarat Layanan Pemberian Kuitansi Pembayaran Harga Lelang
- Fotokopi KTP
- Surat Kuasa (jika dikuasakan)
- Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*
- Bukti Pelunasan
*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum 

2. Syarat Layanan Pemberian Kutipan Risalah Lelang
Fotokopi KTP -
Surat Kuasa (jika dikuasakan) -
Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)* -
Kuitansi Pembayaran Harga Lelang -
Asli Bukti Validasi SSPD BPHTB yang telah disetujui* -
Meterai sebanyak 2 buah -
*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum
* Validasi BPHTB untuk objek lelang berupa tanah dan/atau bangunan
hardcopy dokumen persyaratan tersebut harap dilampirkan pada saat pengambilan

3. Syarat Layanan Validasi PPh (1 bidang) 
- Fotokopi KTP
- Surat Kuasa (jika dikuasakan)
- Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*
- Kuitansi Pembayaran Harga Lelang
- Slip setor PPh
- Slip setor PBB atau berkas BPHTB yang menunjukkan NOP dan luas Tanah/Bangunan     yang tepat
- Bukti Pelunasan
*KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum
Catatan: layanan validasi PPh penyelesaiannya menunggu hasil proses konfirmasi dengan Kantor Pelayanan Pajak */}
import React from 'react';

const Persyaratan: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Persyaratan Layanan</h1>

            <section className="mb-8">  
                <h2 className="text-2xl font-semibold mb-4">1. Syarat Layanan Pemberian Kuitansi Pembayaran Harga Lelang</h2>
                <ul className="list-disc list-inside">
                    <li>Fotokopi KTP</li>
                    <li>Surat Kuasa (jika dikuasakan)</li>
                    <li>Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*</li>
                    <li>Bukti Pelunasan</li>
                </ul>
                <p className="mt-2 italic">
                    *KTP untuk perorangan atau akta pendirian perusahaan untuk Badan Usaha/Badan Hukum
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Syarat Layanan Pemberian Kutipan Risalah Lelang</h2>
                <ul className="list-disc list-inside">
                    <li>Fotokopi KTP</li>
                    <li>Surat Kuasa (jika dikuasakan)</li>
                    <li>Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*</li>
                    <li>Kuitansi Pembayaran Harga Lelang</li>
                    <li>Asli Bukti Validasi SSPD BPHTB yang telah disetujui*</li>
                    <li>Meterai sebanyak 2 buah</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">3. Syarat Layanan Validasi PPh (1 bidang)</h2>
                <ul className="list-disc list-inside">
                    <li>Fotokopi KTP</li>
                    <li>Surat Kuasa (jika dikuasakan)</li>
                    <li>Fotokopi Dokumen Identitas Pemberi Kuasa (jika dikuasakan)*</li>
                    <li>Kuitansi Pembayaran Harga Lelang</li>
                    <li>Slip setor PPh</li>
                    <li>Slip setor PBB atau berkas BPHTB</li>
                    <li>Bukti Pelunasan</li>
                </ul>
            </section>
        </div>
    );
}

export default Persyaratan;