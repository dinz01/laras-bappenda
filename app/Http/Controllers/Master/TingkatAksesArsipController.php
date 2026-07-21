<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTingkatAksesArsipRequest;
use App\Models\TingkatAksesArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TingkatAksesArsipController extends Controller
{
    /**
     * Display a listing of the tingkat akses arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/tingkat-akses-arsip/index', [
            'tingkatAksesArsips' => $this->paginatedTingkatAksesArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created tingkat akses arsip.
     */
    public function store(StoreTingkatAksesArsipRequest $request): RedirectResponse
    {
        TingkatAksesArsip::create($this->validatedData($request));

        return back()->with('success', 'Tingkat akses arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified tingkat akses arsip.
     */
    public function update(StoreTingkatAksesArsipRequest $request, TingkatAksesArsip $tingkatAksesArsip): RedirectResponse
    {
        $tingkatAksesArsip->update($this->validatedData($request));

        return back()->with('success', 'Tingkat akses arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified tingkat akses arsip.
     */
    public function destroy(TingkatAksesArsip $tingkatAksesArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($tingkatAksesArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'tingkat_akses_arsip' => "Tingkat akses arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $tingkatAksesArsip->delete();

        return back()->with('success', 'Tingkat akses arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedTingkatAksesArsips(string $search): LengthAwarePaginator
    {
        $tingkatAksesArsips = TingkatAksesArsip::query()
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
            ->through(fn (TingkatAksesArsip $tingkatAksesArsip): array => [
                'id' => $tingkatAksesArsip->id,
                'kode' => $tingkatAksesArsip->kode,
                'nama' => $tingkatAksesArsip->nama,
                'deskripsi' => $tingkatAksesArsip->deskripsi,
                'status' => $tingkatAksesArsip->status,
                'created_at' => AppDateTime::dateTime($tingkatAksesArsip->created_at),
                'updated_at' => AppDateTime::dateTime($tingkatAksesArsip->updated_at),
            ]);

        return $tingkatAksesArsips;
    }

    /**
     * @return array{total_tingkat_akses_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_tingkat_akses_arsip' => TingkatAksesArsip::count(),
            'aktif' => TingkatAksesArsip::where('status', 'active')->count(),
            'nonaktif' => TingkatAksesArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => TingkatAksesArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function validatedData(StoreTingkatAksesArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(TingkatAksesArsip $tingkatAksesArsip): int
    {
        return 0;
    }
}
