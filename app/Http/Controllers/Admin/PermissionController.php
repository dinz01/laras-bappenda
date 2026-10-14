<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AppDateTime;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
        Gate::authorize('viewAny', Permission::class);
        $search = $request->string('search')->trim()->toString();
        $userMorph = (new User)->getMorphClass();

        $permissions = Permission::query()
            ->withCount('roles')
            ->select('permissions.*')
            ->selectSub(function (Builder $query) use ($userMorph): void {
                $query->from('users')
                    ->selectRaw('count(distinct users.id)')
                    ->where(function (Builder $q) use ($userMorph): void {
                        $q->whereExists(function (Builder $sub) use ($userMorph): void {
                            $sub->from('model_has_permissions')
                                ->whereColumn('model_has_permissions.model_id', 'users.id')
                                ->where('model_has_permissions.model_type', $userMorph)
                                ->whereColumn('model_has_permissions.permission_id', 'permissions.id');
                        })
                            ->orWhereExists(function (Builder $sub) use ($userMorph): void {
                                $sub->from('model_has_roles')
                                    ->join('role_has_permissions', 'role_has_permissions.role_id', '=', 'model_has_roles.role_id')
                                    ->whereColumn('model_has_roles.model_id', 'users.id')
                                    ->where('model_has_roles.model_type', $userMorph)
                                    ->whereColumn('role_has_permissions.permission_id', 'permissions.id');
                            });
                    });
            }, 'users_count')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Permission $permission): array => [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'roles_count' => (int) $permission->roles_count,
                'users_count' => (int) $permission->users_count,
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
