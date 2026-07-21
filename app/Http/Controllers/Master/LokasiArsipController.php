<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLokasiArsipRequest;
use App\Models\LokasiArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class LokasiArsipController extends Controller
{
    /**
     * Display a listing of the lokasi arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/lokasi-arsip/index', [
            'lokasiArsips' => $this->paginatedLokasiArsips($search),
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
        LokasiArsip::create($this->validatedData($request));

        return back()->with('success', 'Lokasi arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified lokasi arsip.
     */
    public function update(StoreLokasiArsipRequest $request, LokasiArsip $lokasiArsip): RedirectResponse
    {
        $lokasiArsip->update($this->validatedData($request));

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

        $lokasiArsip->delete();

        return back()->with('success', 'Lokasi arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedLokasiArsips(string $search): LengthAwarePaginator
    {
        $lokasiArsips = LokasiArsip::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('kode', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%")
                        ->orWhere('gedung', 'like', "%{$search}%")
                        ->orWhere('lantai', 'like', "%{$search}%")
                        ->orWhere('ruangan', 'like', "%{$search}%")
                        ->orWhere('rak', 'like', "%{$search}%")
                        ->orWhere('box', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (LokasiArsip $lokasiArsip): array => [
                'id' => $lokasiArsip->id,
                'kode' => $lokasiArsip->kode,
                'nama' => $lokasiArsip->nama,
                'gedung' => $lokasiArsip->gedung,
                'lantai' => $lokasiArsip->lantai,
                'ruangan' => $lokasiArsip->ruangan,
                'rak' => $lokasiArsip->rak,
                'box' => $lokasiArsip->box,
                'keterangan' => $lokasiArsip->keterangan,
                'status' => $lokasiArsip->status,
                'created_at' => AppDateTime::dateTime($lokasiArsip->created_at),
                'updated_at' => AppDateTime::dateTime($lokasiArsip->updated_at),
            ]);

        return $lokasiArsips;
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
     * @return array{kode: string, nama: string, gedung: string|null, lantai: string|null, ruangan: string|null, rak: string|null, box: string|null, keterangan: string|null, status: string}
     */
    private function validatedData(StoreLokasiArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
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
        return 0;
    }
}
