<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKategoriArsipRequest;
use App\Http\Requests\UpdateKategoriArsipRequest;
use App\Models\KategoriArsip;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class KategoriArsipController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the kategori arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/kategori-arsip/index', [
            'kategoriArsips' => $this->paginatedKategoriArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created kategori arsip.
     */
    public function store(StoreKategoriArsipRequest $request): RedirectResponse
    {
        $kategoriArsip = KategoriArsip::create($this->storeData($request));

        $this->auditLogService->log(
            'master.kategori-arsip.created',
            $kategoriArsip,
            null,
            ['kode' => $kategoriArsip->kode, 'nama' => $kategoriArsip->nama, 'status' => $kategoriArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Kategori arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified kategori arsip.
     */
    public function update(UpdateKategoriArsipRequest $request, KategoriArsip $kategoriArsip): RedirectResponse
    {
        $oldValues = ['kode' => $kategoriArsip->kode, 'nama' => $kategoriArsip->nama, 'status' => $kategoriArsip->status];

        $kategoriArsip->update($this->updateData($request));

        $this->auditLogService->log(
            'master.kategori-arsip.updated',
            $kategoriArsip,
            $oldValues,
            ['kode' => $kategoriArsip->kode, 'nama' => $kategoriArsip->nama, 'status' => $kategoriArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Kategori arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified kategori arsip.
     */
    public function destroy(KategoriArsip $kategoriArsip): RedirectResponse
    {
        $oldValues = ['kode' => $kategoriArsip->kode, 'nama' => $kategoriArsip->nama, 'status' => $kategoriArsip->status];

        $kategoriArsip->delete();

        $this->auditLogService->log(
            'master.kategori-arsip.deleted',
            $kategoriArsip,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Kategori arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedKategoriArsips(string $search): LengthAwarePaginator
    {
        return KategoriArsip::query()
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
            ->through(fn (KategoriArsip $kategoriArsip): array => [
                'id' => $kategoriArsip->id,
                'kode' => $kategoriArsip->kode,
                'nama' => $kategoriArsip->nama,
                'deskripsi' => $kategoriArsip->deskripsi,
                'status' => $kategoriArsip->status,
                'created_at' => AppDateTime::dateTime($kategoriArsip->created_at),
                'updated_at' => AppDateTime::dateTime($kategoriArsip->updated_at),
            ]);
    }

    /**
     * @return array{total_kategori_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_kategori_arsip' => KategoriArsip::count(),
            'aktif' => KategoriArsip::where('status', 'active')->count(),
            'nonaktif' => KategoriArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => KategoriArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * Siapkan data untuk pembuatan kategori baru.
     * Kode digenerate otomatis jika kosong.
     *
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function storeData(StoreKategoriArsipRequest $request): array
    {
        $validated = $request->validated();

        $kode = isset($validated['kode']) && is_string($validated['kode']) && trim($validated['kode']) !== ''
            ? trim($validated['kode'])
            : KategoriArsip::generateKode();

        return [
            'kode' => $kode,
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * Siapkan data untuk update kategori yang sudah ada.
     * Kode tidak dapat diubah saat edit.
     *
     * @return array{nama: string, deskripsi: string|null, status: string}
     */
    private function updateData(UpdateKategoriArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }
}
