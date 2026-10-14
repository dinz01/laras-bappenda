<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKondisiArsipRequest;
use App\Models\KondisiArsip;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class KondisiArsipController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the kondisi arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/kondisi-arsip/index', [
            'kondisiArsips' => $this->paginatedKondisiArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created kondisi arsip.
     */
    public function store(StoreKondisiArsipRequest $request): RedirectResponse
    {
        $kondisiArsip = KondisiArsip::create($this->storeData($request));

        $this->auditLogService->log(
            'master.kondisi-arsip.created',
            $kondisiArsip,
            null,
            ['kode' => $kondisiArsip->kode, 'nama' => $kondisiArsip->nama, 'status' => $kondisiArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Kondisi arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified kondisi arsip.
     */
    public function update(StoreKondisiArsipRequest $request, KondisiArsip $kondisiArsip): RedirectResponse
    {
        $oldValues = ['kode' => $kondisiArsip->kode, 'nama' => $kondisiArsip->nama, 'status' => $kondisiArsip->status];

        $kondisiArsip->update($this->updateData($request));

        $this->auditLogService->log(
            'master.kondisi-arsip.updated',
            $kondisiArsip,
            $oldValues,
            ['kode' => $kondisiArsip->kode, 'nama' => $kondisiArsip->nama, 'status' => $kondisiArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Kondisi arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified kondisi arsip.
     */
    public function destroy(KondisiArsip $kondisiArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($kondisiArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'kondisi_arsip' => "Kondisi arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $oldValues = ['kode' => $kondisiArsip->kode, 'nama' => $kondisiArsip->nama, 'status' => $kondisiArsip->status];

        $kondisiArsip->delete();

        $this->auditLogService->log(
            'master.kondisi-arsip.deleted',
            $kondisiArsip,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Kondisi arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedKondisiArsips(string $search): LengthAwarePaginator
    {
        $kondisiArsips = KondisiArsip::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('kode', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%")
                        ->orWhere('deskripsi', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (KondisiArsip $kondisiArsip): array => [
                'id' => $kondisiArsip->id,
                'kode' => $kondisiArsip->kode,
                'nama' => $kondisiArsip->nama,
                'deskripsi' => $kondisiArsip->deskripsi,
                'status' => $kondisiArsip->status,
                'created_at' => AppDateTime::dateTime($kondisiArsip->created_at),
                'updated_at' => AppDateTime::dateTime($kondisiArsip->updated_at),
            ]);

        return $kondisiArsips;
    }

    /**
     * @return array{total_kondisi_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_kondisi_arsip' => KondisiArsip::count(),
            'aktif' => KondisiArsip::where('status', 'active')->count(),
            'nonaktif' => KondisiArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => KondisiArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * Siapkan data untuk pembuatan kondisi baru.
     * Kode digenerate otomatis jika kosong.
     *
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function storeData(StoreKondisiArsipRequest $request): array
    {
        $validated = $request->validated();

        $kode = isset($validated['kode']) && is_string($validated['kode']) && trim($validated['kode']) !== ''
            ? trim($validated['kode'])
            : KondisiArsip::generateKode();

        return [
            'kode' => $kode,
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * Siapkan data untuk update kondisi yang sudah ada.
     * Kode tidak dapat diubah saat edit.
     *
     * @return array{nama: string, deskripsi: string|null, status: string}
     */
    private function updateData(StoreKondisiArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(KondisiArsip $kondisiArsip): int
    {
        return $kondisiArsip->arsips()->count();
    }
}
