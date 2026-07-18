<?php

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
            ['email' => 'superadmin@laras.test',   'name' => 'Super Administrator', 'role' => 'Super Administrator'],
            ['email' => 'administrator@laras.test', 'name' => 'Administrator',       'role' => 'Administrator'],
            ['email' => 'arsiparis@laras.test',     'name' => 'Arsiparis',           'role' => 'Arsiparis'],
            ['email' => 'pimpinan@laras.test',      'name' => 'Pimpinan',            'role' => 'Pimpinan'],
            ['email' => 'pegawai@laras.test',       'name' => 'Pegawai',             'role' => 'Pegawai'],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'nama_lengkap'      => $data['name'],
                    'name'              => $data['name'],
                    'password'          => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status'            => 'active',
                ]
            );
            $user->syncRoles([$data['role']]);
        }
    }
}
