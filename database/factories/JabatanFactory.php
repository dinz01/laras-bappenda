<?php

namespace Database\Factories;

use App\Models\Jabatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Jabatan>
 */
class JabatanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kode' => 'JBT-'.fake()->unique()->numerify('#####'),
            'nama' => fake()->jobTitle(),
            'singkatan' => strtoupper(fake()->lexify('????')),
            'level' => fake()->numberBetween(0, 10),
            'status' => 'active',
        ];
    }
}
