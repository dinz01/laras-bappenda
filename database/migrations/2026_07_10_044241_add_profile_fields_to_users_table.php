<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Menambahkan kolom profil dasar ke tabel users:
     * - nip          : Nomor Induk Pegawai (nullable, ASN tidak semua memiliki NIP)
     * - nama_lengkap : Nama lengkap pegawai sesuai dokumen resmi
     * - status       : Status akun pengguna (active / inactive)
     * - avatar       : Path avatar profil (nullable)
     * - last_login_at: Waktu login terakhir untuk monitoring & audit (nullable)
     *
     * Catatan:
     * - Kolom unit_organisasi_id dan jabatan_id ditunda hingga Phase 01
     *   karena tabel yang dirujuk belum dibuat pada phase ini.
     * - Kolom name dipertahankan untuk kompatibilitas Fortify & PasskeyAuthenticatable.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip', 30)->nullable()->unique()->after('id');
            $table->string('nama_lengkap')->nullable()->after('nip');
            $table->string('status', 20)->default('active')->after('email_verified_at');
            $table->string('avatar')->nullable()->after('status');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');

            $table->index('status');
            $table->index('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['last_login_at']);
            $table->dropColumn([
                'nip',
                'nama_lengkap',
                'status',
                'avatar',
                'last_login_at',
            ]);
        });
    }
};
