<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('rbac seeders seed expected roles, permissions, and default super admin', function () {
    // Run the seeders
    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);
    $this->seed(UserSeeder::class);

    // Assert permissions exist
    expect(Permission::where('name', 'dashboard.view')->exists())->toBeTrue();
    expect(Permission::where('name', 'profile.view')->exists())->toBeTrue();
    expect(Permission::where('name', 'profile.update')->exists())->toBeTrue();
    expect(Permission::where('name', 'user.view')->exists())->toBeTrue();
    expect(Permission::where('name', 'role.view')->exists())->toBeTrue();

    // Assert roles exist
    expect(Role::where('name', 'Super Administrator')->exists())->toBeTrue();
    expect(Role::where('name', 'Arsiparis')->exists())->toBeTrue();

    // Assert default user was created and has role assigned
    $user = User::where('email', 'admin@laras.test')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('Super Administrator');
    expect($user->hasRole('Super Administrator'))->toBeTrue();
});
