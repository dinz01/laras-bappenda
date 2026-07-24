<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRetensiArsipRequest;
use App\Models\MetodePenyusutanArsip;
use App\Models\RetensiArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class RetensiArsipController extends Controller
{
    /**
     * Display a listing of the retensi arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/retensi-arsip/index', [
            'retensiArsips' => $this->paginatedRetensiArsips($search),
            'metodePenyusutanArsips' => MetodePenyusutanArsip::active()->get(['id', 'kode', 'nama']),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created retensi arsip.
     */
    public function store(StoreRetensiArsipRequest $request): RedirectResponse
    {
        RetensiArsip::create($this->validatedData($request));

        return back()->with('success', 'Retensi arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified retensi arsip.
     */
    public function update(StoreRetensiArsipRequest $request, RetensiArsip $retensiArsip): RedirectResponse
    {
        $retensiArsip->update($this->validatedData($request));

        return back()->with('success', 'Retensi arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified retensi arsip.
     */
    public function destroy(RetensiArsip $retensiArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($retensiArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'retensi_arsip' => "Retensi arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data klasifikasi arsip.",
            ]);
        }

        $retensiArsip->delete();

        return back()->with('success', 'Retensi arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedRetensiArsips(string $search): LengthAwarePaginator
    {
        $retensiArsips = RetensiArsip::query()
            ->with('metodePenyusutanArsip')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('kode', 'like', "%{$search}%")
                        ->orWhere('nama', 'like', "%{$search}%")
                        ->orWhere('nasib_akhir', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%");
                });
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (RetensiArsip $retensiArsip): array => [
                'id' => $retensiArsip->id,
                'kode' => $retensiArsip->kode,
                'nama' => $retensiArsip->nama,
                'retensi_aktif' => $retensiArsip->retensi_aktif,
                'retensi_inaktif' => $retensiArsip->retensi_inaktif,
                'nasib_akhir' => $retensiArsip->nasib_akhir,
                'metode_penyusutan_arsip_id' => $retensiArsip->metode_penyusutan_arsip_id,
                'metode_penyusutan_arsip' => $retensiArsip->metodePenyusutanArsip ? [
                    'id' => $retensiArsip->metodePenyusutanArsip->id,
                    'kode' => $retensiArsip->metodePenyusutanArsip->kode,
                    'nama' => $retensiArsip->metodePenyusutanArsip->nama,
                ] : null,
                'keterangan' => $retensiArsip->keterangan,
                'status' => $retensiArsip->status,
                'created_at' => AppDateTime::dateTime($retensiArsip->created_at),
                'updated_at' => AppDateTime::dateTime($retensiArsip->updated_at),
            ]);

        return $retensiArsips;
    }

    /**
     * @return array{total_retensi_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_retensi_arsip' => RetensiArsip::count(),
            'aktif' => RetensiArsip::where('status', 'active')->count(),
            'nonaktif' => RetensiArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => RetensiArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, retensi_aktif: int, retensi_inaktif: int, nasib_akhir: string|null, metode_penyusutan_arsip_id: int|null, keterangan: string|null, status: string}
     */
    private function validatedData(StoreRetensiArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'retensi_aktif' => (int) $validated['retensi_aktif'],
            'retensi_inaktif' => (int) $validated['retensi_inaktif'],
            'nasib_akhir' => isset($validated['nasib_akhir']) ? (string) $validated['nasib_akhir'] : null,
            'metode_penyusutan_arsip_id' => isset($validated['metode_penyusutan_arsip_id']) ? (int) $validated['metode_penyusutan_arsip_id'] : null,
            'keterangan' => isset($validated['keterangan']) ? (string) $validated['keterangan'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(RetensiArsip $retensiArsip): int
    {
        return $retensiArsip->klasifikasiArsip()->count();
    }
}
