<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJenisArsipRequest;
use App\Models\JenisArsip;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class JenisArsipController extends Controller
{
    /**
     * Display a listing of the jenis arsip.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

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

        $startOfMonth = Carbon::now((string) config('app.timezone'))->startOfMonth();
        $endOfMonth = Carbon::now((string) config('app.timezone'))->endOfMonth();

        $stats = [
            'total_jenis_arsip' => JenisArsip::count(),
            'aktif' => JenisArsip::where('status', 'active')->count(),
            'nonaktif' => JenisArsip::where('status', 'inactive')->count(),
            'dibuat_bulan_ini' => JenisArsip::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
        ];

        return Inertia::render('master/jenis-arsip/index', [
            'jenisArsips' => $jenisArsips,
            'stats' => $stats,
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
        JenisArsip::create($this->validatedData($request));

        return back()->with('success', 'Jenis arsip berhasil ditambahkan.');
    }

    /**
     * Update the specified jenis arsip.
     */
    public function update(StoreJenisArsipRequest $request, JenisArsip $jenisArsip): RedirectResponse
    {
        $jenisArsip->update($this->validatedData($request));

        return back()->with('success', 'Jenis arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified jenis arsip.
     */
    public function destroy(JenisArsip $jenisArsip): RedirectResponse
    {
        $jenisArsip->delete();

        return back()->with('success', 'Jenis arsip berhasil dihapus.');
    }

    /**
     * @return array{kode: string, nama: string, deskripsi: string|null, status: string}
     */
    private function validatedData(StoreJenisArsipRequest $request): array
    {
        $validated = $request->validated();

        return [
            'kode' => (string) $validated['kode'],
            'nama' => (string) $validated['nama'],
            'deskripsi' => isset($validated['deskripsi']) ? (string) $validated['deskripsi'] : null,
            'status' => (string) $validated['status'],
        ];
    }
}
