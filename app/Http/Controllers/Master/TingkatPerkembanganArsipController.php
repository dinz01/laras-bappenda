<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTingkatPerkembanganArsipRequest;
use App\Models\TingkatPerkembanganArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TingkatPerkembanganArsipController extends Controller
{
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
        TingkatPerkembanganArsip::create($this->validatedData($request));

        return back()->with('success', 'Tingkat perkembangan arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified tingkat perkembangan arsip.
     */
    public function update(StoreTingkatPerkembanganArsipRequest $request, TingkatPerkembanganArsip $tingkatPerkembanganArsip): RedirectResponse
    {
        $tingkatPerkembanganArsip->update($this->validatedData($request));

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

        $tingkatPerkembanganArsip->delete();

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
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function validatedData(StoreTingkatPerkembanganArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(TingkatPerkembanganArsip $tingkatPerkembanganArsip): int
    {
        return 0;
    }
}
