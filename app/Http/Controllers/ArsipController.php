<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArsipRequest;
use App\Http\Requests\UpdateArsipRequest;
use App\Models\Arsip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArsipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Arsip::class);

        $arsips = Arsip::with([
            'klasifikasiArsip',
            'lokasiArsip',
            'statusArsip',
            'unitOrganisasi',
        ])->paginate(10);

        return Inertia::render('arsip/index', [
            'arsips' => $arsips,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Arsip::class);

        return Inertia::render('arsip/create');
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
