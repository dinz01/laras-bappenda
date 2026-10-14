<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peminjaman_arsip', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('arsip_id')->constrained('arsip')->cascadeOnDelete();
            $table->foreignId('pemohon_id')->constrained('users')->cascadeOnDelete();
            $table->text('alasan');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('catatan_peninjau')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['arsip_id', 'status']);
            $table->index(['pemohon_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peminjaman_arsip');
    }
};
