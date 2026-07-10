<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Mengganti nama kolom 'avatar' menjadi 'avatar_path' pada tabel users.
     * Alasan: konvensi penamaan kolom path lebih eksplisit dengan suffix '_path'.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('avatar', 'avatar_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('avatar_path', 'avatar');
        });
    }
};
