<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitOrganisasiRequest;
use App\Models\Arsip;
use App\Models\UnitOrganisasi;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitOrganisasiController extends Controller
{
    /**
     * Display a listing of the unit organisasi.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $units = UnitOrganisasi::query()
            ->withCount('arsips')
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
            ->through(fn (UnitOrganisasi $unit): array => [
                'id' => $unit->id,
                'kode' => $unit->kode,
                'nama' => $unit->nama,
                'singkatan' => $unit->singkatan,
                'status' => $unit->status,
                'jumlah_arsip' => $unit->arsips_count,
                'created_at' => AppDateTime::dateTime($unit->created_at),
                'updated_at' => AppDateTime::dateTime($unit->updated_at),
            ]);

        $stats = [
            'total_unit_organisasi' => UnitOrganisasi::count(),
            'unit_memiliki_arsip' => UnitOrganisasi::has('arsips')->count(),
            'unit_tanpa_arsip' => UnitOrganisasi::doesntHave('arsips')->count(),
            'total_arsip' => Arsip::whereNotNull('unit_organisasi_id')->count(),
        ];

        return Inertia::render('master/unit-organisasi/index', [
            'unitOrganisasis' => $units,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created unit organisasi.
     */
    public function store(StoreUnitOrganisasiRequest $request): RedirectResponse
    {
        UnitOrganisasi::create($this->validatedData($request));

        return back()->with('success', 'Unit organisasi berhasil ditambahkan.');
    }

    /**
     * Update the specified unit organisasi.
     */
    public function update(StoreUnitOrganisasiRequest $request, UnitOrganisasi $unitOrganisasi): RedirectResponse
    {
        $unitOrganisasi->update($this->validatedData($request));

        return back()->with('success', 'Unit organisasi berhasil diperbarui.');
    }

    /**
     * Remove the specified unit organisasi.
     */
    public function destroy(UnitOrganisasi $unitOrganisasi): RedirectResponse
    {
        $arsipCount = Arsip::withTrashed()
            ->where('unit_organisasi_id', $unitOrganisasi->id)
            ->count();

        if ($arsipCount > 0) {
            return back()->withErrors([
                'unit_organisasi' => "Unit organisasi tidak dapat dihapus karena masih digunakan oleh {$arsipCount} arsip.",
            ]);
        }

        $unitOrganisasi->delete();

        return back()->with('success', 'Unit organisasi berhasil dihapus.');
    }

    /**
     * @return array{kode: string, nama: string, singkatan: string|null, status: string}
     */
    private function validatedData(StoreUnitOrganisasiRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'singkatan' => isset($validated['singkatan']) ? (string) $validated['singkatan'] : null,
            'status' => (string) $validated['status'],
        ];
    }
}
