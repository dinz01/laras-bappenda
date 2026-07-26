<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJabatanRequest;
use App\Models\Jabatan;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class JabatanController extends Controller
{
    /**
     * Display a listing of the jabatan.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Jabatan::class);

        $search = $request->string('search')->trim()->toString();

        $jabatans = Jabatan::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('kode', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%")
                        ->orWhere('singkatan', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Jabatan $jabatan): array => [
                'id' => $jabatan->id,
                'kode' => $jabatan->kode,
                'nama' => $jabatan->nama,
                'singkatan' => $jabatan->singkatan,
                'status' => $jabatan->status,
                'created_at' => AppDateTime::dateTime($jabatan->created_at),
                'updated_at' => AppDateTime::dateTime($jabatan->updated_at),
            ]);

        $stats = [
            'total_jabatan' => Jabatan::count(),
            'aktif' => Jabatan::where('status', 'active')->count(),
            'nonaktif' => Jabatan::where('status', 'inactive')->count(),
            'bulan_ini' => Jabatan::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('master/jabatan/index', [
            'jabatans' => $jabatans,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created jabatan.
     */
    public function store(StoreJabatanRequest $request): RedirectResponse
    {
        Gate::authorize('create', Jabatan::class);

        Jabatan::create($this->validatedData($request));

        return back()->with('success', 'Jabatan berhasil ditambahkan.');
    }

    /**
     * Update the specified jabatan.
     */
    public function update(StoreJabatanRequest $request, Jabatan $jabatan): RedirectResponse
    {
        Gate::authorize('update', $jabatan);

        $jabatan->update($this->validatedData($request));

        return back()->with('success', 'Jabatan berhasil diperbarui.');
    }

    /**
     * Remove the specified jabatan.
     */
    public function destroy(Jabatan $jabatan): RedirectResponse
    {
        Gate::authorize('delete', $jabatan);
        $usageCount = $jabatan->users()->count();

        if ($usageCount > 0) {
            return back()->withErrors([
                'jabatan' => "Jabatan tidak dapat dihapus karena masih digunakan oleh {$usageCount} pegawai.",
            ]);
        }

        $jabatan->delete();

        return back()->with('success', 'Jabatan berhasil dihapus.');
    }

    /**
     * @return array{kode: string, nama: string, singkatan: string|null, status: string}
     */
    private function validatedData(StoreJabatanRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'singkatan' => $validated['singkatan'],
            'status' => (string) $validated['status'],
        ];
    }
}
