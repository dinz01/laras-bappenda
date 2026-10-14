<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'username' => 'admin',
                'email' => 'admin@laras.test',
                'name' => 'Super Administrator',
                'nip' => null,
                'nik' => null,
                'role' => 'Super Administrator',
            ],
        ];

        foreach ($users as $data) {
            $user = User::updateOrCreate(
                ['username' => $data['username']],
                [
                    'nip' => $data['nip'],
                    'nik' => $data['nik'],
                    'name' => $data['name'],
                    'nama_lengkap' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                    'unit_organisasi_id' => null,
                    'jabatan_id' => null,
                ],
            );

            $user->syncRoles([$data['role']]);
        }
    }
}
