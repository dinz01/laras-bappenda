<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pengelolaan;

use App\Enums\PeminjamanStatus;
use App\Enums\WorkflowStatus;
use App\Http\Controllers\Controller;
use App\Models\Arsip;
use App\Models\PeminjamanArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Tampilkan halaman peminjaman arsip.
     * Operator: lihat arsip inaktif + riwayat permohonan milik sendiri.
     * Pimpinan/Arsiparis: lihat semua permohonan pending/history.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('peminjaman.view');

        Arsip::syncExpiredRetentionStatus();

        /** @var User $user */
        $user = Auth::user();
        $isOperator = ! $user->can('peminjaman.approve');

        $search = $request->string('search')->trim()->toString();
        $unitFilter = $request->integer('unit_organisasi_id') ?: null;
        $statusFilter = $request->string('status')->trim()->toString() ?: null;

        // Daftar arsip inaktif
        $arsipQuery = Arsip::query()
            ->with([
                'klasifikasiArsip.parent.parent.parent.nasibAkhir',
                'lokasiArsip.parent.parent.parent.parent',
                'unitOrganisasi',
                'creator',
                'peminjamans' => fn ($q) => $q->where('pemohon_id', $user->id)->latest(),
            ])
            ->where('workflow_status', WorkflowStatus::Inactive);

        if ($isOperator && $user->unit_organisasi_id) {
            $arsipQuery->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        if ($unitFilter) {
            $arsipQuery->where('unit_organisasi_id', $unitFilter);
        }

        if ($search !== '') {
            $arsipQuery->where(function ($q) use ($search): void {
                $q->where('nomor_arsip', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tanggal_arsip')) {
            $arsipQuery->whereDate('tanggal_arsip', $request->string('tanggal_arsip')->value());
        }

        if ($request->filled('nomor_arsip')) {
            $nomorVal = $request->string('nomor_arsip')->value();
            $arsipQuery->where('nomor_arsip', 'like', "%{$nomorVal}%");
        }

        if ($request->filled('judul')) {
            $judulVal = $request->string('judul')->value();
            $arsipQuery->where('judul', 'like', "%{$judulVal}%");
        }

        $perPage = in_array($request->integer('per_page'), [15, 30, 50, 100], true)
            ? $request->integer('per_page')
            : 15;

        $arsips = $arsipQuery
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Daftar permohonan (untuk Pimpinan/Arsiparis)
        $permohonanQuery = PeminjamanArsip::query()
            ->with([
                'arsip.unitOrganisasi',
                'pemohon',
                'reviewer',
            ]);

        if ($isOperator) {
            $permohonanQuery->where('pemohon_id', $user->id);
        }

        if ($statusFilter) {
            $permohonanQuery->where('status', $statusFilter);
        }

        if ($request->filled('tanggal_arsip')) {
            $permohonanQuery->whereDate('created_at', $request->string('tanggal_arsip')->value());
        }

        if ($request->filled('nomor_arsip')) {
            $permohonanQuery->whereHas('arsip', fn ($q) => $q->where('nomor_arsip', 'like', "%{$request->string('nomor_arsip')->value()}%"));
        }

        if ($request->filled('judul')) {
            $permohonanQuery->whereHas('arsip', fn ($q) => $q->where('judul', 'like', "%{$request->string('judul')->value()}%"));
        }

        if ($request->filled('pemohon_id')) {
            $permohonanQuery->where('pemohon_id', $request->integer('pemohon_id'));
        } elseif ($request->filled('pemohon')) {
            $permohonanQuery->whereHas('pemohon', fn ($q) => $q->where('name', 'like', "%{$request->string('pemohon')->value()}%"));
        }

        if ($request->filled('alasan')) {
            $permohonanQuery->where('alasan', 'like', "%{$request->string('alasan')->value()}%");
        }

        $permohonan = $permohonanQuery
            ->orderByRaw("CASE status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'rejected' THEN 3 ELSE 4 END")
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'permohonan_page')
            ->withQueryString();

        $basePermohonanFilterQuery = PeminjamanArsip::query();
        if ($isOperator) {
            $basePermohonanFilterQuery->where('pemohon_id', $user->id);
        }

        $pemohonIdsQuery = (clone $basePermohonanFilterQuery)->select('pemohon_id')->distinct();
        $pemohonOptions = User::query()
            ->whereIn('id', $pemohonIdsQuery)
            ->orderBy('name')
            ->get(['id', 'name']);

        $usedPeminjamanStatuses = (clone $basePermohonanFilterQuery)
            ->select('status')
            ->distinct()
            ->pluck('status')
            ->map(fn ($s) => $s instanceof PeminjamanStatus ? $s->value : (string) $s)
            ->all();

        $baseFilterArsipQuery = Arsip::query()->where('workflow_status', WorkflowStatus::Inactive);
        if ($isOperator && $user->unit_organisasi_id) {
            $baseFilterArsipQuery->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        $usedUnitIds = (clone $baseFilterArsipQuery)->whereNotNull('unit_organisasi_id')->distinct()->pluck('unit_organisasi_id')->all();
        $allUnitIds = $this->collectWithAncestors(UnitOrganisasi::class, $usedUnitIds);
        $filterUnitOrganisasis = UnitOrganisasi::whereIn('id', $allUnitIds)
            ->get(['id', 'kode', 'nama', 'tipe', 'parent_id']);

        return Inertia::render('pengelolaan/peminjaman/index', [
            'arsips' => $arsips,
            'permohonan' => $permohonan,
            'filters' => array_merge([
                'search' => $search,
                'unit_organisasi_id' => $unitFilter,
                'status' => $statusFilter,
                'per_page' => $perPage,
            ], $request->only(['tanggal_arsip', 'nomor_arsip', 'judul', 'pemohon', 'pemohon_id', 'alasan'])),
            'unitOrganisasis' => UnitOrganisasi::active()->orderBy('nama')->get(['id', 'kode', 'nama', 'tipe', 'parent_id']),
            'filterUnitOrganisasis' => $filterUnitOrganisasis,
            'pemohonOptions' => $pemohonOptions,
            'filterStatuses' => $usedPeminjamanStatuses,
            'isOperator' => $isOperator,
        ]);
    }

    /**
     * Operator mengajukan peminjaman arsip.
     */
    public function store(Request $request, Arsip $arsip): RedirectResponse
    {
        Gate::authorize('peminjaman.create');

        /** @var User $user */
        $user = Auth::user();

        if ($arsip->workflow_status !== WorkflowStatus::Inactive) {
            return back()->withErrors(['arsip' => 'Hanya arsip berstatus Inaktif yang dapat dipinjam.']);
        }

        $alreadyPending = PeminjamanArsip::where('arsip_id', $arsip->id)
            ->where('pemohon_id', $user->id)
            ->where('status', PeminjamanStatus::Pending)
            ->exists();

        if ($alreadyPending) {
            return back()->withErrors(['arsip' => 'Anda sudah memiliki permohonan yang sedang menunggu persetujuan untuk arsip ini.']);
        }

        $validated = $request->validate([
            'alasan' => ['required', 'string', 'max:1000'],
        ]);

        $peminjaman = PeminjamanArsip::create([
            'arsip_id' => $arsip->id,
            'pemohon_id' => $user->id,
            'alasan' => $validated['alasan'],
            'status' => PeminjamanStatus::Pending,
        ]);

        $this->notificationService->notifyPeminjamanRequested($peminjaman, $user, $arsip);

        $this->auditLogService->log(
            'peminjaman.requested',
            $peminjaman,
            null,
            [
                'arsip_id' => $arsip->id,
                'nomor_arsip' => $arsip->nomor_arsip,
                'judul' => $arsip->judul,
                'alasan' => $validated['alasan'],
                'status' => PeminjamanStatus::Pending->value,
            ],
            $user,
        );

        return back()->with('success', 'Permohonan peminjaman berhasil diajukan.');
    }

    /**
     * Pimpinan/Arsiparis menyetujui permohonan.
     */
    public function approve(Request $request, PeminjamanArsip $peminjaman): RedirectResponse
    {
        Gate::authorize('peminjaman.view');

        /** @var User $user */
        $user = Auth::user();

        if (! $user->can('peminjaman.approve')) {
            abort(403, 'Tidak diizinkan.');
        }

        if ($peminjaman->status !== PeminjamanStatus::Pending) {
            return back()->withErrors(['peminjaman' => 'Permohonan ini sudah diproses.']);
        }

        $validated = $request->validate([
            'catatan_peninjau' => ['nullable', 'string', 'max:1000'],
        ]);

        $peminjaman->update([
            'status' => PeminjamanStatus::Approved,
            'catatan_peninjau' => $validated['catatan_peninjau'] ?? null,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        $peminjaman->load('arsip');
        $this->notificationService->notifyPeminjamanReviewed($peminjaman, $user, true, $validated['catatan_peninjau'] ?? null);

        $this->auditLogService->log(
            'peminjaman.approved',
            $peminjaman,
            ['status' => PeminjamanStatus::Pending->value],
            [
                'status' => PeminjamanStatus::Approved->value,
                'catatan_peninjau' => $validated['catatan_peninjau'] ?? null,
            ],
            $user,
        );

        return back()->with('success', 'Permohonan peminjaman disetujui.');
    }

    /**
     * Pimpinan/Arsiparis menolak permohonan.
     */
    public function reject(Request $request, PeminjamanArsip $peminjaman): RedirectResponse
    {
        Gate::authorize('peminjaman.view');

        /** @var User $user */
        $user = Auth::user();

        if (! $user->can('peminjaman.approve')) {
            abort(403, 'Tidak diizinkan.');
        }

        if ($peminjaman->status !== PeminjamanStatus::Pending) {
            return back()->withErrors(['peminjaman' => 'Permohonan ini sudah diproses.']);
        }

        $validated = $request->validate([
            'catatan_peninjau' => ['required', 'string', 'max:1000'],
        ]);

        $peminjaman->update([
            'status' => PeminjamanStatus::Rejected,
            'catatan_peninjau' => $validated['catatan_peninjau'],
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        $peminjaman->load('arsip');
        $this->notificationService->notifyPeminjamanReviewed($peminjaman, $user, false, $validated['catatan_peninjau']);

        $this->auditLogService->log(
            'peminjaman.rejected',
            $peminjaman,
            ['status' => PeminjamanStatus::Pending->value],
            [
                'status' => PeminjamanStatus::Rejected->value,
                'catatan_peninjau' => $validated['catatan_peninjau'],
            ],
            $user,
        );

        return back()->with('success', 'Permohonan peminjaman ditolak.');
    }

    /**
     * Pimpinan/Arsiparis menyetujui beberapa permohonan sekaligus.
     */
    public function bulkApprove(Request $request): RedirectResponse
    {
        Gate::authorize('peminjaman.view');

        /** @var User $user */
        $user = Auth::user();

        if (! $user->can('peminjaman.approve')) {
            abort(403, 'Tidak diizinkan.');
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:peminjaman_arsip,id'],
            'catatan_peninjau' => ['nullable', 'string', 'max:1000'],
        ]);

        $peminjamans = PeminjamanArsip::whereIn('id', $validated['ids'])
            ->where('status', PeminjamanStatus::Pending)
            ->get();

        foreach ($peminjamans as $peminjaman) {
            $peminjaman->update([
                'status' => PeminjamanStatus::Approved,
                'catatan_peninjau' => $validated['catatan_peninjau'] ?? null,
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

            $peminjaman->load('arsip');
            $this->notificationService->notifyPeminjamanReviewed($peminjaman, $user, true, $validated['catatan_peninjau'] ?? null);

            $this->auditLogService->log(
                'peminjaman.approved',
                $peminjaman,
                ['status' => PeminjamanStatus::Pending->value],
                [
                    'status' => PeminjamanStatus::Approved->value,
                    'catatan_peninjau' => $validated['catatan_peninjau'] ?? null,
                ],
                $user,
            );
        }

        $count = $peminjamans->count();

        return back()->with('success', "{$count} permohonan peminjaman disetujui.");
    }

    /**
     * Pimpinan/Arsiparis menolak beberapa permohonan sekaligus.
     */
    public function bulkReject(Request $request): RedirectResponse
    {
        Gate::authorize('peminjaman.view');

        /** @var User $user */
        $user = Auth::user();

        if (! $user->can('peminjaman.approve')) {
            abort(403, 'Tidak diizinkan.');
        }

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:peminjaman_arsip,id'],
            'catatan_peninjau' => ['required', 'string', 'max:1000'],
        ]);

        $peminjamans = PeminjamanArsip::whereIn('id', $validated['ids'])
            ->where('status', PeminjamanStatus::Pending)
            ->get();

        foreach ($peminjamans as $peminjaman) {
            $peminjaman->update([
                'status' => PeminjamanStatus::Rejected,
                'catatan_peninjau' => $validated['catatan_peninjau'],
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);

            $peminjaman->load('arsip');
            $this->notificationService->notifyPeminjamanReviewed($peminjaman, $user, false, $validated['catatan_peninjau']);

            $this->auditLogService->log(
                'peminjaman.rejected',
                $peminjaman,
                ['status' => PeminjamanStatus::Pending->value],
                [
                    'status' => PeminjamanStatus::Rejected->value,
                    'catatan_peninjau' => $validated['catatan_peninjau'],
                ],
                $user,
            );
        }

        $count = $peminjamans->count();

        return back()->with('success', "{$count} permohonan peminjaman ditolak.");
    }

    /**
     * Kumpulkan ID yang digunakan beserta seluruh ancestor (parent) dari model hirarki.
     *
     * @param  class-string<UnitOrganisasi>  $modelClass
     * @param  iterable<mixed>  $usedIds
     * @return list<int>
     */
    protected function collectWithAncestors(string $modelClass, iterable $usedIds): array
    {
        /** @var Collection<int, UnitOrganisasi> $items */
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
