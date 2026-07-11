<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UnitOrganisasiSeeder::class,
            JabatanSeeder::class,
            KlasifikasiArsipSeeder::class,
            LokasiArsipSeeder::class,
            JenisArsipSeeder::class,
            MediaArsipSeeder::class,
            SifatArsipSeeder::class,
            TingkatPerkembanganArsipSeeder::class,
            MetodePenyusutanArsipSeeder::class,
            KondisiArsipSeeder::class,
            TingkatAksesArsipSeeder::class,
            StatusArsipSeeder::class,
            JenisDokumenSeeder::class,
            RetensiArsipSeeder::class,
            UserSeeder::class,
        ]);
    }
}
