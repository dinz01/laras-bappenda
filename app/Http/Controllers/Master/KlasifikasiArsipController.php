<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKlasifikasiArsipRequest;
use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\NasibAkhir;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class KlasifikasiArsipController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the klasifikasi arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $allKlasifikasis = KlasifikasiArsip::with(['parent', 'nasibAkhir', 'children'])
            ->orderBy('parent_id')
            ->orderBy('kode')
            ->get();

        $depthMap = $this->buildDepthMap($allKlasifikasis);

        if ($search !== '') {
            /** @var list<int> $filteredIds */
            $filteredIds = $allKlasifikasis
                ->filter(function (KlasifikasiArsip $item) use ($search): bool {
                    return stripos($item->kode, $search) !== false
                        || stripos($item->nama, $search) !== false
                        || (is_string($item->deskripsi) && stripos($item->deskripsi, $search) !== false);
                })
                ->pluck('id')
                ->values()
                ->toArray();

            $ancestorIds = $this->getAncestorIds($filteredIds, $allKlasifikasis);
            $visibleIds = array_unique([...$filteredIds, ...$ancestorIds]);

            $klasifikasis = $allKlasifikasis
                ->filter(fn (KlasifikasiArsip $item): bool => in_array($item->id, $visibleIds, true))
                ->map(fn (KlasifikasiArsip $item): array => $this->transformKlasifikasi($item, $depthMap))
                ->values();
        } else {
            $klasifikasis = $allKlasifikasis
                ->map(fn (KlasifikasiArsip $item): array => $this->transformKlasifikasi($item, $depthMap))
                ->values();
        }

        return Inertia::render('master/klasifikasi-arsip/index', [
            'klasifikasis' => $klasifikasis,
            'parentOptions' => KlasifikasiArsip::query()
                ->with(['parent.parent'])
                ->orderBy('kode')
                ->get()
                ->map(fn (KlasifikasiArsip $k): array => [
                    'id' => $k->id,
                    'kode' => $k->kode,
                    'nama' => $k->nama,
                    'parent_id' => $k->parent_id,
                ]),
            'nasibAkhirs' => NasibAkhir::active()->get(['id', 'nama', 'status']),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created klasifikasi arsip.
     */
    public function store(StoreKlasifikasiArsipRequest $request): RedirectResponse
    {
        $klasifikasiArsip = KlasifikasiArsip::create($this->validatedData($request));

        $this->auditLogService->log(
            'master.klasifikasi-arsip.created',
            $klasifikasiArsip,
            null,
            ['kode' => $klasifikasiArsip->kode, 'nama' => $klasifikasiArsip->nama, 'status' => $klasifikasiArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Klasifikasi arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified klasifikasi arsip.
     */
    public function update(StoreKlasifikasiArsipRequest $request, KlasifikasiArsip $klasifikasiArsip): RedirectResponse
    {
        $oldValues = ['kode' => $klasifikasiArsip->kode, 'nama' => $klasifikasiArsip->nama, 'status' => $klasifikasiArsip->status];

        $klasifikasiArsip->update($this->validatedData($request));

        $this->auditLogService->log(
            'master.klasifikasi-arsip.updated',
            $klasifikasiArsip,
            $oldValues,
            ['kode' => $klasifikasiArsip->kode, 'nama' => $klasifikasiArsip->nama, 'status' => $klasifikasiArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Klasifikasi arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified klasifikasi arsip.
     */
    public function destroy(KlasifikasiArsip $klasifikasiArsip): RedirectResponse
    {
        if ($klasifikasiArsip->children()->count() > 0) {
            return back()->withErrors([
                'klasifikasi_arsip' => 'Klasifikasi arsip tidak dapat dihapus karena memiliki turunan/sub-klasifikasi.',
            ]);
        }

        $usageCount = $this->usageCount($klasifikasiArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'klasifikasi_arsip' => "Klasifikasi arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data arsip.",
            ]);
        }

        $oldValues = ['kode' => $klasifikasiArsip->kode, 'nama' => $klasifikasiArsip->nama, 'status' => $klasifikasiArsip->status];

        $klasifikasiArsip->delete();

        $this->auditLogService->log(
            'master.klasifikasi-arsip.deleted',
            $klasifikasiArsip,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Klasifikasi arsip berhasil dihapus.');
    }

    /**
     * Build a depth map for all items.
     *
     * @param  Collection<int, KlasifikasiArsip>  $items
     * @return array<int, int>
     */
    private function buildDepthMap(Collection $items): array
    {
        $itemMap = [];

        foreach ($items as $item) {
            $itemMap[$item->id] = $item;
        }

        $depthMap = [];

        foreach ($items as $item) {
            $depthMap[$item->id] = $this->computeDepth($item, $itemMap, $depthMap);
        }

        return $depthMap;
    }

    /**
     * Compute depth of an item by traversing parents.
     *
     * @param  array<int, KlasifikasiArsip>  $itemMap
     * @param  array<int, int>  $depthMap
     */
    private function computeDepth(KlasifikasiArsip $item, array $itemMap, array &$depthMap): int
    {
        if ($item->parent_id === null) {
            return 0;
        }

        if (isset($depthMap[$item->parent_id])) {
            return $depthMap[$item->parent_id] + 1;
        }

        $parent = $itemMap[$item->parent_id] ?? null;

        if ($parent === null) {
            return 0;
        }

        $depth = $this->computeDepth($parent, $itemMap, $depthMap) + 1;
        $depthMap[$item->parent_id] = $depth - 1;

        return $depth;
    }

    /**
     * Get IDs of all ancestor items for the given item IDs.
     *
     * @param  list<int>  $itemIds
     * @param  Collection<int, KlasifikasiArsip>  $allItems
     * @return list<int>
     */
    private function getAncestorIds(array $itemIds, Collection $allItems): array
    {
        $itemMap = [];

        foreach ($allItems as $item) {
            $itemMap[$item->id] = $item;
        }

        $ancestorIds = [];

        foreach ($itemIds as $itemId) {
            $current = $itemMap[$itemId] ?? null;

            while ($current !== null && $current->parent_id !== null) {
                $parent = $itemMap[$current->parent_id] ?? null;

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
     * @return array{id: int, parent_id: int|null, parent: array{id: int, kode: string, nama: string}|null, kode: string, nama: string, deskripsi: string|null, retensi_aktif: int|null, retensi_inaktif: int|null, nasib_akhir_id: int|null, nasib_akhir: array{id: int, nama: string}|null, depth: int, children_count: int, status: string, created_at: string|null, updated_at: string|null}
     */
    private function transformKlasifikasi(KlasifikasiArsip $klasifikasiArsip, array $depthMap): array
    {
        return [
            'id' => $klasifikasiArsip->id,
            'parent_id' => $klasifikasiArsip->parent_id,
            'parent' => $klasifikasiArsip->parent ? [
                'id' => $klasifikasiArsip->parent->id,
                'kode' => $klasifikasiArsip->parent->kode,
                'nama' => $klasifikasiArsip->parent->nama,
            ] : null,
            'kode' => $klasifikasiArsip->kode,
            'nama' => $klasifikasiArsip->nama,
            'deskripsi' => $klasifikasiArsip->deskripsi,
            'retensi_aktif' => $klasifikasiArsip->retensi_aktif,
            'retensi_inaktif' => $klasifikasiArsip->retensi_inaktif,
            'nasib_akhir_id' => $klasifikasiArsip->nasib_akhir_id,
            'nasib_akhir' => $klasifikasiArsip->nasibAkhir ? [
                'id' => $klasifikasiArsip->nasibAkhir->id,
                'nama' => $klasifikasiArsip->nasibAkhir->nama,
            ] : null,
            'depth' => $depthMap[$klasifikasiArsip->id] ?? 0,
            'children_count' => $klasifikasiArsip->children->count(),
            'status' => $klasifikasiArsip->status,
            'created_at' => AppDateTime::dateTime($klasifikasiArsip->created_at),
            'updated_at' => AppDateTime::dateTime($klasifikasiArsip->updated_at),
        ];
    }

    /**
     * @return array{total_klasifikasi_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_klasifikasi_arsip' => KlasifikasiArsip::count(),
            'aktif' => KlasifikasiArsip::where('status', 'active')->count(),
            'nonaktif' => KlasifikasiArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => KlasifikasiArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{parent_id: int|null, kode: string, nama: string, deskripsi: string|null, retensi_aktif: int|null, retensi_inaktif: int|null, nasib_akhir_id: int|null, status: string}
     */
    private function validatedData(StoreKlasifikasiArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'parent_id' => isset($validated['parent_id']) && $validated['parent_id'] !== '' ? (int) $validated['parent_id'] : null,
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'retensi_aktif' => isset($validated['retensi_aktif']) && $validated['retensi_aktif'] !== '' ? (int) $validated['retensi_aktif'] : null,
            'retensi_inaktif' => isset($validated['retensi_inaktif']) && $validated['retensi_inaktif'] !== '' ? (int) $validated['retensi_inaktif'] : null,
            'nasib_akhir_id' => isset($validated['nasib_akhir_id']) && $validated['nasib_akhir_id'] !== '' ? (int) $validated['nasib_akhir_id'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(KlasifikasiArsip $klasifikasiArsip): int
    {
        return Arsip::withTrashed()
            ->where('klasifikasi_arsip_id', $klasifikasiArsip->id)
            ->count();
    }
}
