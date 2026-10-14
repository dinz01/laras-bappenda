<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    $user = User::factory()->create();
    $user->assignRole('Super Administrator');
    $this->actingAs($user);
});

test('pengguna index page can be rendered', function () {
    $response = $this->get(route('admin.pengguna.index'));

    $response->assertOk();
});

test('user can be created with required fields only', function () {
    $response = $this->post(route('admin.pengguna.store'), [
        'name' => 'John Doe',
        'username' => 'johndoe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'status' => 'active',
        'nip' => '',
        'nik' => '',
        'unit_organisasi_id' => '',
        'jabatan_id' => '',
        'roles' => ['Arsiparis'],
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('users', [
        'username' => 'johndoe',
        'email' => 'john@example.com',
    ]);
});

test('user creation requires mandatory fields', function () {
    $response = $this->post(route('admin.pengguna.store'), [
        'name' => '',
        'username' => '',
        'email' => '',
        'password' => '',
        'status' => '',
        'roles' => [],
    ]);

    $response->assertSessionHasErrors(['name', 'username', 'email', 'password', 'status', 'roles']);
});

test('user can be updated', function () {
    $targetUser = User::factory()->create([
        'name' => 'Old Name',
        'username' => 'olduser',
        'email' => 'old@example.com',
    ]);

    $response = $this->put(route('admin.pengguna.update', $targetUser), [
        'name' => 'Updated Name',
        'username' => 'olduser',
        'email' => 'updated@example.com',
        'status' => 'active',
        'nip' => '',
        'nik' => '',
        'unit_organisasi_id' => '',
        'jabatan_id' => '',
        'roles' => ['Arsiparis'],
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('users', [
        'id' => $targetUser->id,
        'name' => 'Updated Name',
        'email' => 'updated@example.com',
    ]);
});

test('user can be deleted', function () {
    $targetUser = User::factory()->create();

    $response = $this->delete(route('admin.pengguna.destroy', $targetUser));

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('users', [
        'id' => $targetUser->id,
    ]);
});

test('user creation validates duplicate nip', function () {
    User::factory()->create([
        'nip' => '1122334455',
    ]);

    $response = $this->post(route('admin.pengguna.store'), [
        'name' => 'Pimpinan',
        'username' => 'pimpinan',
        'email' => 'pimpinan@example.com',
        'password' => 'password123',
        'status' => 'active',
        'nip' => '1122334455',
        'roles' => ['Pimpinan'],
    ]);

    $response->assertSessionHasErrors(['nip']);
});
