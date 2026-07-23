<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMetodePenyusutanArsipRequest;
use App\Models\MetodePenyusutanArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class MetodePenyusutanArsipController extends Controller
{
    /**
     * Display a listing of the metode penyusutan arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/metode-penyusutan-arsip/index', [
            'metodePenyusutanArsips' => $this->paginatedMetodePenyusutanArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created metode penyusutan arsip.
     */
    public function store(StoreMetodePenyusutanArsipRequest $request): RedirectResponse
    {
        MetodePenyusutanArsip::create($this->validatedData($request));

        return back()->with('success', 'Metode penyusutan arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified metode penyusutan arsip.
     */
    public function update(StoreMetodePenyusutanArsipRequest $request, MetodePenyusutanArsip $metodePenyusutanArsip): RedirectResponse
    {
        $metodePenyusutanArsip->update($this->validatedData($request));

        return back()->with('success', 'Metode penyusutan arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified metode penyusutan arsip.
     */
    public function destroy(MetodePenyusutanArsip $metodePenyusutanArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($metodePenyusutanArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'metode_penyusutan_arsip' => "Metode penyusutan arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $metodePenyusutanArsip->delete();

        return back()->with('success', 'Metode penyusutan arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedMetodePenyusutanArsips(string $search): LengthAwarePaginator
    {
        $metodePenyusutanArsips = MetodePenyusutanArsip::query()
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
            ->through(fn (MetodePenyusutanArsip $metodePenyusutanArsip): array => [
                'id' => $metodePenyusutanArsip->id,
                'kode' => $metodePenyusutanArsip->kode,
                'nama' => $metodePenyusutanArsip->nama,
                'deskripsi' => $metodePenyusutanArsip->deskripsi,
                'status' => $metodePenyusutanArsip->status,
                'created_at' => AppDateTime::dateTime($metodePenyusutanArsip->created_at),
                'updated_at' => AppDateTime::dateTime($metodePenyusutanArsip->updated_at),
            ]);

        return $metodePenyusutanArsips;
    }

    /**
     * @return array{total_metode_penyusutan_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}StoreJabatanRequest
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_metode_penyusutan_arsip' => MetodePenyusutanArsip::count(),
            'aktif' => MetodePenyusutanArsip::where('status', 'active')->count(),
            'nonaktif' => MetodePenyusutanArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => MetodePenyusutanArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function validatedData(StoreMetodePenyusutanArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(MetodePenyusutanArsip $metodePenyusutanArsip): int
    {
        return 0;
    }
}
