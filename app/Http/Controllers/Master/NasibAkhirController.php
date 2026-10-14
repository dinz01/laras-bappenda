<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNasibAkhirRequest;
use App\Http\Requests\UpdateNasibAkhirRequest;
use App\Models\NasibAkhir;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class NasibAkhirController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the nasib akhir.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/nasib-akhir/index', [
            'nasibAkhirs' => $this->paginatedNasibAkhirs($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created nasib akhir.
     */
    public function store(StoreNasibAkhirRequest $request): RedirectResponse
    {
        $nasibAkhir = NasibAkhir::create($this->storeData($request));

        $this->auditLogService->log(
            'master.nasib-akhir.created',
            $nasibAkhir,
            null,
            ['kode' => $nasibAkhir->kode, 'nama' => $nasibAkhir->nama, 'status' => $nasibAkhir->status],
            auth()->user(),
        );

        return back()->with('success', 'Nasib akhir berhasil ditambahkan.');
    }

    /**
     * Update the specified nasib akhir.
     */
    public function update(UpdateNasibAkhirRequest $request, NasibAkhir $nasibAkhir): RedirectResponse
    {
        $oldValues = ['kode' => $nasibAkhir->kode, 'nama' => $nasibAkhir->nama, 'status' => $nasibAkhir->status];

        $nasibAkhir->update($this->updateData($request, $nasibAkhir));

        $this->auditLogService->log(
            'master.nasib-akhir.updated',
            $nasibAkhir,
            $oldValues,
            ['kode' => $nasibAkhir->kode, 'nama' => $nasibAkhir->nama, 'status' => $nasibAkhir->status],
            auth()->user(),
        );

        return back()->with('success', 'Nasib akhir berhasil diperbarui.');
    }

    /**
     * Remove the specified nasib akhir.
     */
    public function destroy(NasibAkhir $nasibAkhir): RedirectResponse
    {
        $usageCount = $this->usageCount($nasibAkhir);

        if ($usageCount > 0) {
            return back()->withErrors([
                'nasib_akhir' => "Nasib akhir tidak dapat dihapus karena masih digunakan oleh {$usageCount} data klasifikasi arsip.",
            ]);
        }

        $oldValues = ['kode' => $nasibAkhir->kode, 'nama' => $nasibAkhir->nama, 'status' => $nasibAkhir->status];

        $nasibAkhir->delete();

        $this->auditLogService->log(
            'master.nasib-akhir.deleted',
            $nasibAkhir,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Nasib akhir berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedNasibAkhirs(string $search): LengthAwarePaginator
    {
        return NasibAkhir::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('kode', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (NasibAkhir $nasibAkhir): array => [
                'id' => $nasibAkhir->id,
                'kode' => $nasibAkhir->kode,
                'nama' => $nasibAkhir->nama,
                'keterangan' => $nasibAkhir->keterangan,
                'status' => $nasibAkhir->status,
                'created_at' => AppDateTime::dateTime($nasibAkhir->created_at),
                'updated_at' => AppDateTime::dateTime($nasibAkhir->updated_at),
            ]);
    }

    /**
     * @return array{total_nasib_akhir: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_nasib_akhir' => NasibAkhir::count(),
            'aktif' => NasibAkhir::where('status', 'active')->count(),
            'nonaktif' => NasibAkhir::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => NasibAkhir::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, keterangan: string|null, status: string}
     */
    private function storeData(StoreNasibAkhirRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => NasibAkhir::generateKode(),
            'nama' => (string) $validated['nama'],
            'keterangan' => isset($validated['keterangan']) ? (string) $validated['keterangan'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * @return array{nama: string, keterangan: string|null, status: string}
     */
    private function updateData(UpdateNasibAkhirRequest $request, NasibAkhir $nasibAkhir): array
    {
        $validated = $request->validated();

        return [
            'kode' => $nasibAkhir->kode,
            'nama' => (string) $validated['nama'],
            'keterangan' => isset($validated['keterangan']) ? (string) $validated['keterangan'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(NasibAkhir $nasibAkhir): int
    {
        return $nasibAkhir->klasifikasiArsip()->count();
    }
}
