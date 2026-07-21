<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStatusArsipRequest;
use App\Models\StatusArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class StatusArsipController extends Controller
{
    /**
     * Display a listing of the status arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/status-arsip/index', [
            'statusArsips' => $this->paginatedStatusArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created status arsip.
     */
    public function store(StoreStatusArsipRequest $request): RedirectResponse
    {
        StatusArsip::create($this->validatedData($request));

        return back()->with('success', 'Status arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified status arsip.
     */
    public function update(StoreStatusArsipRequest $request, StatusArsip $statusArsip): RedirectResponse
    {
        $statusArsip->update($this->validatedData($request));

        return back()->with('success', 'Status arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified status arsip.
     */
    public function destroy(StatusArsip $statusArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($statusArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'status_arsip' => "Status arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $statusArsip->delete();

        return back()->with('success', 'Status arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedStatusArsips(string $search): LengthAwarePaginator
    {
        $statusArsips = StatusArsip::query()
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
            ->through(fn (StatusArsip $statusArsip): array => [
                'id' => $statusArsip->id,
                'kode' => $statusArsip->kode,
                'nama' => $statusArsip->nama,
                'deskripsi' => $statusArsip->deskripsi,
                'status' => $statusArsip->status,
                'created_at' => AppDateTime::dateTime($statusArsip->created_at),
                'updated_at' => AppDateTime::dateTime($statusArsip->updated_at),
            ]);

        return $statusArsips;
    }

    /**
     * @return array{total_status_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_status_arsip' => StatusArsip::count(),
            'aktif' => StatusArsip::where('status', 'active')->count(),
            'nonaktif' => StatusArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => StatusArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function validatedData(StoreStatusArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(StatusArsip $statusArsip): int
    {
        return 0;
    }
}
