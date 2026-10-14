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
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class KelolaArsipController extends Controller
{
    /**
     * Tampilkan antrian kerja arsip: status review/revisi yang masih perlu ditindaklanjuti.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('kelola-arsip.view');

        /** @var User $user */
        $user = $request->user();

        $search = $request->string('search')->trim()->toString();
        $unitFilter = $request->integer('unit_organisasi_id') ?: null;
        $statusFilter = $request->string('workflow_status')->trim()->toString();

        // Status yang diizinkan tampil di halaman kelola arsip.
        $allowedStatuses = [
            WorkflowStatus::Review->value,
            WorkflowStatus::Revisi->value,
            WorkflowStatus::WaitingTte->value,
        ];

        $query = Arsip::query()
            ->with([
                'kategoriArsip',
                'klasifikasiArsip.parent.parent.parent.nasibAkhir',
                'lokasiArsip.parent.parent.parent.parent',
                'unitOrganisasi',
                'creator',
                'dokumen',
            ]);

        if ($statusFilter !== '' && $statusFilter !== 'all' && in_array($statusFilter, $allowedStatuses, true)) {
            $query->where('workflow_status', $statusFilter);
        } else {
            $query->whereIn('workflow_status', $allowedStatuses);
        }

        // Operator Unit Pengolah hanya melihat arsip yang dia kelola (unitnya sendiri).
        // Role lain (Admin, Arsiparis, dst) melihat seluruh antrian lintas unit.
        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            $query->where('unit_organisasi_id', $user->unit_organisasi_id);
        } elseif ($unitFilter) {
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

        if ($request->filled('catatan_revisi')) {
            $query->where('catatan_revisi', 'like', "%{$request->string('catatan_revisi')->value()}%");
        }

        $perPage = in_array($request->integer('per_page'), [15, 30, 50, 100], true)
            ? $request->integer('per_page')
            : 15;

        $arsips = $query
            ->orderBy('tanggal_arsip', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $baseFilterArsipQuery = Arsip::query()->whereIn('workflow_status', $allowedStatuses);
        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            $baseFilterArsipQuery->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        $usedKlasifikasiIds = (clone $baseFilterArsipQuery)->whereNotNull('klasifikasi_arsip_id')->distinct()->pluck('klasifikasi_arsip_id')->all();
        $usedUnitIds = (clone $baseFilterArsipQuery)->whereNotNull('unit_organisasi_id')->distinct()->pluck('unit_organisasi_id')->all();
        $usedKategoriIds = (clone $baseFilterArsipQuery)->whereNotNull('kategori_arsip_id')->distinct()->pluck('kategori_arsip_id')->all();
        $usedWorkflowStatuses = (clone $baseFilterArsipQuery)
            ->distinct()
            ->pluck('workflow_status')
            ->map(fn ($s) => $s instanceof WorkflowStatus ? $s->value : (string) $s)
            ->all();

        $allKlasifikasiIds = $this->collectWithAncestors(KlasifikasiArsip::class, $usedKlasifikasiIds);
        $allUnitIds = $this->collectWithAncestors(UnitOrganisasi::class, $usedUnitIds);

        $filterKlasifikasis = KlasifikasiArsip::with('nasibAkhir')
            ->whereIn('id', $allKlasifikasiIds)
            ->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']);

        $filterUnitOrganisasis = UnitOrganisasi::whereIn('id', $allUnitIds)
            ->get(['id', 'kode', 'nama', 'tipe', 'parent_id']);

        $filterKategoriArsips = KategoriArsip::whereIn('id', $usedKategoriIds)
            ->get(['id', 'kode', 'nama']);

        return Inertia::render('kelola-arsip/index', [
            'arsips' => $arsips,
            'filters' => array_merge([
                'search' => $search,
                'unit_organisasi_id' => $unitFilter,
                'workflow_status' => $statusFilter !== '' && $statusFilter !== 'all' && in_array($statusFilter, $allowedStatuses, true) ? $statusFilter : null,
                'per_page' => $perPage,
            ], $request->only(['tanggal_arsip', 'nomor_arsip', 'judul', 'kategori_arsip_id', 'klasifikasi_arsip_id', 'catatan_revisi'])),
            'showUnitFilter' => ! $user->hasRole(['Operator Unit', 'Operator Unit Pengolah']),
            'klasifikasis' => KlasifikasiArsip::with('nasibAkhir')->active()->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']),
            'kategoriArsips' => KategoriArsip::active()->get(['id', 'kode', 'nama']),
            'unitOrganisasis' => UnitOrganisasi::active()->get(['id', 'kode', 'nama', 'tipe', 'parent_id']),
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
            'lokasiArsips' => LokasiArsip::active()->get(['id', 'kode', 'nama', 'parent_id']),
            'kondisiArsips' => KondisiArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatAksesArsips' => TingkatAksesArsip::active()->get(['id', 'kode', 'nama']),
            'filterKlasifikasis' => $filterKlasifikasis,
            'filterUnitOrganisasis' => $filterUnitOrganisasis,
            'filterKategoriArsips' => $filterKategoriArsips,
            'filterWorkflowStatuses' => $usedWorkflowStatuses,
        ]);
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
