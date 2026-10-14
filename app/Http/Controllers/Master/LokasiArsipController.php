<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLokasiArsipRequest;
use App\Models\Arsip;
use App\Models\LokasiArsip;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LokasiArsipController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the lokasi arsip (tree structure).
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $allLokasis = LokasiArsip::with(['parent', 'children'])
            ->orderBy('parent_id')
            ->orderBy('kode')
            ->get();

        $depthMap = $this->buildDepthMap($allLokasis);

        if ($search !== '') {
            /** @var list<int> $filteredIds */
            $filteredIds = $allLokasis
                ->filter(function (LokasiArsip $item) use ($search): bool {
                    return stripos($item->kode, $search) !== false
                        || stripos($item->nama, $search) !== false
                        || (is_string($item->gedung) && stripos($item->gedung, $search) !== false)
                        || (is_string($item->ruangan) && stripos($item->ruangan, $search) !== false);
                })
                ->pluck('id')
                ->values()
                ->toArray();

            $ancestorIds = $this->getAncestorIds($filteredIds, $allLokasis);
            $visibleIds = array_unique([...$filteredIds, ...$ancestorIds]);

            $lokasis = $allLokasis
                ->filter(fn (LokasiArsip $item): bool => in_array($item->id, $visibleIds, true))
                ->map(fn (LokasiArsip $item): array => $this->transformLokasi($item, $depthMap))
                ->values();
        } else {
            $lokasis = $allLokasis
                ->map(fn (LokasiArsip $item): array => $this->transformLokasi($item, $depthMap))
                ->values();
        }

        return Inertia::render('master/lokasi-arsip/index', [
            'lokasis' => $lokasis,
            'parentOptions' => LokasiArsip::query()
                ->with(['parent'])
                ->orderBy('kode')
                ->get()
                ->map(fn (LokasiArsip $l): array => [
                    'id' => $l->id,
                    'kode' => $l->kode,
                    'nama' => $l->nama,
                    'parent_id' => $l->parent_id,
                ]),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created lokasi arsip.
     */
    public function store(StoreLokasiArsipRequest $request): RedirectResponse
    {
        $lokasiArsip = LokasiArsip::create($this->storeData($request));

        $this->auditLogService->log(
            'master.lokasi-arsip.created',
            $lokasiArsip,
            null,
            ['kode' => $lokasiArsip->kode, 'nama' => $lokasiArsip->nama, 'status' => $lokasiArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Lokasi arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified lokasi arsip.
     */
    public function update(StoreLokasiArsipRequest $request, LokasiArsip $lokasiArsip): RedirectResponse
    {
        $oldValues = ['kode' => $lokasiArsip->kode, 'nama' => $lokasiArsip->nama, 'status' => $lokasiArsip->status];

        $lokasiArsip->update($this->updateData($request));

        $this->auditLogService->log(
            'master.lokasi-arsip.updated',
            $lokasiArsip,
            $oldValues,
            ['kode' => $lokasiArsip->kode, 'nama' => $lokasiArsip->nama, 'status' => $lokasiArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Lokasi arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified lokasi arsip.
     */
    public function destroy(LokasiArsip $lokasiArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($lokasiArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'lokasi_arsip' => "Lokasi arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $childCount = $lokasiArsip->children()->count();

        if ($childCount > 0) {
            return back()->withErrors([
                'lokasi_arsip' => "Lokasi arsip tidak dapat dihapus karena memiliki {$childCount} sub lokasi.",
            ]);
        }

        $oldValues = ['kode' => $lokasiArsip->kode, 'nama' => $lokasiArsip->nama, 'status' => $lokasiArsip->status];

        $lokasiArsip->delete();

        $this->auditLogService->log(
            'master.lokasi-arsip.deleted',
            $lokasiArsip,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Lokasi arsip berhasil dihapus.');
    }

    /**
     * @return array{total_lokasi_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_lokasi_arsip' => LokasiArsip::count(),
            'aktif' => LokasiArsip::where('status', 'active')->count(),
            'nonaktif' => LokasiArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => LokasiArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * Siapkan data untuk pembuatan lokasi baru.
     * Kode digenerate otomatis jika kosong.
     *
     * @return array<string, mixed>
     */
    private function storeData(StoreLokasiArsipRequest $request): array
    {
        $validated = $request->validated();

        $kode = isset($validated['kode']) && is_string($validated['kode']) && trim($validated['kode']) !== ''
            ? trim($validated['kode'])
            : LokasiArsip::generateKode();

        return [
            'parent_id' => isset($validated['parent_id']) && is_numeric($validated['parent_id']) ? (int) $validated['parent_id'] : null,
            'kode' => $kode,
            'nama' => (string) $validated['nama'],
            'gedung' => isset($validated['gedung']) ? (string) $validated['gedung'] : null,
            'lantai' => isset($validated['lantai']) ? (string) $validated['lantai'] : null,
            'ruangan' => isset($validated['ruangan']) ? (string) $validated['ruangan'] : null,
            'rak' => isset($validated['rak']) ? (string) $validated['rak'] : null,
            'box' => isset($validated['box']) ? (string) $validated['box'] : null,
            'keterangan' => isset($validated['keterangan']) ? (string) $validated['keterangan'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * Siapkan data untuk update lokasi yang sudah ada.
     * Kode tidak dapat diubah saat edit.
     *
     * @return array<string, mixed>
     */
    private function updateData(StoreLokasiArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'parent_id' => isset($validated['parent_id']) && is_numeric($validated['parent_id']) ? (int) $validated['parent_id'] : null,
            'nama' => (string) $validated['nama'],
            'gedung' => isset($validated['gedung']) ? (string) $validated['gedung'] : null,
            'lantai' => isset($validated['lantai']) ? (string) $validated['lantai'] : null,
            'ruangan' => isset($validated['ruangan']) ? (string) $validated['ruangan'] : null,
            'rak' => isset($validated['rak']) ? (string) $validated['rak'] : null,
            'box' => isset($validated['box']) ? (string) $validated['box'] : null,
            'keterangan' => isset($validated['keterangan']) ? (string) $validated['keterangan'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(LokasiArsip $lokasiArsip): int
    {
        return Arsip::withTrashed()->where('lokasi_arsip_id', $lokasiArsip->id)->count();
    }

    /**
     * Build depth map for all lokasi.
     *
     * @param  Collection<int, LokasiArsip>  $all
     * @return array<int, int>
     */
    private function buildDepthMap(Collection $all): array
    {
        $map = [];

        foreach ($all as $item) {
            $map[$item->id] = $this->computeDepth($item, $all, []);
        }

        return $map;
    }

    /**
     * @param  Collection<int, LokasiArsip>  $all
     * @param  array<int, bool>  $visited
     */
    private function computeDepth(LokasiArsip $item, Collection $all, array $visited): int
    {
        if ($item->parent_id === null) {
            return 0;
        }

        if (isset($visited[$item->id])) {
            return 0;
        }

        $visited[$item->id] = true;
        $parent = $all->firstWhere('id', $item->parent_id);

        if ($parent === null) {
            return 1;
        }

        return 1 + $this->computeDepth($parent, $all, $visited);
    }

    /**
     * @param  list<int>  $filteredIds
     * @param  Collection<int, LokasiArsip>  $all
     * @return list<int>
     */
    private function getAncestorIds(array $filteredIds, Collection $all): array
    {
        $ancestors = [];

        foreach ($filteredIds as $id) {
            $item = $all->firstWhere('id', $id);

            while ($item !== null && $item->parent_id !== null) {
                $parent = $all->firstWhere('id', $item->parent_id);

                if ($parent === null) {
                    break;
                }

                $ancestors[] = $parent->id;
                $item = $parent;
            }
        }

        return array_values(array_unique($ancestors));
    }

    /**
     * @param  array<int, int>  $depthMap
     * @return array<string, mixed>
     */
    private function transformLokasi(LokasiArsip $lokasi, array $depthMap): array
    {
        return [
            'id' => $lokasi->id,
            'parent_id' => $lokasi->parent_id,
            'kode' => $lokasi->kode,
            'nama' => $lokasi->nama,
            'gedung' => $lokasi->gedung,
            'lantai' => $lokasi->lantai,
            'ruangan' => $lokasi->ruangan,
            'rak' => $lokasi->rak,
            'box' => $lokasi->box,
            'keterangan' => $lokasi->keterangan,
            'status' => $lokasi->status,
            'depth' => $depthMap[$lokasi->id] ?? 0,
            'has_children' => $lokasi->children->isNotEmpty(),
            'created_at' => AppDateTime::dateTime($lokasi->created_at),
            'updated_at' => AppDateTime::dateTime($lokasi->updated_at),
        ];
    }
}
