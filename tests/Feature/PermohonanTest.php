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
    Storage::fake('public');

    $response = $this->post(route('permohonan.store'), [
        'nama_pemohon' => 'Budi Santoso',
        'nomor_wa_pemohon' => '081234567890',
        'kode_lot_lelang' => 'BGR-LOT-001',
        'jenis_layanan' => 'Validasi PPh',
        'tanggal_dokumen' => '2026-05-18',
        'bukti_pelunasan' => UploadedFile::fake()->image('pph.png'),
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $permohonan = DoclangProses::firstOrFail();

    expect($permohonan->id_pengajuan)->toStartWith('REQ-BOGOR-');
    expect($permohonan->status_proses)->toBe('proses');

    Storage::disk('public')->assertExists($permohonan->bukti_pelunasan_path);
    Queue::assertPushed(SendWhatsAppNotification::class);
});

test('admin rejection requires reason and queues rejection whatsapp notification', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-002',
        'id_pengajuan' => 'REQ-BOGOR-20260518-0001',
        'nama_pemohon' => 'Siti Aminah',
        'nomor_wa_pemohon' => '081911111111',
        'jenis_layanan' => 'Pemberian Kuitansi Pembayaran',
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

    Queue::assertPushed(SendWhatsAppNotification::class);
});

test('document dashboard reads unified doclang process data by service', function () {
    $admin = User::factory()->create();

    DoclangProses::create([
        'kode_lot_lelang' => 'BGR-KWT-001',
        'id_pengajuan' => 'REQ-BOGOR-20260518-0002',
        'nama_pemohon' => 'Agus Rahman',
        'nomor_wa_pemohon' => '081922222222',
        'jenis_layanan' => 'Pemberian Kuitansi Pembayaran',
        'status_proses' => 'proses',
    ]);

    DoclangProses::create([
        'kode_lot_lelang' => 'BGR-RL-001',
        'id_pengajuan' => 'REQ-BOGOR-20260518-0003',
        'nama_pemohon' => 'Dewi Lestari',
        'nomor_wa_pemohon' => '081933333333',
        'jenis_layanan' => 'Pemberian Kutipan Risalah Lelang',
        'status_proses' => 'proses',
    ]);

    $this->actingAs($admin)
        ->get(route('documents.kuitansi'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/kuitansi')
            ->where('documents.data.0.id_pengajuan', 'REQ-BOGOR-20260518-0002')
            ->where('documents.data.0.kode_lot_lelang', 'BGR-KWT-001')
            ->where('documents.data.0.nama_pemohon', 'Agus Rahman')
        );
});

test('admin can mark request as finished with document number and date', function () {
    Queue::fake();

    $admin = User::factory()->create();
    $permohonan = DoclangProses::create([
        'kode_lot_lelang' => 'BGR-LOT-003',
        'id_pengajuan' => 'REQ-BOGOR-20260518-0004',
        'nama_pemohon' => 'Rina Kartika',
        'nomor_wa_pemohon' => '081944444444',
        'jenis_layanan' => 'Validasi PPh',
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
