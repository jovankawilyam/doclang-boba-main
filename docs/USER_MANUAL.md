# User Manual Doclang Boba

Dokumen ini menjelaskan cara menggunakan aplikasi Doclang Boba untuk pemohon, admin, dan super admin. Doclang Boba digunakan untuk pengajuan dan pelacakan dokumen pasca lelang KPKNL Bogor.

## 1. Ringkasan Aplikasi

Doclang Boba memiliki dua area utama:

1. Area publik
   - Melihat halaman utama.
   - Melihat persyaratan.
   - Mengisi formulir pengajuan.
   - Melacak status dokumen.

2. Area internal
   - Login petugas.
   - Melihat dashboard operasional.
   - Mengelola dokumen Kuitansi, Kutipan Risalah Lelang, dan Validasi PPh.
   - Mengubah status permohonan.
   - Melihat dan mengunduh berkas pemohon.
   - Mengirim atau mengulang notifikasi WhatsApp.
   - Mengelola akun admin, khusus super admin.

## 2. Hak Akses Pengguna

### Pemohon

Pemohon tidak perlu login. Pemohon dapat:

- Mengakses halaman utama.
- Mengisi formulir permohonan.
- Mengunggah dokumen pendukung.
- Menerima nomor pengajuan setelah permohonan terkirim.
- Melacak status dokumen menggunakan nomor pengajuan.

### Admin

Admin harus login. Admin dapat:

- Melihat dashboard.
- Mengakses menu Kuitansi, Kutipan RL, dan Validasi PPh.
- Mencari dan memfilter data permohonan.
- Melihat detail permohonan.
- Melihat pratinjau atau mengunduh berkas.
- Mengubah status permohonan.
- Menghapus permohonan.
- Mengirim WhatsApp untuk dokumen tidak valid.
- Mengulang pengiriman WhatsApp yang gagal.
- Melihat dan mengelola koneksi WhatsApp dari dashboard.

### Super Admin

Super admin memiliki semua akses admin, ditambah:

- Mengakses menu Manajemen Admin.
- Menambah akun admin atau super admin.
- Mengaktifkan dan menonaktifkan akun admin.
- Menghapus akun admin.

## 3. Area Publik

### 3.1 Membuka Halaman Utama

1. Buka alamat web Doclang Boba.
2. Pada navigasi atas, tersedia menu:
   - Lacak Dokumen
   - Formulir
   - Persyaratan
   - Standar Pelayanan
   - Tarif Layanan
   - Login

Jika pengguna sudah login, tombol Login akan berubah menjadi Dashboard.

### 3.2 Melacak Status Dokumen

1. Pada halaman utama, buka bagian Lacak Dokumen.
2. Pilih jenis layanan:
   - Kuitansi
   - Kutipan RL
   - Validasi PPh
3. Masukkan nomor tiket atau nomor pengajuan.
4. Tekan tombol Lacak Sekarang.
5. Sistem akan menampilkan hasil pencarian.

Status yang mungkin muncul:

- Dalam Proses: permohonan sedang diproses petugas.
- Siap Diambil: dokumen sudah siap diambil.
- Selesai: proses layanan sudah selesai.
- Tidak Valid: ada data atau berkas yang perlu diperbaiki. Jika ada catatan petugas, catatan akan tampil pada hasil pelacakan.

Jika nomor tidak ditemukan, sistem menampilkan pesan bahwa dokumen belum terdaftar pada layanan yang dipilih. Pastikan jenis layanan dan nomor pengajuan sudah sesuai.

### 3.3 Melihat Persyaratan

1. Klik menu Persyaratan.
2. Baca daftar persyaratan layanan.
3. Siapkan berkas sesuai layanan yang akan diajukan sebelum mengisi formulir.

### 3.4 Mengisi Formulir Permohonan

1. Klik menu Formulir.
2. Formulir terdiri dari dua tahap:
   - Slide 1: Informasi Dasar Pemohon.
   - Slide 2: Detail Permohonan Dinamis.
3. Isi data pada Slide 1:
   - Email pemohon.
   - Nama pemohon.
   - Jenis identitas pemohon: KTP, SIM, atau NPWP.
   - Nomor identitas pemohon.
   - Alamat pemohon.
   - Nomor WhatsApp pemohon.
   - Dokumen identitas pemohon.
4. Klik Next Slide.
5. Pilih tipe pemohon:
   - Pemenang Lelang.
   - Penerima Kuasa.
