<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKlasifikasiArsipRequest;
use App\Models\KlasifikasiArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class KlasifikasiArsipController extends Controller
{
    /**
     * Display a listing of the klasifikasi arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/klasifikasi-arsip/index', [
            'klasifikasiArsips' => $this->paginatedKlasifikasiArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created klasifikasi arsip.
     */
    public function store(StoreKlasifikasiArsipRequest $request): RedirectResponse
    {
        KlasifikasiArsip::create($this->validatedData($request));

        return back()->with('success', 'Klasifikasi arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified klasifikasi arsip.
     */
    public function update(StoreKlasifikasiArsipRequest $request, KlasifikasiArsip $klasifikasiArsip): RedirectResponse
    {
        $klasifikasiArsip->update($this->validatedData($request));

        return back()->with('success', 'Klasifikasi arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified klasifikasi arsip.
     */
    public function destroy(KlasifikasiArsip $klasifikasiArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($klasifikasiArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'klasifikasi_arsip' => "Klasifikasi arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data arsip.",
            ]);
        }

        $klasifikasiArsip->delete();

        return back()->with('success', 'Klasifikasi arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedKlasifikasiArsips(string $search): LengthAwarePaginator
    {
        return KlasifikasiArsip::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('kode', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%")
                        ->orWhere('deskripsi', 'like', "%{$search}%");
                });
            })
            ->orderBy('kode')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (KlasifikasiArsip $klasifikasiArsip): array => [
                'id' => $klasifikasiArsip->id,
                'kode' => $klasifikasiArsip->kode,
                'nama' => $klasifikasiArsip->nama,
                'deskripsi' => $klasifikasiArsip->deskripsi,
                'retensi_aktif' => $klasifikasiArsip->retensi_aktif,
                'retensi_inaktif' => $klasifikasiArsip->retensi_inaktif,
                'status' => $klasifikasiArsip->status,
                'created_at' => AppDateTime::dateTime($klasifikasiArsip->created_at),
                'updated_at' => AppDateTime::dateTime($klasifikasiArsip->updated_at),
            ]);
    }

    /**
     * @return array{total_klasifikasi_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_klasifikasi_arsip' => KlasifikasiArsip::count(),
            'aktif' => KlasifikasiArsip::where('status', 'active')->count(),
            'nonaktif' => KlasifikasiArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => KlasifikasiArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, deskripsi: string|null, retensi_aktif: int, retensi_inaktif: int, status: string}
     */
    private function validatedData(StoreKlasifikasiArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'retensi_aktif' => (int) $validated['retensi_aktif'],
            'retensi_inaktif' => (int) $validated['retensi_inaktif'],
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(KlasifikasiArsip $klasifikasiArsip): int
    {
        return $klasifikasiArsip->arsips()->count();
    }
}
