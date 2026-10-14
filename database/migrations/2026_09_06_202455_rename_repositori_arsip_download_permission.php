<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $old = Permission::where('name', 'repositori-arsip.download')->where('guard_name', 'web')->first();

        if ($old) {
            $new = Permission::firstOrCreate([
                'name' => 'dokumen-arsip.download',
                'guard_name' => 'web',
            ]);

            // Pindahkan semua role yang punya permission lama ke permission baru
            foreach ($old->roles as $role) {
                if (! $role->hasPermissionTo('dokumen-arsip.download')) {
                    $role->givePermissionTo($new);
                }
            }

            // Pindahkan semua user yang punya permission lama ke permission baru
            foreach ($old->users as $user) {
                if (! $user->hasPermissionTo('dokumen-arsip.download')) {
                    $user->givePermissionTo($new);
                }
            }

            $old->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $new = Permission::where('name', 'dokumen-arsip.download')->where('guard_name', 'web')->first();

        if ($new) {
            $old = Permission::firstOrCreate([
                'name' => 'repositori-arsip.download',
                'guard_name' => 'web',
            ]);

            foreach ($new->roles as $role) {
                if (! $role->hasPermissionTo('repositori-arsip.download')) {
                    $role->givePermissionTo($old);
                }
            }

            foreach ($new->users as $user) {
                if (! $user->hasPermissionTo('repositori-arsip.download')) {
                    $user->givePermissionTo($old);
                }
            }

            $new->delete();
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