6. Jika memilih Penerima Kuasa, isi data pemberi kuasa:
   - Nama pemberi kuasa.
   - Jenis identitas pemberi kuasa.
   - Nomor identitas pemberi kuasa.
   - Nomor WhatsApp pemberi kuasa.
   - Alamat pemberi kuasa.
   - Dokumen identitas pemberi kuasa.
   - Surat kuasa.
7. Isi input bersama:
   - Kode lot lelang.
   - Jenis layanan.
   - Tanggal pelunasan pembayaran.
8. Isi atau unggah dokumen tambahan sesuai jenis layanan.
9. Klik Kirim.
10. Setelah berhasil, sistem menampilkan pesan sukses dan nomor pengajuan. Simpan nomor tersebut untuk pelacakan.

### 3.5 Aturan Upload Dokumen

Format file yang diterima:

- PDF
- JPG
- JPEG
- PNG

Ukuran maksimal setiap file adalah 10 MB.

Dokumen identitas pemohon wajib diunggah. Jika pemohon bertindak sebagai penerima kuasa, dokumen identitas pemberi kuasa dan surat kuasa juga wajib diunggah.

## 4. Login Petugas

1. Klik Login.
2. Masukkan email dan password.
3. Tekan tombol login.
4. Setelah berhasil, sistem membuka Dashboard.

Jika akun dinonaktifkan oleh super admin, pengguna tidak dapat menggunakan akses internal sampai akun diaktifkan kembali.

## 5. Dashboard Operasional

Dashboard menampilkan ringkasan kerja petugas:

- Total dokumen masuk.
- Jumlah dokumen masuk hari ini.
- Jumlah dokumen yang masih perlu tindak lanjut.
- Jumlah dokumen siap diambil.
- Jumlah dokumen selesai.
- Jumlah dokumen tidak valid.
- Ringkasan per layanan.
- Distribusi status.
- Enam aktivitas permohonan terbaru.
- Statistik admin aktif.
- Status koneksi WhatsApp.
- Jumlah notifikasi WhatsApp pending dan gagal.

Gunakan dashboard sebagai halaman awal untuk memantau kondisi layanan sebelum membuka menu dokumen.

## 6. Mengelola Koneksi WhatsApp

Panel Koneksi WhatsApp berada di Dashboard.

### 6.1 Melihat Status WhatsApp

Status yang mungkin muncul:

- Terhubung: gateway WhatsApp siap digunakan.
- Memeriksa koneksi: sistem sedang mengambil status.
- Menunggu QR WhatsApp: gateway aktif tetapi belum terhubung ke nomor WhatsApp.
- Gateway WhatsApp tidak dapat dihubungi: layanan WhatsApp gateway belum aktif atau tidak bisa diakses.

Panel juga menampilkan:

- Nomor WhatsApp yang terhubung, jika tersedia.
- Waktu terakhir terhubung.
- Jumlah notifikasi menunggu.
- Jumlah notifikasi gagal.

### 6.2 Menautkan WhatsApp dengan QR Code

1. Buka Dashboard.
2. Pada panel Koneksi WhatsApp, jika belum terhubung, klik Minta QR WhatsApp jika tombol tersedia.
3. Pilih metode QR Code.
4. Scan QR menggunakan aplikasi WhatsApp pada ponsel.
5. Tunggu sampai status berubah menjadi Terhubung.

### 6.3 Menautkan WhatsApp dengan Kode Telepon

1. Buka Dashboard.
2. Pada panel Koneksi WhatsApp, pilih metode kode telepon jika tersedia.
3. Masukkan nomor telepon WhatsApp.
4. Minta kode tautan.
5. Masukkan kode tersebut pada aplikasi WhatsApp sesuai instruksi WhatsApp.
6. Tunggu sampai status berubah menjadi Terhubung.

### 6.4 Mengganti Nomor WhatsApp

1. Pastikan Anda berada di Dashboard.
2. Pada panel Koneksi WhatsApp, klik Ganti Nomor WhatsApp.
3. Konfirmasi tindakan.
4. Sistem akan memutus nomor yang sedang terhubung dan menyiapkan QR atau kode tautan baru.
5. Tautkan nomor WhatsApp baru.

## 7. Menu Dokumen

Menu dokumen tersedia untuk admin dan super admin:

- Kuitansi
- Kutipan RL
- Validasi PPh

Ketiga menu memiliki pola penggunaan yang sama.

### 7.1 Melihat Daftar Permohonan

1. Login sebagai admin atau super admin.
2. Pilih salah satu menu dokumen.
3. Sistem menampilkan daftar permohonan dengan kolom:
   - No. Pengajuan.
   - Tanggal.
   - Nama Pemohon.
   - Jenis Permohonan.
   - Status.
   - Aksi.

