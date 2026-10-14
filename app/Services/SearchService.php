<?php

namespace App\Services;

use App\Interfaces\SearchServiceInterface;
use App\Models\Arsip;
use App\Models\KlasifikasiArsip;
use App\Models\LokasiArsip;
use App\Models\UnitOrganisasi;
use Illuminate\Database\Eloquent\Builder;

class SearchService implements SearchServiceInterface
{
    /**
     * Cari arsip berdasarkan kata kunci.
     *
     * @return Builder<Arsip>
     */
    public function search(string $keyword): Builder
    {
        $query = Arsip::query()->with([
            'kategoriArsip',
            'klasifikasiArsip.nasibAkhir',
            'klasifikasiArsip.parent.nasibAkhir',
            'klasifikasiArsip.parent.parent.nasibAkhir',
            'klasifikasiArsip.parent.parent.parent.nasibAkhir',
            'lokasiArsip.parent.parent.parent.parent',
            'unitOrganisasi',
            'dokumen',
        ]);

        $query->where(function (Builder $q) use ($keyword) {
            $q->where('judul', 'like', "%{$keyword}%")
                ->orWhere('nop', 'like', "%{$keyword}%")
                ->orWhere('deskripsi', 'like', "%{$keyword}%")
                ->orWhere('nomor_arsip', 'like', "%{$keyword}%")
                ->orWhere('no_register', 'like', "%{$keyword}%")
                ->orWhere('npwpd', 'like', "%{$keyword}%")
                ->orWhere('nama_wajib_pajak', 'like', "%{$keyword}%")
                ->orWhereHas('kategoriArsip', function (Builder $sub) use ($keyword) {
                    $sub->where('kode', 'like', "%{$keyword}%")
                        ->orWhere('nama', 'like', "%{$keyword}%");
                })
                ->orWhereHas('klasifikasiArsip', function (Builder $sub) use ($keyword) {
                    $sub->where('kode', 'like', "%{$keyword}%")
                        ->orWhere('nama', 'like', "%{$keyword}%");
                })
                ->orWhereHas('unitOrganisasi', function (Builder $sub) use ($keyword) {
                    $sub->where('kode', 'like', "%{$keyword}%")
                        ->orWhere('nama', 'like', "%{$keyword}%");
                })
                ->orWhereHas('lokasiArsip', function (Builder $sub) use ($keyword) {
                    $sub->where('kode', 'like', "%{$keyword}%")
                        ->orWhere('nama', 'like', "%{$keyword}%");
                });

            if (is_numeric($keyword) && strlen($keyword) === 4) {
                $q->orWhereYear('tanggal_arsip', (int) $keyword);
            }
        });

        return $query;
    }

