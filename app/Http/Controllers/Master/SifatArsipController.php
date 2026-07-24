<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSifatArsipRequest;
use App\Models\SifatArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SifatArsipController extends Controller
{
    /**
     * Display a listing of the sifat arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/sifat-arsip/index', [
            'sifatArsips' => $this->paginatedSifatArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created sifat arsip.
     */
    public function store(StoreSifatArsipRequest $request): RedirectResponse
    {
        SifatArsip::create($this->validatedData($request));

        return back()->with('success', 'Sifat arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified sifat arsip.
     */
    public function update(StoreSifatArsipRequest $request, SifatArsip $sifatArsip): RedirectResponse
    {
        $sifatArsip->update($this->validatedData($request));

        return back()->with('success', 'Sifat arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified sifat arsip.
     */
    public function destroy(SifatArsip $sifatArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($sifatArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'sifat_arsip' => "Sifat arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $sifatArsip->delete();

        return back()->with('success', 'Sifat arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedSifatArsips(string $search): LengthAwarePaginator
    {
        $sifatArsips = SifatArsip::query()
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
            ->through(fn (SifatArsip $sifatArsip): array => [
                'id' => $sifatArsip->id,
                'kode' => $sifatArsip->kode,
                'nama' => $sifatArsip->nama,
                'deskripsi' => $sifatArsip->deskripsi,
                'status' => $sifatArsip->status,
                'created_at' => AppDateTime::dateTime($sifatArsip->created_at),
                'updated_at' => AppDateTime::dateTime($sifatArsip->updated_at),
            ]);

        return $sifatArsips;
    }

    /**
     * @return array{total_sifat_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_sifat_arsip' => SifatArsip::count(),
            'aktif' => SifatArsip::where('status', 'active')->count(),
            'nonaktif' => SifatArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => SifatArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function validatedData(StoreSifatArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(SifatArsip $sifatArsip): int
    {
        return $sifatArsip->arsips()->count();
    }
}
