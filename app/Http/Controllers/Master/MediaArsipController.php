<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaArsipRequest;
use App\Models\MediaArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class MediaArsipController extends Controller
{
    /**
     * Display a listing of the media arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('master/media-arsip/index', [
            'mediaArsips' => $this->paginatedMediaArsips($search),
            'stats' => $this->statistics(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created media arsip.
     */
    public function store(StoreMediaArsipRequest $request): RedirectResponse
    {
        MediaArsip::create($this->validatedData($request));

        return back()->with('success', 'Media arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified media arsip.
     */
    public function update(StoreMediaArsipRequest $request, MediaArsip $mediaArsip): RedirectResponse
    {
        $mediaArsip->update($this->validatedData($request));

        return back()->with('success', 'Media arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified media arsip.
     */
    public function destroy(MediaArsip $mediaArsip): RedirectResponse
    {
        $usageCount = $this->usageCount($mediaArsip);

        if ($usageCount > 0) {
            return back()->withErrors([
                'media_arsip' => "Media arsip tidak dapat dihapus karena masih digunakan oleh {$usageCount} data.",
            ]);
        }

        $mediaArsip->delete();

        return back()->with('success', 'Media arsip berhasil dihapus.');
    }

    /**
     * @return LengthAwarePaginator<int, mixed>
     */
    private function paginatedMediaArsips(string $search): LengthAwarePaginator
    {
        $mediaArsips = MediaArsip::query()
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
            ->through(fn (MediaArsip $mediaArsip): array => [
                'id' => $mediaArsip->id,
                'kode' => $mediaArsip->kode,
                'nama' => $mediaArsip->nama,
                'deskripsi' => $mediaArsip->deskripsi,
                'status' => $mediaArsip->status,
                'created_at' => AppDateTime::dateTime($mediaArsip->created_at),
                'updated_at' => AppDateTime::dateTime($mediaArsip->updated_at),
            ]);

        return $mediaArsips;
    }

    /**
     * @return array{total_media_arsip: int, aktif: int, nonaktif: int, dibuat_bulan_ini: int}
     */
    private function statistics(): array
    {
        $now = Carbon::now((string) config('app.timezone'));
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return [
            'total_media_arsip' => MediaArsip::count(),
            'aktif' => MediaArsip::where('status', 'active')->count(),
            'nonaktif' => MediaArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => MediaArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];
    }

    /**
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function validatedData(StoreMediaArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }

    private function usageCount(MediaArsip $mediaArsip): int
    {
        return 0;
    }
}