### 7.2 Mencari Permohonan

1. Buka menu dokumen.
2. Masukkan kata kunci pada kolom Cari pengajuan.
3. Sistem dapat mencari berdasarkan:
   - Nomor pengajuan.
   - Kode lot lelang.
   - Nama pemohon.
   - Nomor WhatsApp pemohon.
   - Nomor dokumen.
4. Tekan Enter atau jalankan pencarian.

### 7.3 Memfilter Status

1. Buka menu dokumen.
2. Pilih filter status:
   - Semua
   - Proses
   - Siap Diambil
   - Selesai
   - Tidak Valid
3. Sistem menampilkan data sesuai status yang dipilih.

### 7.4 Menambah Data Manual

1. Buka menu dokumen.
2. Klik Tambah Data.
3. Isi Kode Lot / Referensi Dokumen.
4. Klik Simpan.
5. Sistem membuat data baru dengan status awal Proses.

Catatan: data manual menggunakan nama pemohon default Input Admin dan nomor WhatsApp default dari konfigurasi sistem.

### 7.5 Melihat Detail Permohonan

1. Pada daftar permohonan, klik tombol ikon mata.
2. Modal detail akan menampilkan:
   - Data pemohon.
   - Data pemberi kuasa, jika ada.
   - Detail layanan dan dokumen.
   - Tautan berkas.
   - Status proses.
   - Catatan tidak valid.
   - Riwayat WhatsApp.

### 7.6 Melihat atau Mengunduh Berkas

1. Buka detail permohonan.
2. Pada bagian Tautan Berkas, klik nama berkas.
3. Sistem menampilkan pratinjau berkas pada modal.
4. Jika browser mendukung, berkas dapat dibuka atau diunduh dari pratinjau tersebut.

Berkas yang mungkin tersedia:

- Identitas Pemohon.
- Identitas Kuasa.
- Surat Kuasa.
- Bukti Pelunasan.
- Bukti Validasi SSPD BPHTB.
- Kuitansi Pembayaran.
- Slip Setor PBB/BPHTB.
- Slip Setor PPh.
- NPWP Pemenang.

### 7.7 Mengubah Status Permohonan

1. Buka menu dokumen.
2. Pada kolom Status, pilih status baru.
3. Sistem menyimpan perubahan.

Jika memilih Tidak Valid:

1. Sistem meminta catatan tidak valid.
2. Isi alasan yang jelas, misalnya dokumen tidak terbaca atau berkas tidak sesuai.
3. Simpan status.
4. Catatan tersebut dapat tampil pada pelacakan publik dan dipakai untuk notifikasi WhatsApp.

### 7.8 Mengirim WhatsApp Tidak Valid

Tombol Kirim WhatsApp Tidak Valid hanya muncul jika:

- Status permohonan adalah Tidak Valid.
- Catatan tidak valid sudah diisi.

Langkah pengiriman:

1. Buka detail permohonan.
2. Klik Kirim WhatsApp Tidak Valid.
3. Konfirmasi pengiriman.
4. Sistem menjadwalkan notifikasi ke nomor pemohon dan, jika ada, nomor pemberi kuasa.

Jika masih ada notifikasi tidak valid dengan status pending, sistem mencegah pengiriman baru sampai proses sebelumnya selesai.

### 7.9 Mengulang WhatsApp yang Gagal

1. Buka detail permohonan.
2. Lihat bagian Riwayat WhatsApp.
3. Jika ada notifikasi berstatus Gagal, klik Kirim Ulang.
4. Konfirmasi pengiriman ulang.
5. Sistem menjadwalkan ulang notifikasi.

### 7.10 Menghapus Permohonan

1. Buka menu dokumen.
2. Klik tombol ikon hapus pada baris permohonan.
3. Konfirmasi penghapusan.
4. Sistem menghapus permohonan dari daftar.

Gunakan fitur hapus dengan hati-hati karena data yang dihapus tidak ditampilkan lagi pada dashboard.

## 8. Manajemen Admin

Menu Manajemen Admin hanya tampil untuk super admin.

### 8.1 Melihat Daftar Admin

1. Login sebagai super admin.
2. Buka menu Manajemen Admin.
3. Sistem menampilkan:
   - Total admin.
   - Total super admin.
   - Jumlah akun aktif.
   - Jumlah akun nonaktif.
   - Daftar akun admin.

### 8.2 Mencari dan Memfilter Admin

1. Gunakan kolom Cari nama atau email untuk mencari akun.
2. Gunakan filter status:
   - Semua Status
   - Aktif
   - Nonaktif

