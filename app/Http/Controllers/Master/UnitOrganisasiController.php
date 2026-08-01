<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitOrganisasiRequest;
use App\Models\Arsip;
use App\Models\UnitOrganisasi;
use App\Support\AppDateTime;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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

        $allUnits = UnitOrganisasi::with('children')
            ->orderBy('parent_id')
            ->orderBy('created_at', 'desc')
            ->get();

        $depthMap = $this->buildDepthMap($allUnits);

        if ($search !== '') {
            /** @var list<int> $filteredIds */
            $filteredIds = $allUnits
                ->filter(function (UnitOrganisasi $unit) use ($search): bool {
                    return stripos($unit->kode, $search) !== false
                        || stripos($unit->nama, $search) !== false
                        || (is_string($unit->singkatan) && stripos($unit->singkatan, $search) !== false);
                })
                ->pluck('id')
                ->values()
                ->toArray();

            $ancestorIds = $this->getAncestorIds($filteredIds, $allUnits);
            $visibleIds = array_unique([...$filteredIds, ...$ancestorIds]);

            $units = $allUnits
                ->filter(fn (UnitOrganisasi $unit): bool => in_array($unit->id, $visibleIds, true))
                ->map(fn (UnitOrganisasi $unit): array => $this->transformUnit($unit, $depthMap))
                ->values();
        } else {
            $units = $allUnits
                ->map(fn (UnitOrganisasi $unit): array => $this->transformUnit($unit, $depthMap))
                ->values();
        }

        $stats = [
            'total_unit_organisasi' => UnitOrganisasi::count(),
            'aktif' => UnitOrganisasi::where('status', 'active')->count(),
            'nonaktif' => UnitOrganisasi::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => UnitOrganisasi::whereBetween(
                'created_at',
                [Carbon::now((string) config('app.timezone'))->startOfMonth(), Carbon::now((string) config('app.timezone'))->endOfMonth()]
            )->count(),
        ];

        return Inertia::render('master/unit-organisasi/index', [
            'units' => $units,
            'stats' => $stats,
            'parentOptions' => UnitOrganisasi::active()
                ->where('tipe', 'bidang')
                ->orderBy('nama')
                ->get(['id', 'nama']),
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
        UnitOrganisasi::create($this->storeData($request));

        return back()->with('success', 'Unit organisasi berhasil ditambahkan.');
    }

    /**
     * Update the specified unit organisasi.
     */
    public function update(StoreUnitOrganisasiRequest $request, UnitOrganisasi $unitOrganisasi): RedirectResponse
    {
        $unitOrganisasi->update($this->updateData($request));

        return back()->with('success', 'Unit organisasi berhasil diperbarui.');
    }

    /**
     * Remove the specified unit organisasi.
     */
    public function destroy(UnitOrganisasi $unitOrganisasi): RedirectResponse
    {
        $childrenCount = $unitOrganisasi->children()->count();

        if ($childrenCount > 0) {
            return back()->withErrors([
                'unit_organisasi' => "Unit organisasi tidak dapat dihapus karena memiliki {$childrenCount} unit turunan. Pindahkan atau hapus turunan terlebih dahulu.",
            ]);
        }

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
     * Build a depth map for all units.
     *
     * @param  Collection<int, UnitOrganisasi>  $units
     * @return array<int, int>
     */
    private function buildDepthMap(Collection $units): array
    {
        $unitMap = [];

        foreach ($units as $unit) {
            $unitMap[$unit->id] = $unit;
        }

        $depthMap = [];

        foreach ($units as $unit) {
            $depthMap[$unit->id] = $this->computeDepth($unit, $unitMap, $depthMap);
        }

        return $depthMap;
    }

    /**
     * Compute depth of a unit by traversing parents.
     *
     * @param  array<int, UnitOrganisasi>  $unitMap
     * @param  array<int, int>  $depthMap
     */
    private function computeDepth(UnitOrganisasi $unit, array $unitMap, array &$depthMap): int
    {
        if ($unit->parent_id === null) {
            return 0;
        }

        if (isset($depthMap[$unit->parent_id])) {
            return $depthMap[$unit->parent_id] + 1;
        }

        $parent = $unitMap[$unit->parent_id] ?? null;

        if ($parent === null) {
            return 0;
        }

        $depth = $this->computeDepth($parent, $unitMap, $depthMap) + 1;
        $depthMap[$unit->parent_id] = $depth - 1;

        return $depth;
    }

    /**
     * Get IDs of all ancestor units for the given unit IDs.
     *
     * @param  list<int>  $unitIds
     * @param  Collection<int, UnitOrganisasi>  $allUnits
     * @return list<int>
     */
    private function getAncestorIds(array $unitIds, Collection $allUnits): array
    {
        $unitMap = [];

        foreach ($allUnits as $unit) {
            $unitMap[$unit->id] = $unit;
        }

        $ancestorIds = [];

        foreach ($unitIds as $unitId) {
            $current = $unitMap[$unitId] ?? null;

            while ($current !== null && $current->parent_id !== null) {
                $parent = $unitMap[$current->parent_id] ?? null;

                if ($parent !== null) {
                    $ancestorIds[] = $parent->id;
                }

                $current = $parent;
            }
        }

        /** @var list<int> */
        return array_values(array_unique($ancestorIds));
    }

    /**
     * @param  array<int, int>  $depthMap
     * @return array{id: int, kode: string, nama: string, singkatan: string|null, tipe: string, parent_id: int|null, status: string, depth: int, children_count: int, created_at: string|null, updated_at: string|null}
     */
    private function transformUnit(UnitOrganisasi $unit, array $depthMap): array
    {
        return [
            'id' => $unit->id,
            'kode' => $unit->kode,
            'nama' => $unit->nama,
            'singkatan' => $unit->singkatan,
            'tipe' => $unit->tipe,
            'parent_id' => $unit->parent_id,
            'status' => $unit->status,
            'depth' => $depthMap[$unit->id] ?? 0,
            'children_count' => $unit->children->count(),
            'created_at' => AppDateTime::dateTime($unit->created_at),
            'updated_at' => AppDateTime::dateTime($unit->updated_at),
        ];
    }

    /**
     * Siapkan data untuk pembuatan unit baru.
     * Tipe ditentukan otomatis: jika ada parent_id maka 'sub_bidang',
     * jika tidak maka mengikuti input pengguna (bidang/upt).
     *
     * @return array{kode: string, nama: string, singkatan: string|null, tipe: string, parent_id: int|null, status: string}
     */
    private function storeData(StoreUnitOrganisasiRequest $request): array
    {
        $validated = $request->validated();

        $parentId = isset($validated['parent_id']) && is_numeric($validated['parent_id'])
            ? (int) $validated['parent_id']
            : null;

        $tipe = $parentId !== null ? 'sub_bidang' : (string) $validated['tipe'];

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'singkatan' => isset($validated['singkatan']) ? (string) $validated['singkatan'] : null,
            'tipe' => $tipe,
            'parent_id' => $parentId,
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * Siapkan data untuk update unit yang sudah ada.
     * Tipe dan parent_id sengaja TIDAK disentuh — struktur hierarki
     * hanya dapat ditentukan saat pembuatan unit, bukan lewat edit.
     *
     * @return array{kode: string, nama: string, singkatan: string|null, status: string}
     */
    private function updateData(StoreUnitOrganisasiRequest $request): array
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
