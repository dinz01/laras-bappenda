<?php

declare(strict_types=1);

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->seed(PermissionSeeder::class);
});

it('denies access to pengguna index for user without permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.pengguna.index'))
        ->assertForbidden();
});

it('allows access to pengguna index for user with user.view permission', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('user.view');

    $this->actingAs($user)
        ->get(route('admin.pengguna.index'))
        ->assertOk();
});

it('allows super administrator to bypass all policy checks', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('Super Administrator');

    $this->actingAs($superAdmin)
        ->get(route('admin.pengguna.index'))
        ->assertOk();

    $this->actingAs($superAdmin)
        ->get(route('admin.role.index'))
        ->assertOk();

    $this->actingAs($superAdmin)
        ->get(route('admin.permission.index'))
        ->assertOk();

    $this->actingAs($superAdmin)
        ->get(route('master.jabatan.index'))
        ->assertOk();
});

it('denies access to role index for user without role.view permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.role.index'))
        ->assertForbidden();
});

it('allows access to role index for user with role.view permission', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('role.view');

    $this->actingAs($user)
        ->get(route('admin.role.index'))
        ->assertOk();
});

it('denies access to master jabatan for user without master.view permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('master.jabatan.index'))
        ->assertForbidden();
});

it('allows access to master jabatan for user with master.view permission', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('master.view');

    $this->actingAs($user)
        ->get(route('master.jabatan.index'))
        ->assertOk();
});

it('denies access to audit log for user without auditlog.view permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.audit-log.index'))
        ->assertForbidden();
});

it('allows access to audit log for user with auditlog.view permission', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('auditlog.view');

    $this->actingAs($user)
        ->get(route('admin.audit-log.index'))
        ->assertOk();
});