    /**
     * Cari arsip berdasarkan filter lanjutan.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Arsip>
     */
    public function advancedSearch(array $filters): Builder
    {
        $query = Arsip::query()->with([
            'kategoriArsip',
            'klasifikasiArsip.nasibAkhir',
            'klasifikasiArsip.parent.nasibAkhir',
            'klasifikasiArsip.parent.parent.nasibAkhir',
            'klasifikasiArsip.parent.parent.parent.nasibAkhir',
            'kondisiArsip',
            'tingkatAksesArsip',
            'lokasiArsip.parent.parent.parent.parent',
            'unitOrganisasi',
            'creator',
            'dokumen',
        ]);

        if (! empty($filters['search'])) {
            $keyword = (string) $filters['search'];
            $query->where(function (Builder $q) use ($keyword) {
                $q->where('judul', 'like', "%{$keyword}%")
                    ->orWhere('nop', 'like', "%{$keyword}%")
                    ->orWhere('deskripsi', 'like', "%{$keyword}%")
                    ->orWhere('nomor_arsip', 'like', "%{$keyword}%")
                    ->orWhere('no_register', 'like', "%{$keyword}%")
                    ->orWhere('npwpd', 'like', "%{$keyword}%")
                    ->orWhere('nama_wajib_pajak', 'like', "%{$keyword}%")
                    ->orWhereHas('kategoriArsip', function (Builder $sub) use ($keyword) {
                        $sub->where('kode', 'like', "%{$keyword}%")
                            ->orWhere('nama', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('klasifikasiArsip', function (Builder $sub) use ($keyword) {
                        $sub->where('kode', 'like', "%{$keyword}%")
                            ->orWhere('nama', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('unitOrganisasi', function (Builder $sub) use ($keyword) {
                        $sub->where('kode', 'like', "%{$keyword}%")
                            ->orWhere('nama', 'like', "%{$keyword}%");
                    })
                    ->orWhereHas('lokasiArsip', function (Builder $sub) use ($keyword) {
                        $sub->where('kode', 'like', "%{$keyword}%")
                            ->orWhere('nama', 'like', "%{$keyword}%");
                    });

                if (is_numeric($keyword) && strlen($keyword) === 4) {
                    $q->orWhereYear('tanggal_arsip', (int) $keyword);
                }
            });
        }

        if (! empty($filters['tanggal_arsip'])) {
            $query->whereDate('tanggal_arsip', $filters['tanggal_arsip']);
        }

        if (! empty($filters['nomor_arsip'])) {
            $query->where('nomor_arsip', 'like', "%{$filters['nomor_arsip']}%");
        }

        if (! empty($filters['judul'])) {
            $query->where('judul', 'like', "%{$filters['judul']}%");
        }

        if (! empty($filters['pajak'])) {
            $pajakKeyword = (string) $filters['pajak'];
            $query->where(function (Builder $q) use ($pajakKeyword) {
                $q->where('nop', 'like', "%{$pajakKeyword}%")
                    ->orWhere('npwpd', 'like', "%{$pajakKeyword}%")
                    ->orWhere('no_register', 'like', "%{$pajakKeyword}%")
                    ->orWhere('nama_wajib_pajak', 'like', "%{$pajakKeyword}%");
            });
        }

        if (! empty($filters['nop'])) {
            $query->where('nop', 'like', "%{$filters['nop']}%");
        }

        if (! empty($filters['unit_organisasi_id'])) {
            $rawId = $filters['unit_organisasi_id'];
            if (is_array($rawId)) {
                $unitIds = [];
                foreach ($rawId as $id) {
                    $unitIds = array_merge($unitIds, UnitOrganisasi::getSelfAndDescendantIds((int) $id));
                }
                $unitIds = array_values(array_unique($unitIds));
            } else {
                $unitIds = UnitOrganisasi::getSelfAndDescendantIds((int) $rawId);
            }

            $query->whereIn('unit_organisasi_id', $unitIds);
        }

        if (! empty($filters['klasifikasi_arsip_id'])) {
            $rawId = $filters['klasifikasi_arsip_id'];
            if (is_array($rawId)) {
                $klasifikasiIds = [];
                foreach ($rawId as $id) {
                    $klasifikasiIds = array_merge($klasifikasiIds, KlasifikasiArsip::getSelfAndDescendantIds((int) $id));
                }
                $klasifikasiIds = array_values(array_unique($klasifikasiIds));
            } else {
                $klasifikasiIds = KlasifikasiArsip::getSelfAndDescendantIds((int) $rawId);
            }

            $query->whereIn('klasifikasi_arsip_id', $klasifikasiIds);
        }

        if (! empty($filters['kategori_arsip_id'])) {
            $query->where('kategori_arsip_id', $filters['kategori_arsip_id']);
        }

        if (! empty($filters['kondisi_arsip_id'])) {
            $query->where('kondisi_arsip_id', $filters['kondisi_arsip_id']);
        }

        if (! empty($filters['tingkat_akses_arsip_id'])) {
            $query->where('tingkat_akses_arsip_id', $filters['tingkat_akses_arsip_id']);
        }

        if (! empty($filters['lokasi_arsip_id'])) {
            $rawId = $filters['lokasi_arsip_id'];
            if (is_array($rawId)) {
                $lokasiIds = [];
                foreach ($rawId as $id) {
                    $lokasiIds = array_merge($lokasiIds, LokasiArsip::getSelfAndDescendantIds((int) $id));
                }
                $lokasiIds = array_values(array_unique($lokasiIds));
            } else {
                $lokasiIds = LokasiArsip::getSelfAndDescendantIds((int) $rawId);
            }

            $query->whereIn('lokasi_arsip_id', $lokasiIds);
        }

        if (! empty($filters['deskripsi'])) {
            $query->where('deskripsi', 'like', "%{$filters['deskripsi']}%");
        }

        if (! empty($filters['pengunggah'])) {
            $pengunggahKeyword = (string) $filters['pengunggah'];
            $query->whereHas('creator', function (Builder $q) use ($pengunggahKeyword) {
                $q->where('name', 'like', "%{$pengunggahKeyword}%");
            });
        }

        if (! empty($filters['tahun'])) {
            $query->whereYear('tanggal_arsip', (int) $filters['tahun']);
        }

        return $query;
    }
}
