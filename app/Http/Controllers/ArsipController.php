<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArsipRequest;
use App\Http\Requests\UpdateArsipRequest;
use App\Interfaces\SearchServiceInterface;
use App\Models\Arsip;
use App\Models\DokumenArsipVersion;
use App\Models\JenisDokumen;
use App\Models\KlasifikasiArsip;
use App\Models\LokasiArsip;
use App\Models\StatusArsip;
use App\Models\UnitOrganisasi;
use App\Services\DocumentVersionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArsipController extends Controller
{
    public function __construct(
        protected DocumentVersionService $documentVersionService,
        protected SearchServiceInterface $searchService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Arsip::class);

        $query = $this->searchService->advancedSearch($request->all());

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
            'filters' => $request->only(['search', 'status_arsip_id', 'unit_organisasi_id', 'klasifikasi_arsip_id', 'tahun']),
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
        $validated['created_by'] = auth()->id();

        $arsip = Arsip::create($validated);

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $originalName = $uploadedFile->getClientOriginalName();
            $extension = $uploadedFile->getClientOriginalExtension();
            $generatedName = Str::uuid().'.'.$extension;
            $path = $uploadedFile->storeAs('archives', $generatedName, 'local');

            if ($path === false) {
                abort(500, 'Gagal menyimpan file ke storage.');
            }

            $uploadedById = (int) auth()->id();

            $dokumen = $arsip->dokumen()->create([
                'nama_original' => $originalName,
                'nama_generated' => $generatedName,
                'ukuran' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                'path_penyimpanan' => $path,
                'uploaded_at' => now(),
                'uploaded_by' => $uploadedById,
            ]);

            $this->documentVersionService->createVersion(
                $dokumen,
                $originalName,
                $path,
                $uploadedFile->getSize(),
                $uploadedFile->getMimeType() ?? 'application/octet-stream',
                $uploadedById
            );
        }

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
            'dokumen.uploader',
            'dokumen.versions.uploader',
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

        $arsip->load('dokumen');

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
        $arsip->update($validated);

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $originalName = $uploadedFile->getClientOriginalName();
            $extension = $uploadedFile->getClientOriginalExtension();
            $generatedName = Str::uuid().'.'.$extension;
            $path = $uploadedFile->storeAs('archives', $generatedName, 'local');

            if ($path === false) {
                abort(500, 'Gagal menyimpan file ke storage.');
            }

            $uploadedById = (int) auth()->id();

            $dokumen = $arsip->dokumen;
            if ($dokumen) {
                $dokumen->update([
                    'nama_original' => $originalName,
                    'nama_generated' => $generatedName,
                    'ukuran' => $uploadedFile->getSize(),
                    'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                    'path_penyimpanan' => $path,
                    'uploaded_at' => now(),
                    'uploaded_by' => $uploadedById,
                ]);
            } else {
                $dokumen = $arsip->dokumen()->create([
                    'nama_original' => $originalName,
                    'nama_generated' => $generatedName,
                    'ukuran' => $uploadedFile->getSize(),
                    'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                    'path_penyimpanan' => $path,
                    'uploaded_at' => now(),
                    'uploaded_by' => $uploadedById,
                ]);
            }

            $this->documentVersionService->createVersion(
                $dokumen,
                $originalName,
                $path,
                $uploadedFile->getSize(),
                $uploadedFile->getMimeType() ?? 'application/octet-stream',
                $uploadedById
            );
        }

        return redirect()->route('arsip.show', $arsip)
            ->with('success', 'Arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Arsip $arsip): RedirectResponse
    {
        Gate::authorize('delete', $arsip);

        // Delete associated files if any
        if ($arsip->dokumen) {
            Storage::disk('local')->delete($arsip->dokumen->path_penyimpanan);
            $arsip->dokumen->delete();
        }

        $arsip->delete();

        return redirect()->route('arsip.index')
            ->with('success', 'Arsip berhasil dihapus.');
    }

    /**
     * Download the associated document.
     */
    public function download(Arsip $arsip): StreamedResponse
    {
        Gate::authorize('view', $arsip);

        $arsip->load('dokumen');

        if (! $arsip->dokumen) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return Storage::disk('local')->download(
            $arsip->dokumen->path_penyimpanan,
            $arsip->dokumen->nama_original
        );
    }

    /**
     * Upload document for existing archive.
     */
    public function uploadFile(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ]);

        if ($arsip->dokumen) {
            return redirect()->back()->withErrors(['file' => 'Arsip sudah memiliki dokumen. Gunakan fitur ganti file.']);
        }

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $generatedName = Str::uuid().'.'.$extension;
        $path = $uploadedFile->storeAs('archives', $generatedName, 'local');

        if ($path === false) {
            abort(500, 'Gagal menyimpan file ke storage.');
        }

        $uploadedById = (int) auth()->id();

        $dokumen = $arsip->dokumen()->create([
            'nama_original' => $originalName,
            'nama_generated' => $generatedName,
            'ukuran' => $uploadedFile->getSize(),
            'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
            'path_penyimpanan' => $path,
            'uploaded_at' => now(),
            'uploaded_by' => $uploadedById,
        ]);

        $this->documentVersionService->createVersion(
            $dokumen,
            $originalName,
            $path,
            $uploadedFile->getSize(),
            $uploadedFile->getMimeType() ?? 'application/octet-stream',
            $uploadedById
        );

        return redirect()->route('arsip.show', $arsip)
            ->with('success', 'Dokumen berhasil diunggah.');
    }

    /**
     * Replace document for existing archive.
     */
    public function replaceFile(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = $uploadedFile->getClientOriginalExtension();
        $generatedName = Str::uuid().'.'.$extension;
        $path = $uploadedFile->storeAs('archives', $generatedName, 'local');

        if ($path === false) {
            abort(500, 'Gagal menyimpan file ke storage.');
        }

        $uploadedById = (int) auth()->id();

        $dokumen = $arsip->dokumen;
        if ($dokumen) {
            $dokumen->update([
                'nama_original' => $originalName,
                'nama_generated' => $generatedName,
                'ukuran' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                'path_penyimpanan' => $path,
                'uploaded_at' => now(),
                'uploaded_by' => $uploadedById,
            ]);
        } else {
            $dokumen = $arsip->dokumen()->create([
                'nama_original' => $originalName,
                'nama_generated' => $generatedName,
                'ukuran' => $uploadedFile->getSize(),
                'mime_type' => $uploadedFile->getMimeType() ?? 'application/octet-stream',
                'path_penyimpanan' => $path,
                'uploaded_at' => now(),
                'uploaded_by' => $uploadedById,
            ]);
        }

        $this->documentVersionService->createVersion(
            $dokumen,
            $originalName,
            $path,
            $uploadedFile->getSize(),
            $uploadedFile->getMimeType() ?? 'application/octet-stream',
            $uploadedById
        );

        return redirect()->route('arsip.show', $arsip)
            ->with('success', 'Dokumen berhasil diperbarui.');
    }

    /**
     * Delete document for existing archive.
     */
    public function deleteFile(Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $arsip->load('dokumen');

        if ($arsip->dokumen) {
            Storage::disk('local')->delete($arsip->dokumen->path_penyimpanan);
            $arsip->dokumen->delete();
        }

        return redirect()->route('arsip.show', $arsip)
            ->with('success', 'Dokumen berhasil dihapus.');
    }

    /**
     * Download specific version of a document.
     */
    public function downloadVersion(DokumenArsipVersion $version): StreamedResponse
    {
        $version->load('dokumenArsip.arsip');

        Gate::authorize('view', $version->dokumenArsip->arsip);

        return Storage::disk('local')->download(
            $version->path_file,
            $version->nama_file
        );
    }
}