### 8.3 Menambah Admin

1. Buka Manajemen Admin.
2. Klik Tambah Admin.
3. Isi:
   - Nama lengkap.
   - Alamat email.
   - Role: Admin atau Super Admin.
   - Password.
   - Konfirmasi password.
4. Klik tombol simpan.
5. Sistem membuat akun baru dalam keadaan aktif.

### 8.4 Mengaktifkan atau Menonaktifkan Admin

1. Buka Manajemen Admin.
2. Cari akun admin.
3. Klik tombol aktif/nonaktif pada kolom aksi.
4. Sistem mengubah status akun.

Jika akun dinonaktifkan, sesi login akun tersebut akan dihapus.

Catatan: pengguna tidak dapat menonaktifkan akunnya sendiri.

### 8.5 Menghapus Admin

1. Buka Manajemen Admin.
2. Cari akun admin.
3. Klik tombol hapus.
4. Konfirmasi penghapusan.

Catatan:

- Pengguna tidak dapat menghapus akunnya sendiri.
- Jika akun masih memiliki data terkait, sistem dapat menolak penghapusan.

## 9. Arti Status Permohonan

| Status | Arti | Tindakan Umum |
| --- | --- | --- |
| Proses | Permohonan diterima dan sedang dikerjakan. | Petugas memeriksa data dan berkas. |
| Siap Diambil | Dokumen sudah siap diambil pemohon. | Pemohon dapat diarahkan untuk pengambilan dokumen. |
| Selesai | Layanan sudah selesai. | Tidak perlu tindak lanjut kecuali ada koreksi administrasi. |
| Tidak Valid | Data atau berkas belum memenuhi syarat. | Petugas wajib mengisi catatan dan dapat mengirim WhatsApp pemberitahuan. |

## 10. Troubleshooting Pengguna

### Nomor Pengajuan Tidak Ditemukan

Periksa hal berikut:

- Jenis layanan sudah benar.
- Nomor pengajuan tidak salah ketik.
- Data memang sudah masuk ke sistem.

### Formulir Tidak Bisa Dikirim

Periksa hal berikut:

- Semua field wajib sudah diisi.
- Format email benar.
- Nomor identitas pemohon berisi angka.
- Nomor WhatsApp menggunakan angka atau tanda yang diizinkan.
- File berformat PDF/JPG/JPEG/PNG.
- Ukuran file maksimal 10 MB.
- Jika memilih Penerima Kuasa, data dan dokumen kuasa sudah lengkap.

### WhatsApp Tidak Terkirim

Periksa hal berikut:

- Status koneksi WhatsApp di Dashboard sudah Terhubung.
- Tidak ada notifikasi yang masih pending untuk permohonan yang sama.
- Nomor WhatsApp pemohon benar.
- Jika riwayat menunjukkan Gagal, gunakan tombol Kirim Ulang.

### QR WhatsApp Tidak Muncul

Periksa hal berikut:

- Panel Koneksi WhatsApp tidak sedang memeriksa status.
- Klik Minta QR WhatsApp atau Ganti Nomor WhatsApp.
- Jika tetap tidak muncul, gateway WhatsApp kemungkinan perlu diperiksa oleh teknis.

## 11. Rekomendasi Operasional

- Simpan nomor pengajuan setiap kali pemohon berhasil mengirim formulir.
- Gunakan status Tidak Valid hanya jika catatan koreksi sudah jelas.
- Periksa Riwayat WhatsApp setelah mengirim notifikasi penting.
- Pastikan WhatsApp selalu Terhubung sebelum jam pelayanan.
- Gunakan filter status untuk memprioritaskan dokumen Proses dan Tidak Valid.
- Super admin sebaiknya menonaktifkan akun petugas yang sudah tidak bertugas.

## 12. Daftar Halaman Penting

| Halaman | Fungsi | Hak Akses |
| --- | --- | --- |
| `/` | Halaman utama dan tracking dokumen | Publik |
| `/persyaratan` | Informasi persyaratan | Publik |
| `/form` | Formulir permohonan | Publik |
| `/login` | Login petugas | Admin dan super admin |
| `/dashboard` | Dashboard operasional | Admin dan super admin |
| `/documents/kuitansi` | Kelola dokumen Kuitansi | Admin dan super admin |
| `/documents/rl` | Kelola dokumen Kutipan RL | Admin dan super admin |
| `/documents/validasi-pph` | Kelola dokumen Validasi PPh | Admin dan super admin |
| `/admin` | Manajemen akun admin | Super admin |

