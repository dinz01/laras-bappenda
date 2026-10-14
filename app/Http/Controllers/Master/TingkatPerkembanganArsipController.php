<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTingkatPerkembanganArsipRequest;
use App\Models\TingkatPerkembanganArsip;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TingkatPerkembanganArsipController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the tingkat perkembangan arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/tingkat-perkembangan-arsip/index', [
            'tingkatPerkembanganArsips' => $this->paginatedTingkatPerkembanganArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created tingkat perkembangan arsip.
     */
    public function store(StoreTingkatPerkembanganArsipRequest $request): RedirectResponse
    {
        $tingkatPerkembanganArsip = TingkatPerkembanganArsip::create($this->storeData($request));

        $this->auditLogService->log(
            'master.tingkat-perkembangan-arsip.created',
            $tingkatPerkembanganArsip,
            null,
            ['kode' => $tingkatPerkembanganArsip->kode, 'nama' => $tingkatPerkembanganArsip->nama, 'status' => $tingkatPerkembanganArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Tingkat perkembangan arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified tingkat perkembangan arsip.
     */
    public function update(StoreTingkatPerkembanganArsipRequest $request, TingkatPerkembanganArsip $tingkatPerkembanganArsip): RedirectResponse
    {
        $oldValues = ['kode' => $tingkatPerkembanganArsip->kode, 'nama' => $tingkatPerkembanganArsip->nama, 'status' => $tingkatPerkembanganArsip->status];

        $tingkatPerkembanganArsip->update($this->updateData($request));

        $this->auditLogService->log(
            'master.tingkat-perkembangan-arsip.updated',
            $tingkatPerkembanganArsip,
            $oldValues,
            ['kode' => $tingkatPerkembanganArsip->kode, 'nama' => $tingkatPerkembanganArsip->nama, 'status' => $tingkatPerkembanganArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Tingkat perkembangan arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified tingkat perkembangan arsip.
     */
    public function destroy(TingkatPerkembanganArsip $tingkatPerkembanganArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($tingkatPerkembanganArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'tingkat_perkembangan_arsip' => "Tingkat perkembangan arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $oldValues = ['kode' => $tingkatPerkembanganArsip->kode, 'nama' => $tingkatPerkembanganArsip->nama, 'status' => $tingkatPerkembanganArsip->status];

        $tingkatPerkembanganArsip->delete();

        $this->auditLogService->log(
            'master.tingkat-perkembangan-arsip.deleted',
            $tingkatPerkembanganArsip,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Tingkat perkembangan arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedTingkatPerkembanganArsips(string $search): LengthAwarePaginator
    {
        $tingkatPerkembanganArsips = TingkatPerkembanganArsip::query()
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
            ->through(fn (TingkatPerkembanganArsip $tingkatPerkembanganArsip): array => [
                'id' => $tingkatPerkembanganArsip->id,
                'kode' => $tingkatPerkembanganArsip->kode,
                'nama' => $tingkatPerkembanganArsip->nama,
                'deskripsi' => $tingkatPerkembanganArsip->deskripsi,
                'status' => $tingkatPerkembanganArsip->status,
                'created_at' => AppDateTime::dateTime($tingkatPerkembanganArsip->created_at),
                'updated_at' => AppDateTime::dateTime($tingkatPerkembanganArsip->updated_at),
            ]);

        return $tingkatPerkembanganArsips;
    }

    /**
     * @return array{total_tingkat_perkembangan_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_tingkat_perkembangan_arsip' => TingkatPerkembanganArsip::count(),
            'aktif' => TingkatPerkembanganArsip::where('status', 'active')->count(),
            'nonaktif' => TingkatPerkembanganArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => TingkatPerkembanganArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * Siapkan data untuk pembuatan tingkat perkembangan baru.
     * Kode digenerate otomatis jika kosong.
     *
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function storeData(StoreTingkatPerkembanganArsipRequest $request): array
    {
        $validated = $request->validated();

        $kode = isset($validated['kode']) && is_string($validated['kode']) && trim($validated['kode']) !== ''
            ? trim($validated['kode'])
            : TingkatPerkembanganArsip::generateKode();

        return [
            'kode' => $kode,
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * Siapkan data untuk update tingkat perkembangan yang sudah ada.
     * Kode tidak dapat diubah saat edit.
     *
     * @return array{nama: string, deskripsi: string|null, status: string}
     */
    private function updateData(StoreTingkatPerkembanganArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(TingkatPerkembanganArsip $tingkatPerkembanganArsip): int
    {
        return $tingkatPerkembanganArsip->arsips()->count();
    }
}
