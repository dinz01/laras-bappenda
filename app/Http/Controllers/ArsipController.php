<?php

namespace App\Http\Controllers;

use App\Enums\PeminjamanStatus;
use App\Enums\WorkflowStatus;
use App\Http\Requests\StoreArsipRequest;
use App\Http\Requests\UpdateArsipRequest;
use App\Interfaces\SearchServiceInterface;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Models\DokumenArsipVersion;
use App\Models\JenisArsip;
use App\Models\KategoriArsip;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\SifatArsip;
use App\Models\TingkatAksesArsip;
use App\Models\TingkatPerkembanganArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\BarcodeStampService;
use App\Services\DocumentUploadService;
use App\Services\DocumentVersionService;
use App\Services\NotificationService;
use App\Services\WorkflowService;
use App\Support\AppDateTime;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
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
        protected BarcodeStampService $barcodeStampService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Arsip::class);

        Arsip::syncExpiredRetentionStatus();

        /** @var User $user */
        $user = $request->user();

        $query = $this->searchService->advancedSearch($request->all());

        $finalStatuses = [
            WorkflowStatus::Active->value,
        ];
        $query->whereIn('workflow_status', $finalStatuses);

        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            $query->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        if ($request->filled('workflow_status')) {
            $query->where('workflow_status', $request->string('workflow_status')->value());
        }

        $perPage = in_array($request->integer('per_page'), [15, 30, 50, 100], true)
            ? $request->integer('per_page')
            : 15;

        $arsips = $query
            ->orderBy('tanggal_arsip', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Master lists for create / edit dialogs
        $klasifikasis = KlasifikasiArsip::with('nasibAkhir')->active()->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']);
        $unitOrganisasis = UnitOrganisasi::active()->get(['id', 'kode', 'nama', 'tipe', 'parent_id']);
        $lokasiArsips = LokasiArsip::active()->get(['id', 'kode', 'nama', 'parent_id']);
        $kategoriArsips = KategoriArsip::active()->get(['id', 'kode', 'nama']);
        $kondisiArsips = KondisiArsip::active()->get(['id', 'kode', 'nama']);
        $tingkatAksesArsips = TingkatAksesArsip::active()->get(['id', 'kode', 'nama']);

        // Filter lists: only records present in the active archive repository
        $baseFilterArsipQuery = Arsip::query()
            ->whereIn('workflow_status', $finalStatuses);

        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            $baseFilterArsipQuery->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        $yearsQuery = (clone $baseFilterArsipQuery)->whereNotNull('tanggal_arsip');

        $tahuns = $yearsQuery
            ->get(['tanggal_arsip'])
            ->filter(fn (Arsip $a) => $a->tanggal_arsip !== null)
            ->map(fn (Arsip $a): int => $a->tanggal_arsip->year)
            ->unique()
            ->sortDesc()
            ->values()
            ->all();

        $usedKlasifikasiIds = (clone $baseFilterArsipQuery)->whereNotNull('klasifikasi_arsip_id')->distinct()->pluck('klasifikasi_arsip_id')->all();
        $usedUnitIds = (clone $baseFilterArsipQuery)->whereNotNull('unit_organisasi_id')->distinct()->pluck('unit_organisasi_id')->all();
        $usedLokasiIds = (clone $baseFilterArsipQuery)->whereNotNull('lokasi_arsip_id')->distinct()->pluck('lokasi_arsip_id')->all();
        $usedKategoriIds = (clone $baseFilterArsipQuery)->whereNotNull('kategori_arsip_id')->distinct()->pluck('kategori_arsip_id')->all();
        $usedKondisiIds = (clone $baseFilterArsipQuery)->whereNotNull('kondisi_arsip_id')->distinct()->pluck('kondisi_arsip_id')->all();
        $usedTingkatAksesIds = (clone $baseFilterArsipQuery)->whereNotNull('tingkat_akses_arsip_id')->distinct()->pluck('tingkat_akses_arsip_id')->all();

        $allKlasifikasiIds = $this->collectWithAncestors(KlasifikasiArsip::class, $usedKlasifikasiIds);
        $allUnitIds = $this->collectWithAncestors(UnitOrganisasi::class, $usedUnitIds);
        $allLokasiIds = $this->collectWithAncestors(LokasiArsip::class, $usedLokasiIds);

        $filterKlasifikasis = KlasifikasiArsip::with('nasibAkhir')
            ->whereIn('id', $allKlasifikasiIds)
            ->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']);

        $filterUnitOrganisasis = UnitOrganisasi::whereIn('id', $allUnitIds)
            ->get(['id', 'kode', 'nama', 'tipe', 'parent_id']);

        $filterLokasiArsips = LokasiArsip::whereIn('id', $allLokasiIds)
            ->get(['id', 'kode', 'nama', 'parent_id']);

        $filterKategoriArsips = KategoriArsip::whereIn('id', $usedKategoriIds)
            ->get(['id', 'kode', 'nama']);

        $filterKondisiArsips = KondisiArsip::whereIn('id', $usedKondisiIds)
            ->get(['id', 'kode', 'nama']);

        $filterTingkatAksesArsips = TingkatAksesArsip::whereIn('id', $usedTingkatAksesIds)
            ->get(['id', 'kode', 'nama']);

        return Inertia::render('arsip/index', [
            'arsips' => $arsips,
            'klasifikasis' => $klasifikasis,
            'unitOrganisasis' => $unitOrganisasis,
            'tahuns' => $tahuns,
            'kategoriArsips' => $kategoriArsips,
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
            'lokasiArsips' => $lokasiArsips,
            'kondisiArsips' => $kondisiArsips,
            'tingkatAksesArsips' => $tingkatAksesArsips,
            'filterKlasifikasis' => $filterKlasifikasis,
            'filterUnitOrganisasis' => $filterUnitOrganisasis,
            'filterLokasiArsips' => $filterLokasiArsips,
            'filterKategoriArsips' => $filterKategoriArsips,
            'filterKondisiArsips' => $filterKondisiArsips,
            'filterTingkatAksesArsips' => $filterTingkatAksesArsips,
            'filters' => $request->only(['search', 'tanggal_arsip', 'nomor_arsip', 'judul', 'pajak', 'nop', 'unit_organisasi_id', 'klasifikasi_arsip_id', 'kategori_arsip_id', 'kondisi_arsip_id', 'tingkat_akses_arsip_id', 'lokasi_arsip_id', 'deskripsi', 'tahun', 'workflow_status', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Arsip::class);

        return Inertia::render('arsip/create', [
            'klasifikasis' => KlasifikasiArsip::with('nasibAkhir')->active()->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']),
            'kategoriArsips' => KategoriArsip::active()->get(['id', 'kode', 'nama']),
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
            'unitOrganisasis' => UnitOrganisasi::active()->get(['id', 'kode', 'nama', 'tipe', 'parent_id']),
            'lokasiArsips' => LokasiArsip::active()->get(['id', 'kode', 'nama', 'parent_id']),
            'kondisiArsips' => KondisiArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatAksesArsips' => TingkatAksesArsip::active()->get(['id', 'kode', 'nama']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreArsipRequest $request): RedirectResponse
    {
        Gate::authorize('create', Arsip::class);

        $validated = $request->validated();
        if (empty($validated['nomor_arsip'])) {
            $date = ! empty($validated['tanggal_arsip']) ? Carbon::parse($validated['tanggal_arsip']) : null;
            $validated['nomor_arsip'] = Arsip::generateNomorArsip($date);
        }
        $validated['created_by'] = auth()->id();
        $validated['workflow_status'] = WorkflowStatus::Review;

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
                'kategori_arsip_id',
                'no_register',
                'nop',
                'npwpd',
                'nama_wajib_pajak',
                'klasifikasi_arsip_id',
                'lokasi_arsip_id',
                'jenis_arsip_id',
                'sifat_arsip_id',
                'tingkat_perkembangan_arsip_id',
                'kondisi_arsip_id',
                'tingkat_akses_arsip_id',
                'unit_organisasi_id',
                'workflow_status',
            ]),
            $request->user(),
            $request
        );

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $stampedPath = $this->barcodeStampService->stamp($uploadedFile);
            $pdfFileName = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME).'.pdf';
            $stampedFile = new UploadedFile($stampedPath, $pdfFileName, 'application/pdf', null, true);

            $this->documentUploadService->upload(
                $arsip,
                $stampedFile,
                (int) auth()->id()
            );

            @unlink($stampedPath);
        }

        /** @var User $user */
        $user = $request->user();
        $this->notificationService->notifyArsipCreated($arsip, $user);

        return redirect()->back()
            ->with('success', 'Arsip berhasil disimpan.');
    }

    /**
     * Return arsip detail as JSON for dialog-based viewing.
     */
    public function detailJson(Arsip $arsip): JsonResponse
    {
        Gate::authorize('view', $arsip);

        $arsip->load([
            'kategoriArsip',
            'klasifikasiArsip.nasibAkhir',
            'klasifikasiArsip.parent.nasibAkhir',
            'klasifikasiArsip.parent.parent.nasibAkhir',
            'klasifikasiArsip.parent.parent.parent.nasibAkhir',
            'lokasiArsip.parent.parent.parent.parent.parent',
            'jenisArsip',
            'sifatArsip',
            'tingkatPerkembanganArsip',
            'kondisiArsip',
            'tingkatAksesArsip',
            'unitOrganisasi',
            'creator',
            'dokumen.uploader',
            'dokumen.versions.uploader',
        ]);

        $workflowHistory = $this->workflowService->history($arsip);
        $allowedTransitions = $this->workflowService->allowedTransitions($arsip);

        return response()->json([
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

        $arsip->load(['dokumen', 'kategoriArsip']);

        return Inertia::render('arsip/edit', [
            'arsip' => $arsip,
            'klasifikasis' => KlasifikasiArsip::with('nasibAkhir')->active()->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']),
            'kategoriArsips' => KategoriArsip::active()->get(['id', 'kode', 'nama']),
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
            'unitOrganisasis' => UnitOrganisasi::active()->get(['id', 'kode', 'nama', 'tipe', 'parent_id']),
            'lokasiArsips' => LokasiArsip::active()->get(['id', 'kode', 'nama', 'parent_id']),
            'kondisiArsips' => KondisiArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatAksesArsips' => TingkatAksesArsip::active()->get(['id', 'kode', 'nama']),
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
            'kategori_arsip_id',
            'no_register',
            'nop',
            'npwpd',
            'nama_wajib_pajak',
            'klasifikasi_arsip_id',
            'lokasi_arsip_id',
            'jenis_arsip_id',
            'sifat_arsip_id',
            'tingkat_perkembangan_arsip_id',
            'kondisi_arsip_id',
            'tingkat_akses_arsip_id',
            'unit_organisasi_id',
            'workflow_status',
        ];

        $oldStatus = $arsip->workflow_status;
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
            $uploadedFile = $request->file('file');
            $stampedPath = $this->barcodeStampService->stamp($uploadedFile);
            $pdfFileName = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME).'.pdf';
            $stampedFile = new UploadedFile($stampedPath, $pdfFileName, 'application/pdf', null, true);

            $this->documentUploadService->replace(
                $arsip,
                $stampedFile,
                (int) auth()->id()
            );

            @unlink($stampedPath);

            /** @var User $user */
            $user = $request->user();
            $this->notificationService->notifyDocumentUploaded($arsip, $user, true);
        }

        if ($oldStatus === WorkflowStatus::Revisi) {
            $arsip->update(['catatan_revisi' => null]);
            if ($this->workflowService->canTransition($arsip, WorkflowStatus::Review)) {
                $this->workflowService->transition(
                    arsip: $arsip,
                    target: WorkflowStatus::Review,
                    keterangan: 'Revisi diajukan ulang oleh '.$request->user()->name,
                    actor: $request->user(),
                    request: $request,
                    action: 'resubmit',
                );
            }

            return redirect()->back()
                ->with('success', 'Arsip berhasil direvisi dan diajukan ulang untuk verifikasi.');
        }

        return redirect()->back()
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
                'kategori_arsip_id',
                'no_register',
                'nop',
                'npwpd',
                'nama_wajib_pajak',
                'klasifikasi_arsip_id',
                'lokasi_arsip_id',
                'jenis_arsip_id',
                'sifat_arsip_id',
                'tingkat_perkembangan_arsip_id',
                'media_arsip_id',
                'kondisi_arsip_id',
                'status_arsip_id',
                'tingkat_akses_arsip_id',
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
        $this->notificationService->notifyArsipDeleted($arsip, $user);

        return redirect()->back(fallback: route('arsip.index'))
            ->with('success', 'Arsip berhasil dipindahkan ke riwayat arsip dihapus.');
    }

    /**
     * Hapus beberapa arsip secara massal (soft delete).
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user || (! $user->can('kelola-arsip.delete') && ! $user->can('repositori-arsip.delete') && ! $user->can('nasib-akhir-arsip.delete'))) {
            abort(403, 'Anda tidak memiliki hak untuk menghapus arsip.');
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:arsip,id',
        ]);

        $arsips = Arsip::whereIn('id', $validated['ids'])->get();
        $count = 0;

        foreach ($arsips as $arsip) {
            $this->auditLogService->log(
                'arsip.deleted',
                $arsip,
                $arsip->only([
                    'nomor_arsip',
                    'judul',
                    'deskripsi',
                    'tanggal_arsip',
                    'kategori_arsip_id',
                    'no_register',
                    'nop',
                    'npwpd',
                    'nama_wajib_pajak',
                    'klasifikasi_arsip_id',
                    'lokasi_arsip_id',
                    'jenis_arsip_id',
                    'sifat_arsip_id',
                    'tingkat_perkembangan_arsip_id',
                    'media_arsip_id',
                    'kondisi_arsip_id',
                    'status_arsip_id',
                    'tingkat_akses_arsip_id',
                    'unit_organisasi_id',
                    'workflow_status',
                ]),
                null,
                $user,
                $request
            );

            $arsip->delete();
            $this->notificationService->notifyArsipDeleted($arsip, $user);
            $count++;
        }

        return redirect()->back(fallback: route('nasib-akhir-arsip.index'))
            ->with('success', "{$count} arsip berhasil dipindahkan ke riwayat arsip dihapus.");
    }

    /**
     * Download or preview the associated document.
     */
    public function download(Request $request, Arsip $arsip): StreamedResponse|SymfonyResponse
    {
        Gate::authorize('download', $arsip);

        $arsip->load('dokumen');

        if (! $arsip->dokumen) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        if ($request->boolean('preview')) {
            return Storage::disk('local')->response(
                $arsip->dokumen->path_penyimpanan,
                $arsip->dokumen->nama_original,
                [
                    'Content-Disposition' => 'inline; filename="'.addslashes($arsip->dokumen->nama_original).'"',
                ]
            );
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

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:102400',
            'catatan_perubahan' => 'nullable|string|max:500',
        ]);

        if ($arsip->dokumen) {
            return redirect()->back()->withErrors(['file' => 'Arsip sudah memiliki dokumen. Gunakan fitur ganti file.']);
        }

        $uploadedFile = $request->file('file');

        $stampedPath = $this->barcodeStampService->stamp($uploadedFile);
        $pdfFileName = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME).'.pdf';
        $stampedFile = new UploadedFile($stampedPath, $pdfFileName, 'application/pdf', null, true);

        $this->documentUploadService->upload(
            $arsip,
            $stampedFile,
            (int) auth()->id(),
            isset($validated['catatan_perubahan']) ? (string) $validated['catatan_perubahan'] : null
        );

        @unlink($stampedPath);

        /** @var User $user */
        $user = $request->user();
        $this->notificationService->notifyDocumentUploaded($arsip, $user, false);

        return redirect()->back()
            ->with('success', 'Dokumen berhasil diunggah.');
    }

    /**
     * Replace document for existing archive.
     */
    public function replaceFile(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:102400',
            'catatan_perubahan' => 'nullable|string|max:500',
        ]);

        $uploadedFile = $request->file('file');

        $stampedPath = $this->barcodeStampService->stamp($uploadedFile);
        $pdfFileName = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME).'.pdf';
        $stampedFile = new UploadedFile($stampedPath, $pdfFileName, 'application/pdf', null, true);

        $this->documentUploadService->replace(
            $arsip,
            $stampedFile,
            (int) auth()->id(),
            isset($validated['catatan_perubahan']) ? (string) $validated['catatan_perubahan'] : null
        );

        @unlink($stampedPath);

        /** @var User $user */
        $user = $request->user();
        $this->notificationService->notifyDocumentUploaded($arsip, $user, true);

        return redirect()->back()
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

        return redirect()->back()
            ->with('success', 'Dokumen berhasil dihapus.');
    }

    /**
     * Download or preview specific version of a document.
     */
    public function downloadVersion(Request $request, DokumenArsipVersion $version): StreamedResponse|SymfonyResponse
    {
        $version->load('dokumenArsip.arsip');

        Gate::authorize('download', [$version->dokumenArsip->arsip, $version->id]);

        if ($request->boolean('preview')) {
            return Storage::disk('local')->response(
                $version->path_file,
                $version->nama_file,
                [
                    'Content-Disposition' => 'inline; filename="'.addslashes($version->nama_file).'"',
                ]
            );
        }

        return Storage::disk('local')->download(
            $version->path_file,
            $version->nama_file
        );
    }

    /**
     * Verifikasi beberapa arsip oleh Arsiparis.
     */
    public function bulkVerify(Request $request): RedirectResponse
    {
        Gate::authorize('verifikasi-arsip.verify');

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:arsip,id',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        /** @var User $actor */
        $actor = $request->user();
        $keterangan = $validated['keterangan'] ?? null;
        $count = 0;

        $arsips = Arsip::whereIn('id', $validated['ids'])
            ->where('workflow_status', WorkflowStatus::Review)
            ->get();

        foreach ($arsips as $arsip) {
            if ($this->workflowService->canTransition($arsip, WorkflowStatus::WaitingTte)) {
                $arsip->update(['catatan_revisi' => null]);
                $this->workflowService->transition(
                    arsip: $arsip,
                    target: WorkflowStatus::WaitingTte,
                    keterangan: $keterangan,
                    actor: $actor,
                    request: $request,
                    action: 'verify',
                );
                $count++;
            }
        }

        return redirect()->back()
            ->with('success', "{$count} arsip berhasil diverifikasi dan disetujui.");
    }

    /**
     * Tolak beberapa arsip untuk direvisi.
     */
    public function bulkReject(Request $request): RedirectResponse
    {
        abort_unless(
            $request->user()?->can('verifikasi-arsip.reject') || $request->user()?->can('verifikasi-arsip.verify'),
            403,
        );

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:arsip,id',
            'catatan_revisi' => 'required|string|max:1000',
        ]);

        /** @var User $actor */
        $actor = $request->user();
        $count = 0;

        $arsips = Arsip::whereIn('id', $validated['ids'])
            ->where('workflow_status', WorkflowStatus::Review)
            ->get();

        foreach ($arsips as $arsip) {
            if ($this->workflowService->canTransition($arsip, WorkflowStatus::Revisi)) {
                $arsip->update(['catatan_revisi' => $validated['catatan_revisi']]);
                $this->workflowService->transition(
                    arsip: $arsip,
                    target: WorkflowStatus::Revisi,
                    keterangan: $validated['catatan_revisi'],
                    actor: $actor,
                    request: $request,
                    action: 'reject',
                );
                $count++;
            }
        }

        return redirect()->back()
            ->with('success', "{$count} arsip dikembalikan untuk revisi.");
    }

    /**
     * Verifikasi arsip oleh Arsiparis — menyetujui arsip yang berstatus review.
     */
    public function verify(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('verifikasi-arsip.verify');

        if (! $this->workflowService->canTransition($arsip, WorkflowStatus::WaitingTte)) {
            return redirect()->back()->withErrors([
                'workflow' => 'Arsip tidak dapat diverifikasi dari status saat ini.',
            ]);
        }

        /** @var User $actor */
        $actor = $request->user();

        $arsip->update(['catatan_revisi' => null]);

        $this->workflowService->transition(
            arsip: $arsip,
            target: WorkflowStatus::WaitingTte,
            keterangan: $request->string('keterangan')->value() ?: null,
            actor: $actor,
            request: $request,
            action: 'verify',
        );

        return redirect()->back()
            ->with('success', 'Arsip berhasil diverifikasi dan disetujui.');
    }

    /**
     * Kembalikan arsip untuk direvisi oleh Operator Unit.
     */
    public function reject(Request $request, Arsip $arsip): RedirectResponse
    {
        abort_unless(
            $request->user()?->can('verifikasi-arsip.reject') || $request->user()?->can('verifikasi-arsip.verify'),
            403,
        );

        $validated = $request->validate([
            'catatan_revisi' => 'required|string|max:1000',
        ]);

        if (! $this->workflowService->canTransition($arsip, WorkflowStatus::Revisi)) {
            return redirect()->back()->withErrors([
                'workflow' => 'Arsip tidak dapat dikembalikan dari status saat ini.',
            ]);
        }

        /** @var User $actor */
        $actor = $request->user();

        $arsip->update(['catatan_revisi' => $validated['catatan_revisi']]);

        $this->workflowService->transition(
            arsip: $arsip,
            target: WorkflowStatus::Revisi,
            keterangan: $validated['catatan_revisi'],
            actor: $actor,
            request: $request,
            action: 'reject',
        );

        return redirect()->back()
            ->with('success', 'Arsip dikembalikan untuk revisi.');
    }

    /**
     * Ajukan ulang arsip yang sudah direvisi oleh Operator Unit.
     */
    public function resubmit(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        if (! $this->workflowService->canTransition($arsip, WorkflowStatus::Review)) {
            return redirect()->back()->withErrors([
                'workflow' => 'Arsip tidak dapat diajukan ulang dari status saat ini.',
            ]);
        }

        /** @var User $actor */
        $actor = $request->user();

        $arsip->update(['catatan_revisi' => null]);

        $this->workflowService->transition(
            arsip: $arsip,
            target: WorkflowStatus::Review,
            keterangan: null,
            actor: $actor,
            request: $request,
            action: 'resubmit',
        );

        return redirect()->back()
            ->with('success', 'Arsip berhasil diajukan ulang untuk verifikasi.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatArsipForShow(Arsip $arsip): array
    {
        $data = $arsip->toArray();
        $data['tanggal_arsip'] = AppDateTime::date($arsip->tanggal_arsip);
        $data['tanggal_arsip_input'] = AppDateTime::inputDate($arsip->tanggal_arsip);
        $data['created_at'] = AppDateTime::dateTime($arsip->created_at);
        $data['updated_at'] = AppDateTime::dateTime($arsip->updated_at);

        if ($arsip->dokumen !== null) {
            $data['dokumen']['uploaded_at'] = AppDateTime::dateTime($arsip->dokumen->uploaded_at);
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

        $user = auth()->user();
        $data['has_approved_peminjaman'] = $user !== null
            ? $arsip->peminjamans()
                ->where('pemohon_id', $user->id)
                ->where('status', PeminjamanStatus::Approved)
                ->exists()
            : false;

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

    /**
     * Maju ke tahap workflow berikutnya.
     */
    public function advanceWorkflow(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('update', $arsip);

        $request->validate([
            'target_status' => ['required', 'string'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
        ]);

        $target = WorkflowStatus::tryFrom($request->string('target_status')->toString());

        if (! $target) {
            return back()->withErrors(['workflow' => 'Status tujuan tidak valid.']);
        }

        if (! $this->workflowService->canTransition($arsip, $target)) {
            return back()->withErrors(['workflow' => "Transisi dari [{$arsip->workflow_status->value}] ke [{$target->value}] tidak diizinkan."]);
        }

        $this->workflowService->transition(
            arsip: $arsip,
            target: $target,
            keterangan: $request->input('keterangan'),
            actor: $request->user(),
            request: $request,
        );

        return back()->with('success', 'Status arsip berhasil diperbarui.');
    }

    /**
     * Kumpulkan ID yang digunakan beserta seluruh ancestor (parent) dari model hirarki.
     *
     * @param  class-string<KlasifikasiArsip|LokasiArsip|UnitOrganisasi>  $modelClass
     * @param  iterable<mixed>  $usedIds
     * @return list<int>
     */
    protected function collectWithAncestors(string $modelClass, iterable $usedIds): array
    {
        /** @var Collection<int, KlasifikasiArsip|LokasiArsip|UnitOrganisasi> $items */
        $items = $modelClass::query()->get(['id', 'parent_id'])->keyBy('id');
        $allIds = [];

        foreach ($usedIds as $id) {
            $curr = (int) $id;
            while ($curr && isset($items[$curr])) {
                $allIds[$curr] = true;
                $parent = $items[$curr]->parent_id;
                $curr = $parent ? (int) $parent : 0;
            }
        }

        /** @var list<int> */
        return array_values(array_map('intval', array_keys($allIds)));
    }
}
