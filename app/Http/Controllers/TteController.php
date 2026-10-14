<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
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
use App\Services\NotificationService;
use App\Services\TteService;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TteController extends Controller
{
    public function __construct(
        protected TteService $tteService,
        protected WorkflowService $workflowService,
        protected NotificationService $notificationService,
        protected AuditLogService $auditLogService,
    ) {}

    /**
     * Tampilkan antrian arsip yang menunggu TTE (status approved).
     */
    public function index(Request $request): Response
    {
        Gate::authorize('kelola-tte.view');

        /** @var User|null $user */
        $user = $request->user();

        $search = $request->string('search')->trim()->toString();
        $unitFilter = $request->integer('unit_organisasi_id') ?: null;

        $query = Arsip::query()
            ->with([
                'kategoriArsip',
                'klasifikasiArsip.parent.parent.parent.nasibAkhir',
                'lokasiArsip.parent.parent.parent.parent',
                'unitOrganisasi',
                'creator',
                'dokumen',
            ])
            ->where('workflow_status', WorkflowStatus::WaitingTte);

        if ($unitFilter) {
            $query->where('unit_organisasi_id', $unitFilter);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('nomor_arsip', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tanggal_arsip')) {
            $query->whereDate('tanggal_arsip', $request->string('tanggal_arsip')->value());
        }

        if ($request->filled('nomor_arsip')) {
            $query->where('nomor_arsip', 'like', "%{$request->string('nomor_arsip')->value()}%");
        }

        if ($request->filled('judul')) {
            $query->where('judul', 'like', "%{$request->string('judul')->value()}%");
        }

        if ($request->filled('kategori_arsip_id')) {
            $query->where('kategori_arsip_id', $request->integer('kategori_arsip_id'));
        }

        if ($request->filled('klasifikasi_arsip_id')) {
            $query->where('klasifikasi_arsip_id', $request->integer('klasifikasi_arsip_id'));
        }

        if ($request->filled('pengunggah')) {
            $pengunggahKeyword = $request->string('pengunggah')->value();
            $query->whereHas('creator', function ($q) use ($pengunggahKeyword) {
                $q->where('name', 'like', "%{$pengunggahKeyword}%");
            });
        }

        $perPage = in_array($request->integer('per_page'), [15, 30, 50, 100], true)
            ? $request->integer('per_page')
            : 15;

        $baseFilterArsipQuery = Arsip::query()->where('workflow_status', WorkflowStatus::WaitingTte);
        if ($user?->hasRole(['Operator Unit', 'Operator Unit Pengolah']) && $user->unit_organisasi_id) {
            $baseFilterArsipQuery->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        $pengunggahIds = (clone $baseFilterArsipQuery)
            ->whereNotNull('created_by')
            ->distinct()
            ->pluck('created_by');

        $pengunggahList = User::whereIn('id', $pengunggahIds)
            ->orderBy('name')
            ->get(['id', 'name']);

        $arsips = $query
            ->orderBy('updated_at')
            ->paginate($perPage)
            ->withQueryString();

        $usedKlasifikasiIds = (clone $baseFilterArsipQuery)->whereNotNull('klasifikasi_arsip_id')->distinct()->pluck('klasifikasi_arsip_id')->all();
        $usedUnitIds = (clone $baseFilterArsipQuery)->whereNotNull('unit_organisasi_id')->distinct()->pluck('unit_organisasi_id')->all();
        $usedKategoriIds = (clone $baseFilterArsipQuery)->whereNotNull('kategori_arsip_id')->distinct()->pluck('kategori_arsip_id')->all();

        $allKlasifikasiIds = $this->collectWithAncestors(KlasifikasiArsip::class, $usedKlasifikasiIds);
        $allUnitIds = $this->collectWithAncestors(UnitOrganisasi::class, $usedUnitIds);

        $filterKlasifikasis = KlasifikasiArsip::with('nasibAkhir')
            ->whereIn('id', $allKlasifikasiIds)
            ->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']);

        $filterUnitOrganisasis = UnitOrganisasi::whereIn('id', $allUnitIds)
            ->get(['id', 'kode', 'nama', 'tipe', 'parent_id']);

        $filterKategoriArsips = KategoriArsip::whereIn('id', $usedKategoriIds)
            ->get(['id', 'kode', 'nama']);

        return Inertia::render('kelola-tte/index', [
            'arsips' => $arsips,
            'filters' => array_merge([
                'search' => $search,
                'unit_organisasi_id' => $unitFilter,
                'per_page' => $perPage,
            ], $request->only(['tanggal_arsip', 'nomor_arsip', 'judul', 'kategori_arsip_id', 'klasifikasi_arsip_id', 'pengunggah'])),
            'pengunggahList' => $pengunggahList,
            'filterKlasifikasis' => $filterKlasifikasis,
            'filterUnitOrganisasis' => $filterUnitOrganisasis,
            'filterKategoriArsips' => $filterKategoriArsips,
            'klasifikasis' => KlasifikasiArsip::with('nasibAkhir')->active()->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']),
            'kategoriArsips' => KategoriArsip::active()->get(['id', 'kode', 'nama']),
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
            'unitOrganisasis' => UnitOrganisasi::active()->orderBy('nama')->get(['id', 'kode', 'nama', 'tipe', 'parent_id']),
            'lokasiArsips' => LokasiArsip::active()->get(['id', 'kode', 'nama', 'parent_id']),
            'kondisiArsips' => KondisiArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatAksesArsips' => TingkatAksesArsip::active()->get(['id', 'kode', 'nama']),
        ]);
    }

    /**
     * Ajukan TTE dummy untuk beberapa arsip.
     */
    public function bulkAjukan(Request $request): RedirectResponse
    {
        Gate::authorize('kelola-tte.sign');

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:arsip,id',
            'nik_pimpinan' => 'nullable|string|max:255',
            'passphrase' => 'nullable|string|max:255',
            'sandi_pimpinan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $passphrase = $validated['passphrase'] ?? $validated['sandi_pimpinan'] ?? '';

        if (empty($passphrase)) {
            return redirect()->back()->withErrors([
                'passphrase' => 'Passphrase pimpinan wajib diisi.',
            ]);
        }

        /** @var User $pimpinan */
        $pimpinan = $request->user();

        if (! empty($validated['nik_pimpinan']) && $pimpinan->nik !== $validated['nik_pimpinan']) {
            $pimpinan->update(['nik' => $validated['nik_pimpinan']]);
        }

        $arsips = Arsip::whereIn('id', $validated['ids'])
            ->where('workflow_status', WorkflowStatus::WaitingTte)
            ->get();

        $count = 0;

        foreach ($arsips as $arsip) {
            $this->tteService->ajukanTte(
                $arsip,
                $pimpinan,
                $passphrase,
                $validated['catatan'] ?? null,
            );

            $this->workflowService->transition(
                arsip: $arsip,
                target: WorkflowStatus::Active,
                keterangan: 'Dokumen telah ditandatangani secara elektronik (dummy).',
                actor: $pimpinan,
                request: $request,
                action: 'tte',
            );

            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} arsip berhasil ditandatangani secara elektronik dan kini berstatus Aktif.");
    }

    /**
     * Ajukan TTE dummy untuk sebuah arsip.
     */
    public function ajukan(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('kelola-tte.sign');

        $validated = $request->validate([
            'nik_pimpinan' => 'nullable|string|max:255',
            'passphrase' => 'nullable|string|max:255',
            'sandi_pimpinan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $passphrase = $validated['passphrase'] ?? $validated['sandi_pimpinan'] ?? '';

        if (empty($passphrase)) {
            return redirect()->back()->withErrors([
                'passphrase' => 'Passphrase pimpinan wajib diisi.',
            ]);
        }

        if ($arsip->workflow_status !== WorkflowStatus::WaitingTte) {
            return redirect()->back()->withErrors([
                'workflow' => 'Arsip tidak dalam status menunggu TTE.',
            ]);
        }

        /** @var User $pimpinan */
        $pimpinan = $request->user();

        if (! empty($validated['nik_pimpinan']) && $pimpinan->nik !== $validated['nik_pimpinan']) {
            $pimpinan->update(['nik' => $validated['nik_pimpinan']]);
        }

        $this->tteService->ajukanTte(
            $arsip,
            $pimpinan,
            $passphrase,
            $validated['catatan'] ?? null,
        );

        $this->workflowService->transition(
            arsip: $arsip,
            target: WorkflowStatus::Active,
            keterangan: 'Dokumen telah ditandatangani secara elektronik (dummy).',
            actor: $pimpinan,
            request: $request,
            action: 'tte',
        );

        return redirect()->back()
            ->with('success', 'Arsip berhasil ditandatangani secara elektronik dan kini berstatus Aktif.');
    }

    /**
     * Kumpulkan ID yang digunakan beserta seluruh ancestor (parent) dari model hirarki.
     *
     * @param  class-string<KlasifikasiArsip|UnitOrganisasi>  $modelClass
     * @param  iterable<mixed>  $usedIds
     * @return list<int>
     */
    protected function collectWithAncestors(string $modelClass, iterable $usedIds): array
    {
        /** @var Collection<int, KlasifikasiArsip|UnitOrganisasi> $items */
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
