<?php

namespace Database\Factories;

use App\Enums\PeminjamanStatus;
use App\Models\Arsip;
use App\Models\PeminjamanArsip;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PeminjamanArsip>
 */
class PeminjamanArsipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'arsip_id' => Arsip::factory(),
            'pemohon_id' => User::factory(),
            'alasan' => fake()->sentence(),
            'status' => PeminjamanStatus::Pending,
            'catatan_peninjau' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }

    /**
     * State untuk peminjaman yang sudah disetujui.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PeminjamanStatus::Approved,
            'catatan_peninjau' => fake()->optional()->sentence(),
            'reviewed_by' => User::factory(),
            'reviewed_at' => now(),
        ]);
    }

    /**
     * State untuk peminjaman yang ditolak.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PeminjamanStatus::Rejected,
            'catatan_peninjau' => fake()->sentence(),
            'reviewed_by' => User::factory(),
            'reviewed_at' => now(),
        ]);
    }
}
