<?php

use App\Jobs\SendWhatsAppNotification;
use App\Models\DoclangProses;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('public users can submit a doclang request and queue whatsapp notification', function () {
    Queue::fake();
    Storage::fake('local');

    $response = $this->post(route('permohonan.store'), [
        'peran_pemohon' => 'pemenang',
        'email_pemohon' => 'budi@example.test',
        'jenis_identitas_pemohon' => 'KTP',
        'nomor_identitas_pemohon' => '3271000000000001',
        'alamat_pemohon' => 'Bogor',
        'nama_pemohon' => 'Budi Santoso',
        'nomor_wa_pemohon' => '081234567890',
        'kode_lot_lelang' => 'BGR-LOT-001',
        'jenis_layanan' => 'validasi_pph',
        'tanggal_pelunasan' => '2026-05-18',
        'dokumen_identitas_pemohon' => UploadedFile::fake()->create('ktp.pdf', 512, 'application/pdf'),
        'bukti_pelunasan' => UploadedFile::fake()->image('pph.png'),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $permohonan = DoclangProses::firstOrFail();

    expect($permohonan->id_pengajuan)->toEndWith('/V-PPh/2026');
    expect($permohonan->peran_pemohon)->toBe('pemenang');
    expect($permohonan->email_pemohon)->toBe('budi@example.test');
    expect($permohonan->nomor_identitas_pemohon)->toBe('3271000000000001');
    expect($permohonan->alamat_pemohon)->toBe('Bogor');
    expect($permohonan->tanggal_pelunasan->toDateString())->toBe('2026-05-18');
    expect($permohonan->status_proses)->toBe('proses');

    Storage::disk('local')->assertExists($permohonan->dokumen_identitas_pemohon_path);
    Storage::disk('local')->assertExists($permohonan->bukti_pelunasan_path);
    Queue::assertPushed(SendWhatsAppNotification::class);
});

test('public users with representative phone can queue whatsapp notification to both numbers', function () {
    Queue::fake();
    Storage::fake('local');

    $response = $this->post(route('permohonan.store'), [
        'peran_pemohon' => 'kuasa',
        'email_pemohon' => 'kuasa@example.test',
        'jenis_identitas_pemohon' => 'KTP',
        'nomor_identitas_pemohon' => '3271000000000003',
        'alamat_pemohon' => 'Bogor',
        'nama_pemohon' => 'Andi Kuasa',
        'nomor_wa_pemohon' => '081234567892',
        'nama_pemberi_kuasa' => 'Rudi Pemenang',
        'jenis_identitas_pemberi_kuasa' => 'KTP',
        'nomor_identitas_pemberi_kuasa' => '3271000000000004',
        'alamat_pemberi_kuasa' => 'Bogor',
        'nomor_wa_pemberi_kuasa' => '081234567893',
        'kode_lot_lelang' => 'BGR-LOT-011',
        'jenis_layanan' => 'kuitansi',
        'tanggal_pelunasan' => '2026-05-18',
        'dokumen_identitas_pemohon' => UploadedFile::fake()->create('ktp-kuasa.pdf', 512, 'application/pdf'),
        'dokumen_identitas_pemberi_kuasa' => UploadedFile::fake()->create('ktp-pemberi-kuasa.pdf', 512, 'application/pdf'),
        'surat_kuasa' => UploadedFile::fake()->create('surat-kuasa.pdf', 512, 'application/pdf'),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    Queue::assertPushed(SendWhatsAppNotification::class, 2);
});

test('public users can submit a doclang request as json form data for fetch clients', function () {
    Queue::fake();
    Storage::fake('local');

    $response = $this->post(route('permohonan.store'), [
        'peran_pemohon' => 'pemenang',
        'email_pemohon' => 'dina@example.test',
        'jenis_identitas_pemohon' => 'KTP',
        'nomor_identitas_pemohon' => '3271000000000002',
        'alamat_pemohon' => 'Bogor',
        'nama_pemohon' => 'Dina Pratiwi',
        'nomor_wa_pemohon' => '081234567891',
        'kode_lot_lelang' => 'BGR-LOT-010',
        'jenis_layanan' => 'kuitansi',
        'tanggal_pelunasan' => '2026-05-18',
        'dokumen_identitas_pemohon' => UploadedFile::fake()->create('ktp.pdf', 512, 'application/pdf'),
    ], [
        'Accept' => 'application/json',
        'X-Requested-With' => 'XMLHttpRequest',
    ]);

    $response
        ->assertOk()
        ->assertJsonStructure(['message', 'id_pengajuan']);

    $permohonan = DoclangProses::firstOrFail();

    expect($permohonan->dokumen_identitas_pemohon_path)->not->toBeNull();
    Storage::disk('local')->assertExists($permohonan->dokumen_identitas_pemohon_path);
});

test('public request rejects identity document larger than ten megabytes', function () {
    Storage::fake('local');

    $response = $this->post(route('permohonan.store'), [
        'peran_pemohon' => 'pemenang',
        'email_pemohon' => 'budi@example.test',
        'jenis_identitas_pemohon' => 'KTP',
        'nomor_identitas_pemohon' => '3271000000000001',
        'alamat_pemohon' => 'Bogor',
        'nama_pemohon' => 'Budi Santoso',
        'nomor_wa_pemohon' => '081234567890',
        'kode_lot_lelang' => 'BGR-LOT-001',
        'jenis_layanan' => 'kuitansi',
        'tanggal_pelunasan' => '2026-05-18',
        'dokumen_identitas_pemohon' => UploadedFile::fake()->create('ktp.pdf', 10241, 'application/pdf'),
    ]);

    $response->assertSessionHasErrors('dokumen_identitas_pemohon');
});

test('admin rejection requires reason without automatically queueing whatsapp notification', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-002',
        'id_pengajuan' => '0001/KPHL/2026',
        'nama_pemohon' => 'Siti Aminah',
        'nomor_wa_pemohon' => '081911111111',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'proses',
    ]);

    $this->actingAs($admin)
        ->patch(route('permohonan.update', $permohonan), [
            'status_proses' => 'tidak_valid',
        ])
        ->assertSessionHasErrors('catatan_tidak_valid');

    $this->actingAs($admin)
        ->patch(route('permohonan.update', $permohonan), [
            'status_proses' => 'tidak_valid',
            'catatan_tidak_valid' => 'Bukti pelunasan belum terbaca jelas.',
        ])
        ->assertRedirect();

    $permohonan->refresh();

    expect($permohonan->status_proses)->toBe('tidak_valid');
    expect($permohonan->catatan_tidak_valid)->toBe('Bukti pelunasan belum terbaca jelas.');

    Queue::assertNotPushed(SendWhatsAppNotification::class);
});

test('admin can manually send invalid whatsapp notification after rejection', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-002',
        'id_pengajuan' => '0001/KPHL/2026',
        'nama_pemohon' => 'Siti Aminah',
        'nomor_wa_pemohon' => '081911111111',
        'nomor_wa_pemberi_kuasa' => '081922222222',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'tidak_valid',
        'catatan_tidak_valid' => 'Bukti pelunasan belum terbaca jelas.',
    ]);

    $this->actingAs($admin)
        ->post(route('permohonan.send-invalid-notification', $permohonan))
        ->assertRedirect()
        ->assertSessionHas('success');

    $permohonan->refresh();

    expect($permohonan->invalid_whatsapp_sent_at)->not->toBeNull();

    Queue::assertPushed(SendWhatsAppNotification::class, 2);
});

