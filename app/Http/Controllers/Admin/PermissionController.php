<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AppDateTime;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the permissions.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $permissions = Permission::query()
            ->withCount('roles', 'users')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Permission $permission): array => [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'roles_count' => $permission->roles_count,
                'users_count' => $permission->users_count,
                'created_at' => AppDateTime::dateTime($permission->created_at),
            ]);

        // Group permissions by prefix (e.g. 'arsip.view' -> 'arsip')
        $allPermissions = Permission::orderBy('name')->get(['name']);
        $grouped = $allPermissions->groupBy(fn ($p) => explode('.', $p->name)[0]);

        $stats = [
            'total' => Permission::count(),
            'total_groups' => $grouped->count(),
            'bulan_ini' => Permission::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('admin/permission/index', [
            'permissions' => $permissions,
            'stats' => $stats,
            'filters' => ['search' => $search],
        ]);
    }
}
