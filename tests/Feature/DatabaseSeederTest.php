<?php

use App\Models\Arsip;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can run database seeder without exception and populate master data and users', function () {
    $this->seed(DatabaseSeeder::class);

    expect(User::count())->toBe(1);

    $admin = User::where('username', 'admin')->first();
    expect($admin)->not->toBeNull();
    expect($admin->hasRole('Super Administrator'))->toBeTrue();
    expect($admin->nip)->toBeNull();
    expect($admin->nik)->toBeNull();

    expect(Arsip::count())->toBe(0);
});
