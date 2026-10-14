<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('arsip', function (Blueprint $table) {
            $table->foreignId('kategori_arsip_id')
                ->nullable()
                ->after('tanggal_arsip')
                ->constrained('kategori_arsip')
                ->nullOnDelete();

            $table->string('no_register', 100)->nullable()->after('kategori_arsip_id');
            $table->string('nop', 100)->nullable()->after('no_register');
            $table->string('npwpd', 100)->nullable()->after('nop');
            $table->string('nama_wajib_pajak')->nullable()->after('npwpd');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('arsip', function (Blueprint $table) {
            $table->dropForeign(['kategori_arsip_id']);
            $table->dropColumn([
                'kategori_arsip_id',
                'no_register',
                'nop',
                'npwpd',
                'nama_wajib_pajak',
            ]);
        });
    }
};
