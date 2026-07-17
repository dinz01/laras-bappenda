<?php

use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\DokumenArsipVersion;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can run development seeder without exception and populate correct counts', function () {
    // Run DatabaseSeeder (calls all base seeders + DevelopmentSeeder in testing env)
    $this->seed(DatabaseSeeder::class);

    // User: UserSeeder + 20 extra from DevelopmentSeeder
    expect(User::count())->toBeGreaterThanOrEqual(20);

    // Verify exact Arsip counts
    expect(Arsip::count())->toBe(500);

    // Verify related documents and versions counts match
    expect(DokumenArsip::count())->toBe(500);
    expect(DokumenArsipVersion::count())->toBe(500);

    // Check that all versions are version = 1
    expect(DokumenArsipVersion::where('versi', '!=', 1)->count())->toBe(0);
});
