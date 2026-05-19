<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            if (! Schema::hasColumn('doclang_proses', 'email_pemohon')) {
                $table->string('email_pemohon')->nullable()->after('peran_pemohon');
            }

            if (! Schema::hasColumn('doclang_proses', 'jenis_identitas_pemohon')) {
                $table->string('jenis_identitas_pemohon')->nullable()->after('email_pemohon');
            }

            if (! Schema::hasColumn('doclang_proses', 'nomor_identitas_pemohon')) {
                $table->string('nomor_identitas_pemohon')->nullable()->after('jenis_identitas_pemohon');
            }

            if (! Schema::hasColumn('doclang_proses', 'alamat_pemohon')) {
                $table->text('alamat_pemohon')->nullable()->after('nomor_identitas_pemohon');
            }

            if (! Schema::hasColumn('doclang_proses', 'nama_pemberi_kuasa')) {
                $table->string('nama_pemberi_kuasa')->nullable()->after('nomor_wa_pemohon');
            }

            if (! Schema::hasColumn('doclang_proses', 'jenis_identitas_pemberi_kuasa')) {
                $table->string('jenis_identitas_pemberi_kuasa')->nullable()->after('nama_pemberi_kuasa');
            }

            if (! Schema::hasColumn('doclang_proses', 'nomor_identitas_pemberi_kuasa')) {
                $table->string('nomor_identitas_pemberi_kuasa')->nullable()->after('jenis_identitas_pemberi_kuasa');
            }

            if (! Schema::hasColumn('doclang_proses', 'alamat_pemberi_kuasa')) {
                $table->text('alamat_pemberi_kuasa')->nullable()->after('nomor_identitas_pemberi_kuasa');
            }

            if (! Schema::hasColumn('doclang_proses', 'nomor_wa_pemberi_kuasa')) {
                $table->string('nomor_wa_pemberi_kuasa')->nullable()->after('alamat_pemberi_kuasa');
            }
        });
    }

    public function down(): void
    {
        Schema::table('doclang_proses', function (Blueprint $table): void {
            foreach ([
                'email_pemohon',
                'jenis_identitas_pemohon',
                'nomor_identitas_pemohon',
                'alamat_pemohon',
                'nama_pemberi_kuasa',
                'jenis_identitas_pemberi_kuasa',
                'nomor_identitas_pemberi_kuasa',
                'alamat_pemberi_kuasa',
                'nomor_wa_pemberi_kuasa',
            ] as $column) {
                if (Schema::hasColumn('doclang_proses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
