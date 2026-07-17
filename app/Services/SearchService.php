<?php

namespace App\Services;

use App\Interfaces\SearchServiceInterface;
use App\Models\Arsip;
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
            'klasifikasiArsip',
            'lokasiArsip',
            'statusArsip',
            'unitOrganisasi',
            'dokumen',
        ]);

        $query->where(function (Builder $q) use ($keyword) {
            $q->where('nomor_arsip', 'like', "%{$keyword}%")
                ->orWhere('judul', 'like', "%{$keyword}%")
                ->orWhere('deskripsi', 'like', "%{$keyword}%")
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
                })
                ->orWhereHas('statusArsip', function (Builder $sub) use ($keyword) {
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
            'klasifikasiArsip',
            'lokasiArsip',
            'statusArsip',
            'unitOrganisasi',
            'dokumen',
        ]);

        if (! empty($filters['search'])) {
            $keyword = (string) $filters['search'];
            $query->where(function (Builder $q) use ($keyword) {
                $q->where('nomor_arsip', 'like', "%{$keyword}%")
                    ->orWhere('judul', 'like', "%{$keyword}%")
                    ->orWhere('deskripsi', 'like', "%{$keyword}%")
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
                    })
                    ->orWhereHas('statusArsip', function (Builder $sub) use ($keyword) {
                        $sub->where('kode', 'like', "%{$keyword}%")
                            ->orWhere('nama', 'like', "%{$keyword}%");
                    });

                if (is_numeric($keyword) && strlen($keyword) === 4) {
                    $q->orWhereYear('tanggal_arsip', (int) $keyword);
                }
            });
        }

        if (! empty($filters['nomor_arsip'])) {
            $query->where('nomor_arsip', 'like', "%{$filters['nomor_arsip']}%");
        }

        if (! empty($filters['nomor_surat'])) {
            // Mapping nomor_surat to nomor_arsip since nomor_surat is not a column
            $query->where('nomor_arsip', 'like', "%{$filters['nomor_surat']}%");
        }

        if (! empty($filters['judul'])) {
            $query->where('judul', 'like', "%{$filters['judul']}%");
        }

        if (! empty($filters['status_arsip_id'])) {
            $query->where('status_arsip_id', $filters['status_arsip_id']);
        }

        if (! empty($filters['unit_organisasi_id'])) {
            $query->where('unit_organisasi_id', $filters['unit_organisasi_id']);
        }

        if (! empty($filters['klasifikasi_arsip_id'])) {
            $query->where('klasifikasi_arsip_id', $filters['klasifikasi_arsip_id']);
        }

        if (! empty($filters['lokasi_arsip_id'])) {
            $query->where('lokasi_arsip_id', $filters['lokasi_arsip_id']);
        }

        if (! empty($filters['tahun'])) {
            $query->whereYear('tanggal_arsip', (int) $filters['tahun']);
        }

        return $query;
    }
}
