<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Enums\WorkflowStatus;
use App\Http\Requests\StoreArsipRequest;
use App\Http\Requests\UpdateArsipRequest;
use App\Interfaces\SearchServiceInterface;
use App\Jobs\ProcessOcrJob;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\DokumenArsipVersion;
use App\Models\JenisArsip;
use App\Models\SifatArsip;
use App\Models\TingkatPerkembanganArsip;
use App\Models\KlasifikasiArsip;
use App\Models\LokasiArsip;
use App\Models\StatusArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\DocumentUploadService;
use App\Services\DocumentVersionService;
use App\Services\NotificationService;
use App\Services\WorkflowService;
use App\Support\AppDateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArsipController extends Controller
{
    public function __construct(
        protected DocumentVersionService $documentVersionService,
        protected SearchServiceInterface $searchService,
        protected WorkflowService $workflowService,
        protected DocumentUploadService $documentUploadService,
        protected NotificationService $notificationService,
        protected AuditLogService $auditLogService,
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
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
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

        $this->auditLogService->log(
            'arsip.created',
            $arsip,
            null,
            $arsip->only([
                'nomor_arsip',
                'judul',
                'deskripsi',
                'tanggal_arsip',
                'klasifikasi_arsip_id',
                'lokasi_arsip_id',
                'jenis_arsip_id',
                'sifat_arsip_id',
                'tingkat_perkembangan_arsip_id',
                'media_arsip_id',
                'kondisi_arsip_id',
                'status_arsip_id',
                'tingkat_akses_arsip_id',
                'retensi_arsip_id',
                'unit_organisasi_id',
                'workflow_status',
            ]),
            $request->user(),
            $request
        );

        if ($request->hasFile('file')) {
            $this->documentUploadService->upload(
                $arsip,
                $request->file('file'),
                (int) auth()->id()
            );
        }

        /** @var User $user */
        $user = $request->user();
        $this->notificationService->create(
            $user,
            NotificationType::ArsipBaru,
            'Arsip Berhasil Dibuat',
            "Arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) berhasil disimpan.",
            route('arsip.show', $arsip),
        );

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
            'jenisArsip',
            'sifatArsip',
            'tingkatPerkembanganArsip',
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

        $workflowHistory = $this->workflowService->history($arsip);
        $allowedTransitions = $this->workflowService->allowedTransitions($arsip);

        return Inertia::render('arsip/show', [
            'arsip' => $this->formatArsipForShow($arsip),
            'workflowHistory' => $workflowHistory
                ->map(fn (ArsipWorkflowHistory $history): array => $this->formatWorkflowHistoryForShow($history))
                ->all(),
            'allowedTransitions' => $allowedTransitions,
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
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
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

        $fieldsToCheck = [
            'nomor_arsip',
            'judul',
            'deskripsi',
            'tanggal_arsip',
            'klasifikasi_arsip_id',
            'lokasi_arsip_id',
            'jenis_arsip_id',
            'sifat_arsip_id',
            'tingkat_perkembangan_arsip_id',
            'media_arsip_id',
            'kondisi_arsip_id',
            'status_arsip_id',
            'tingkat_akses_arsip_id',
            'retensi_arsip_id',
            'unit_organisasi_id',
            'workflow_status',
        ];

        $oldValues = $arsip->only($fieldsToCheck);
        $arsip->update($validated);

        $changes = $arsip->getChanges();
        $changedKeys = array_keys($changes);

        if (! empty($changedKeys)) {
            $oldValuesFiltered = array_intersect_key($oldValues, array_flip($changedKeys));
            $newValuesFiltered = $arsip->only($changedKeys);

            $this->auditLogService->log(
                'arsip.updated',
                $arsip,
                $oldValuesFiltered,
                $newValuesFiltered,
                $request->user(),
                $request
            );
        }

        if ($request->hasFile('file')) {
            $this->documentUploadService->replace(
                $arsip,
                $request->file('file'),
                (int) auth()->id()
            );

            /** @var User $user */
            $user = $request->user();
            $this->notificationService->create(
                $user,
                NotificationType::DokumenDiganti,
                'Dokumen Berhasil Diganti',
                "Dokumen arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) berhasil diperbarui.",
                route('arsip.show', $arsip),
            );
        }

        return redirect()->route('arsip.show', $arsip)
            ->with('success', 'Arsip berhasil diperbarui.');
    }

    public function destroy(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('delete', $arsip);

        // Catat audit log untuk soft delete
        $this->auditLogService->log(
            'arsip.deleted',
            $arsip,
            $arsip->only([
                'nomor_arsip',
                'judul',
                'deskripsi',
                'tanggal_arsip',
                'klasifikasi_arsip_id',
                'lokasi_arsip_id',
                'jenis_arsip_id',
                'sifat_arsip_id',
                'tingkat_perkembangan_arsip_id',
                'media_arsip_id',
                'kondisi_arsip_id',
                'status_arsip_id',
                'tingkat_akses_arsip_id',
                'retensi_arsip_id',
                'unit_organisasi_id',
                'workflow_status',
            ]),
            null,
            $request->user(),
            $request
        );

        $arsip->delete();

        /** @var User $user */
        $user = $request->user();
        $this->notificationService->create(
            $user,
            NotificationType::ArsipDihapus,
            'Arsip Dipindahkan ke Recycle Bin',
            "Arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) dipindahkan ke recycle bin.",
        );

        return redirect()->route('arsip.index')
            ->with('success', 'Arsip berhasil dipindahkan ke tempat pembuangan sementara.');
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

        $this->documentUploadService->upload(
            $arsip,
            $request->file('file'),
            (int) auth()->id()
        );

        /** @var User $user */
        $user = $request->user();
        $this->notificationService->create(
            $user,
            NotificationType::DokumenDiunggah,
            'Dokumen Berhasil Diunggah',
            "Dokumen untuk arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) berhasil diunggah.",
            route('arsip.show', $arsip),
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

        $this->documentUploadService->replace(
            $arsip,
            $request->file('file'),
            (int) auth()->id()
        );

        /** @var User $user */
        $user = $request->user();
        $this->notificationService->create(
            $user,
            NotificationType::DokumenDiganti,
            'Dokumen Berhasil Diganti',
            "Dokumen arsip \"{$arsip->judul}\" ({$arsip->nomor_arsip}) berhasil diperbarui.",
            route('arsip.show', $arsip),
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

    /**
     * Reprocess OCR for the archive's document.
     */
    public function reprocessOcr(Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $arsip->load('dokumen');

        if (! $arsip->dokumen) {
            return redirect()->back()->withErrors(['ocr' => 'Dokumen tidak ditemukan untuk diproses OCR.']);
        }

        if ($arsip->dokumen->ocr_status->isReprocessable()) {
            ProcessOcrJob::dispatch($arsip->dokumen);

            return redirect()->route('arsip.show', $arsip)
                ->with('success', 'Proses ulang OCR berhasil diajukan.');
        }

        return redirect()->back()->withErrors(['ocr' => 'Dokumen sedang diproses OCR.']);
    }

    /**
     * Advance the workflow status of an archive.
     */
    public function advanceWorkflow(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $request->validate([
            'target_status' => ['required', 'string'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $targetStatus = WorkflowStatus::tryFrom($request->string('target_status')->value());

        if ($targetStatus === null) {
            return redirect()->back()->withErrors(['workflow' => 'Status workflow tidak valid.']);
        }

        if (! $this->workflowService->canTransition($arsip, $targetStatus)) {
            return redirect()->back()->withErrors(['workflow' => 'Transisi workflow tidak diizinkan.']);
        }

        /** @var User $actor */
        $actor = auth()->user();

        $this->workflowService->transition(
            arsip: $arsip,
            target: $targetStatus,
            keterangan: $request->string('keterangan')->value() ?: null,
            actor: $actor,
            request: $request,
        );

        return redirect()->route('arsip.show', $arsip)
            ->with('success', "Tahap arsip berhasil dilanjutkan ke: {$targetStatus->label()}");
    }

    /**
     * @return array<string, mixed>
     */
    private function formatArsipForShow(Arsip $arsip): array
    {
        $data = $arsip->toArray();
        $data['tanggal_arsip'] = AppDateTime::date($arsip->tanggal_arsip);
        $data['created_at'] = AppDateTime::dateTime($arsip->created_at);
        $data['updated_at'] = AppDateTime::dateTime($arsip->updated_at);

        if ($arsip->dokumen !== null) {
            $data['dokumen']['uploaded_at'] = AppDateTime::dateTime($arsip->dokumen->uploaded_at);
            $data['dokumen']['ocr_processed_at'] = AppDateTime::dateTime($arsip->dokumen->ocr_processed_at);
            $data['dokumen']['created_at'] = AppDateTime::dateTime($arsip->dokumen->created_at);
            $data['dokumen']['updated_at'] = AppDateTime::dateTime($arsip->dokumen->updated_at);
            $data['dokumen']['versions'] = $arsip->dokumen->versions
                ->map(function (DokumenArsipVersion $version): array {
                    $versionData = $version->toArray();
                    $versionData['created_at'] = AppDateTime::dateTime($version->created_at);
                    $versionData['updated_at'] = AppDateTime::dateTime($version->updated_at);

                    return $versionData;
                })
                ->all();
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatWorkflowHistoryForShow(ArsipWorkflowHistory $history): array
    {
        $data = $history->toArray();
        $data['created_at'] = AppDateTime::dateTime($history->created_at);
        $data['updated_at'] = AppDateTime::dateTime($history->updated_at);

        return $data;
    }
}
