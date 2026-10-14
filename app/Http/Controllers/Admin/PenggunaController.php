<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePenggunaRequest;
use App\Models\Jabatan;
use App\Models\UnitOrganisasi;
use App\Models\User;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class PenggunaController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the pengguna (users).
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);
        $search = $request->string('search')->trim()->toString();
        $statusFilter = $request->string('status')->trim()->toString();
        $roleFilter = $request->string('role')->trim()->toString();
        $unitFilter = $request->string('unit')->trim()->toString();

        $users = User::query()
            ->with(['unitOrganisasi.parent', 'jabatan', 'roles'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('nip', 'like', "%{$search}%");
                });
            })
            ->when($statusFilter !== '', fn ($q) => $q->where('status', $statusFilter))
            ->when($roleFilter !== '', fn ($q) => $q->role($roleFilter))
            ->when($unitFilter !== '', fn ($q) => $q->where('unit_organisasi_id', (int) $unitFilter))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'nip' => $user->nip,
                'nik' => $user->nik,
                'status' => $user->status,
                'unit_organisasi_id' => $user->unit_organisasi_id,
                'unit_organisasi' => $user->unitOrganisasi?->toDisplayArray(),
                'jabatan_id' => $user->jabatan_id,
                'jabatan' => $user->jabatan?->nama,
                'roles' => $user->roles->pluck('name')->all(),
                'created_at' => AppDateTime::dateTime($user->created_at),
            ]);

        $stats = [
            'total' => User::count(),
            'aktif' => User::where('status', 'active')->count(),
            'nonaktif' => User::where('status', 'inactive')->count(),
            'bulan_ini' => User::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        $roles = Role::orderBy('name')->pluck('name')->all();
        $unitOrganisasis = UnitOrganisasi::active()
            ->orderBy('nama')
            ->get(['id', 'nama', 'tipe', 'parent_id'])
            ->toArray();
        $jabatans = Jabatan::active()->orderBy('nama')->get(['id', 'nama'])->toArray();

        return Inertia::render('admin/pengguna/index', [
            'users' => $users,
            'stats' => $stats,
            'roles' => $roles,
            'unit_organisasis' => $unitOrganisasis,
            'jabatans' => $jabatans,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'role' => $roleFilter,
                'unit' => $unitFilter,
            ],
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StorePenggunaRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validated();

        /** @var User $user */
        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make((string) $validated['password']),
            'nip' => $validated['nip'] ?? null,
            'nik' => $validated['nik'] ?? null,
            'unit_organisasi_id' => $validated['unit_organisasi_id'] ?? null,
            'jabatan_id' => $validated['jabatan_id'] ?? null,
            'status' => $validated['status'],
        ]);

        if (! empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        $this->auditLogService->log(
            'pengguna.created',
            $user,
            null,
            [
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'status' => $user->status,
                'roles' => $validated['roles'] ?? [],
            ],
            auth()->user(),
        );

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Update the specified user.
     */
    public function update(StorePenggunaRequest $request, User $pengguna): RedirectResponse
    {
        Gate::authorize('update', $pengguna);

        $validated = $request->validated();

        $oldValues = [
            'name' => $pengguna->name,
            'username' => $pengguna->username,
            'email' => $pengguna->email,
            'status' => $pengguna->status,
            'roles' => $pengguna->roles->pluck('name')->all(),
        ];

        $data = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'nip' => $validated['nip'] ?? null,
            'nik' => $validated['nik'] ?? null,
            'unit_organisasi_id' => $validated['unit_organisasi_id'] ?? null,
            'jabatan_id' => $validated['jabatan_id'] ?? null,
            'status' => $validated['status'],
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $pengguna->update($data);
        $pengguna->syncRoles($validated['roles'] ?? []);

        $this->auditLogService->log(
            'pengguna.updated',
            $pengguna,
            $oldValues,
            [
                'name' => $pengguna->name,
                'username' => $pengguna->username,
                'email' => $pengguna->email,
                'status' => $pengguna->status,
                'roles' => $validated['roles'] ?? [],
            ],
            auth()->user(),
        );

        return back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $pengguna): RedirectResponse
    {
        Gate::authorize('delete', $pengguna);
        if ($pengguna->id === auth()->id()) {
            return back()->withErrors(['pengguna' => 'Tidak dapat menghapus akun yang sedang digunakan.']);
        }

        $oldValues = [
            'name' => $pengguna->name,
            'username' => $pengguna->username,
            'email' => $pengguna->email,
            'status' => $pengguna->status,
            'roles' => $pengguna->roles->pluck('name')->all(),
        ];

        $pengguna->delete();

        $this->auditLogService->log(
            'pengguna.deleted',
            $pengguna,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