test('admin cannot resend invalid whatsapp notification before twenty four hours', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-002',
        'id_pengajuan' => '0001/KPHL/2026',
        'nama_pemohon' => 'Siti Aminah',
        'nomor_wa_pemohon' => '081911111111',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'tidak_valid',
        'catatan_tidak_valid' => 'Bukti pelunasan belum terbaca jelas.',
        'invalid_whatsapp_sent_at' => now()->subHours(23),
    ]);

    $this->actingAs($admin)
        ->post(route('permohonan.send-invalid-notification', $permohonan))
        ->assertRedirect()
        ->assertSessionHas('error');

    Queue::assertNotPushed(SendWhatsAppNotification::class);
});

test('admin can resend invalid whatsapp notification after twenty four hours', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-002',
        'id_pengajuan' => '0001/KPHL/2026',
        'nama_pemohon' => 'Siti Aminah',
        'nomor_wa_pemohon' => '081911111111',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'tidak_valid',
        'catatan_tidak_valid' => 'Bukti pelunasan belum terbaca jelas.',
        'invalid_whatsapp_sent_at' => now()->subHours(24)->subMinute(),
    ]);

    $this->actingAs($admin)
        ->post(route('permohonan.send-invalid-notification', $permohonan))
        ->assertRedirect()
        ->assertSessionHas('success');

    Queue::assertPushed(SendWhatsAppNotification::class);
});

