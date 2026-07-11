<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArsipRequest;
use App\Http\Requests\UpdateArsipRequest;
use App\Models\Arsip;
use App\Models\JenisDokumen;
use App\Models\KlasifikasiArsip;
use App\Models\LokasiArsip;
use App\Models\StatusArsip;
use App\Models\UnitOrganisasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArsipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Arsip::class);

        $query = Arsip::query()->with([
            'klasifikasiArsip',
            'lokasiArsip',
            'statusArsip',
            'unitOrganisasi',
        ]);

        // Search
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_arsip', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%")
                    ->orWhereHas('klasifikasiArsip', function ($qk) use ($search) {
                        $qk->where('kode', 'like', "%{$search}%")
                            ->orWhere('nama', 'like', "%{$search}%");
                    });
            });
        }

        // Filters
        if ($request->has('status_arsip_id') && ! empty($request->status_arsip_id)) {
            $query->where('status_arsip_id', $request->status_arsip_id);
        }

        if ($request->has('unit_organisasi_id') && ! empty($request->unit_organisasi_id)) {
            $query->where('unit_organisasi_id', $request->unit_organisasi_id);
        }

        if ($request->has('klasifikasi_arsip_id') && ! empty($request->klasifikasi_arsip_id)) {
            $query->where('klasifikasi_arsip_id', $request->klasifikasi_arsip_id);
        }

        $arsips = $query->paginate(10)->withQueryString();

        // Master lists for filters
        $klasifikasis = KlasifikasiArsip::active()->get(['id', 'kode', 'nama']);
        $unitOrganisasis = UnitOrganisasi::active()->get(['id', 'kode', 'nama']);
        $statusArsips = StatusArsip::active()->get(['id', 'kode', 'nama']);

        return Inertia::render('arsip/index', [
            'arsips' => $arsips,
            'klasifikasis' => $klasifikasis,
            'unitOrganisasis' => $unitOrganisasis,
            'statusArsips' => $statusArsips,
            'filters' => $request->only(['search', 'status_arsip_id', 'unit_organisasi_id', 'klasifikasi_arsip_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Arsip::class);

        return Inertia::render('arsip/create', [
            'klasifikasis' => KlasifikasiArsip::active()->get(['id', 'kode', 'nama']),
            'jenisDokumens' => JenisDokumen::active()->get(['id', 'kode', 'nama']),
            'unitOrganisasis' => UnitOrganisasi::active()->get(['id', 'kode', 'nama']),
            'lokasiArsips' => LokasiArsip::active()->get(['id', 'kode', 'nama']),
            'statusArsips' => StatusArsip::active()->get(['id', 'kode', 'nama']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreArsipRequest $request): RedirectResponse
    {
        Gate::authorize('create', Arsip::class);

        $validated = $request->validated();

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('arsip');
            $validated['file_path'] = $path;
        }

        $validated['created_by'] = auth()->id();

        Arsip::create($validated);

        return redirect()->route('arsip.index')
            ->with('success', 'Arsip berhasil disimpan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Arsip $arsip): Response
    {
        Gate::authorize('view', $arsip);

        $arsip->load([
            'klasifikasiArsip',
            'lokasiArsip',
            'jenisDokumen',
            'mediaArsip',
            'kondisiArsip',
            'statusArsip',
            'tingkatAksesArsip',
            'retensiArsip',
            'unitOrganisasi',
            'creator',
        ]);

        return Inertia::render('arsip/show', [
            'arsip' => $arsip,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Arsip $arsip): Response
    {
        Gate::authorize('update', $arsip);

        return Inertia::render('arsip/edit', [
            'arsip' => $arsip,
            'klasifikasis' => KlasifikasiArsip::active()->get(['id', 'kode', 'nama']),
            'jenisDokumens' => JenisDokumen::active()->get(['id', 'kode', 'nama']),
            'unitOrganisasis' => UnitOrganisasi::active()->get(['id', 'kode', 'nama']),
            'lokasiArsips' => LokasiArsip::active()->get(['id', 'kode', 'nama']),
            'statusArsips' => StatusArsip::active()->get(['id', 'kode', 'nama']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateArsipRequest $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $validated = $request->validated();

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($arsip->file_path) {
                Storage::delete($arsip->file_path);
            }
            $path = $request->file('file')->store('arsip');
            $validated['file_path'] = $path;
        }

        $arsip->update($validated);

        return redirect()->route('arsip.show', $arsip)
            ->with('success', 'Arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Arsip $arsip): RedirectResponse
    {
        Gate::authorize('delete', $arsip);

        $arsip->delete();

        return redirect()->route('arsip.index')
            ->with('success', 'Arsip berhasil dihapus.');
    }
}
