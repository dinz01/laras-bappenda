<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pengelolaan;

use App\Enums\WorkflowStatus;
use App\Http\Controllers\Controller;
use App\Models\Arsip;
use App\Models\KategoriArsip;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\TingkatAksesArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use App\Services\SearchService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ArsipInaktifController extends Controller
{
    public function __construct(
        protected SearchService $searchService,
    ) {}

    /**
     * Tampilkan daftar arsip inaktif.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Arsip::class);

        Arsip::syncExpiredRetentionStatus();

        /** @var User $user */
        $user = $request->user();

        $query = $this->searchService->advancedSearch($request->all());
        $query->where('workflow_status', WorkflowStatus::Inactive->value);

        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            $query->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        $perPage = in_array($request->integer('per_page'), [15, 30, 50, 100], true)
            ? $request->integer('per_page')
            : 15;

        $arsips = $query
            ->orderByDesc('tanggal_arsip')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        // Base query untuk mengambil opsi filter yang ada di arsip inaktif
        $baseFilterArsipQuery = Arsip::query()
            ->where('workflow_status', WorkflowStatus::Inactive->value);

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

        // Master lists lengkap untuk referensi
        $klasifikasis = KlasifikasiArsip::with('nasibAkhir')->active()->get(['id', 'kode', 'nama', 'parent_id', 'retensi_aktif', 'retensi_inaktif', 'nasib_akhir_id']);
        $unitOrganisasis = $user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])
            ? []
            : UnitOrganisasi::active()->orderBy('nama')->get(['id', 'kode', 'nama', 'tipe', 'parent_id']);
        $lokasiArsips = LokasiArsip::active()->get(['id', 'kode', 'nama', 'parent_id']);
        $kategoriArsips = KategoriArsip::active()->get(['id', 'kode', 'nama']);
        $kondisiArsips = KondisiArsip::active()->get(['id', 'kode', 'nama']);
        $tingkatAksesArsips = TingkatAksesArsip::active()->get(['id', 'kode', 'nama']);

        return Inertia::render('pengelolaan/arsip-inaktif/index', [
            'arsips' => $arsips,
            'filters' => $request->only([
                'search', 'tanggal_arsip', 'nomor_arsip', 'judul', 'pajak', 'nop',
                'unit_organisasi_id', 'klasifikasi_arsip_id', 'kategori_arsip_id',
                'kondisi_arsip_id', 'tingkat_akses_arsip_id', 'lokasi_arsip_id',
                'deskripsi', 'tahun', 'per_page',
            ]),
            'unitOrganisasis' => $unitOrganisasis,
            'klasifikasis' => $klasifikasis,
            'lokasiArsips' => $lokasiArsips,
            'kategoriArsips' => $kategoriArsips,
            'kondisiArsips' => $kondisiArsips,
            'tingkatAksesArsips' => $tingkatAksesArsips,
            'filterKlasifikasis' => $filterKlasifikasis,
            'filterUnitOrganisasis' => $filterUnitOrganisasis,
            'filterLokasiArsips' => $filterLokasiArsips,
            'filterKategoriArsips' => $filterKategoriArsips,
            'filterKondisiArsips' => $filterKondisiArsips,
            'filterTingkatAksesArsips' => $filterTingkatAksesArsips,
            'tahuns' => $tahuns,
        ]);
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