test('admin cannot send invalid whatsapp notification before request is rejected', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-002',
        'id_pengajuan' => '0001/KPHL/2026',
        'nama_pemohon' => 'Siti Aminah',
        'nomor_wa_pemohon' => '081911111111',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'proses',
    ]);

    $this->actingAs($admin)
        ->post(route('permohonan.send-invalid-notification', $permohonan))
        ->assertRedirect()
        ->assertSessionHas('error');

    Queue::assertNotPushed(SendWhatsAppNotification::class);
});

test('admin cannot send invalid whatsapp notification without rejection reason', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-002',
        'id_pengajuan' => '0001/KPHL/2026',
        'nama_pemohon' => 'Siti Aminah',
        'nomor_wa_pemohon' => '081911111111',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'tidak_valid',
    ]);

    $this->actingAs($admin)
        ->post(route('permohonan.send-invalid-notification', $permohonan))
        ->assertRedirect()
        ->assertSessionHas('error');

    Queue::assertNotPushed(SendWhatsAppNotification::class);
});

test('document dashboard reads unified doclang process data by service', function () {
    $admin = User::factory()->create();

    DoclangProses::create([
        'kode_lot_lelang' => 'BGR-KWT-001',
        'id_pengajuan' => '0002/KPHL/2026',
        'nama_pemohon' => 'Agus Rahman',
        'nomor_wa_pemohon' => '081922222222',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'proses',
    ]);

    DoclangProses::create([
        'kode_lot_lelang' => 'BGR-RL-001',
        'id_pengajuan' => '0003/K-RL/2026',
        'nama_pemohon' => 'Dewi Lestari',
        'nomor_wa_pemohon' => '081933333333',
        'jenis_layanan' => 'risalah_lelang',
        'status_proses' => 'proses',
    ]);

    $this->actingAs($admin)
        ->get(route('documents.kuitansi'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/kuitansi')
            ->where('documents.data.0.id_pengajuan', '0002/KPHL/2026')
            ->where('documents.data.0.kode_lot_lelang', 'BGR-KWT-001')
            ->where('documents.data.0.nama_pemohon', 'Agus Rahman')
        );
});

test('public tracking reads unified doclang process ticket data', function () {
    DoclangProses::create([
        'kode_lot_lelang' => 'BGR-KWT-099',
        'id_pengajuan' => '0099/KPHL/2026',
        'nama_pemohon' => 'Agus Rahman',
        'nomor_wa_pemohon' => '081922222222',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'siap_diambil',
    ]);

    $this->get(route('home', [
        'category' => 'kuitansi',
        'search' => '0099/KPHL/2026',
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('document.nomor_pengajuan', '0099/KPHL/2026')
            ->where('document.status_proses', 'siap_diambil')
        );
});

test('authenticated admins can download private request files', function () {
    Storage::fake('local');

    $admin = User::factory()->create();
    $path = 'doclang/identitas-pemohon/ktp.pdf';
    Storage::disk('local')->put($path, 'private-file');

    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-KWT-100',
        'id_pengajuan' => '0100/KPHL/2026',
        'nama_pemohon' => 'Agus Rahman',
        'nomor_wa_pemohon' => '081922222222',
        'jenis_layanan' => 'kuitansi',
        'status_proses' => 'proses',
        'dokumen_identitas_pemohon_path' => $path,
    ]);

    $this->get(route('permohonan.file', [$permohonan, 'identitas-pemohon']))
        ->assertRedirect(route('login'));

    $this->actingAs($admin)
        ->get(route('permohonan.file', [$permohonan, 'identitas-pemohon']))
        ->assertOk();
});

test('admin can mark request as finished with document number and date', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-003',
        'id_pengajuan' => '0004/V-PPh/2026',
        'nama_pemohon' => 'Rina Kartika',
        'nomor_wa_pemohon' => '081944444444',
        'jenis_layanan' => 'validasi_pph',
        'status_proses' => 'proses',
    ]);

    $this->actingAs($admin)
        ->patch(route('permohonan.update', $permohonan), [
            'status_proses' => 'selesai',
            'nomor_dokumen' => 'DOC-001',
            'tanggal_dokumen' => '2026-05-18',
        ])
        ->assertRedirect();

    $permohonan->refresh();

    expect($permohonan->status_proses)->toBe('selesai');
    expect($permohonan->nomor_dokumen)->toBe('DOC-001');
    expect($permohonan->tanggal_dokumen->toDateString())->toBe('2026-05-18');

    Queue::assertNotPushed(SendWhatsAppNotification::class);
});
