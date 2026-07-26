<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Role::class);

        $roles = Role::query()
            ->withCount('users', 'permissions')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->pluck('name')->all(),
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions_count,
                'created_at' => AppDateTime::dateTime($role->created_at),
            ]);

        $stats = [
            'total' => Role::count(),
            'with_permissions' => Role::has('permissions')->count(),
            'with_users' => Role::has('users')->count(),
        ];

        $permissions = Permission::orderBy('name')->pluck('name')->all();

        return Inertia::render('admin/role/index', [
            'roles' => $roles,
            'stats' => $stats,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        Gate::authorize('create', Role::class);

        $validated = $request->validated();

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return back()->with('success', 'Role berhasil ditambahkan.');
    }

    /**
     * Update the specified role.
     */
    public function update(StoreRoleRequest $request, Role $role): RedirectResponse
    {
        Gate::authorize('update', $role);

        $validated = $request->validated();

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('delete', $role);
        $usersCount = $role->users()->count();

        if ($usersCount > 0) {
            return back()->withErrors([
                'role' => "Role tidak dapat dihapus karena masih digunakan oleh {$usersCount} pengguna.",
            ]);
        }

        $role->delete();

        return back()->with('success', 'Role berhasil dihapus.');
    }
}
