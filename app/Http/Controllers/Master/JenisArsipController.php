<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJenisArsipRequest;
use App\Http\Requests\UpdateJenisArsipRequest;
use App\Models\JenisArsip;
use App\Services\AuditLogService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class JenisArsipController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the jenis arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/jenis-arsip/index', [
            'jenisArsips' => $this->paginatedJenisArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created jenis arsip.
     */
    public function store(StoreJenisArsipRequest $request): RedirectResponse
    {
        $jenisArsip = JenisArsip::create($this->storeData($request));

        $this->auditLogService->log(
            'master.jenis-arsip.created',
            $jenisArsip,
            null,
            ['kode' => $jenisArsip->kode, 'nama' => $jenisArsip->nama, 'status' => $jenisArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Jenis arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified jenis arsip.
     */
    public function update(UpdateJenisArsipRequest $request, JenisArsip $jenisArsip): RedirectResponse
    {
        $oldValues = ['kode' => $jenisArsip->kode, 'nama' => $jenisArsip->nama, 'status' => $jenisArsip->status];

        $jenisArsip->update($this->updateData($request));

        $this->auditLogService->log(
            'master.jenis-arsip.updated',
            $jenisArsip,
            $oldValues,
            ['kode' => $jenisArsip->kode, 'nama' => $jenisArsip->nama, 'status' => $jenisArsip->status],
            auth()->user(),
        );

        return back()->with('success', 'Jenis arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified jenis arsip.
     */
    public function destroy(JenisArsip $jenisArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($jenisArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'jenis_arsip' => "Jenis arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $oldValues = ['kode' => $jenisArsip->kode, 'nama' => $jenisArsip->nama, 'status' => $jenisArsip->status];

        $jenisArsip->delete();

        $this->auditLogService->log(
            'master.jenis-arsip.deleted',
            $jenisArsip,
            $oldValues,
            null,
            auth()->user(),
        );

        return back()->with('success', 'Jenis arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedJenisArsips(string $search): LengthAwarePaginator
    {
        $jenisArsips = JenisArsip::query()
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
            ->through(fn (JenisArsip $jenisArsip): array => [
                'id' => $jenisArsip->id,
                'kode' => $jenisArsip->kode,
                'nama' => $jenisArsip->nama,
                'deskripsi' => $jenisArsip->deskripsi,
                'status' => $jenisArsip->status,
                'created_at' => AppDateTime::dateTime($jenisArsip->created_at),
                'updated_at' => AppDateTime::dateTime($jenisArsip->updated_at),
            ]);

        return $jenisArsips;
    }

    /**
     * @return array{total_jenis_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_jenis_arsip' => JenisArsip::count(),
            'aktif' => JenisArsip::where('status', 'active')->count(),
            'nonaktif' => JenisArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => JenisArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * Siapkan data untuk pembuatan jenis arsip baru.
     * Kode digenerate otomatis jika kosong.
     *
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function storeData(StoreJenisArsipRequest $request): array
    {
        $validated = $request->validated();

        $kode = isset($validated['kode']) && is_string($validated['kode']) && trim($validated['kode']) !== ''
            ? trim($validated['kode'])
            : JenisArsip::generateKode();

        return [
            'kode' => $kode,
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    /**
     * Siapkan data untuk update jenis arsip.
     * Kode tidak dapat diubah saat edit.
     *
     * @return array{nama: string, deskripsi: string|null, status: string}
     */
    private function updateData(UpdateJenisArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(JenisArsip $jenisArsip): int
    {
        return $jenisArsip->arsip()->count();
    }
}
