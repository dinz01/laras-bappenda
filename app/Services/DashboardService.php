<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\ArsipWorkflowHistory;
use App\Support\AppDateTime;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Statistik utama arsip untuk score card.
     *
     * @return array{
     *   total: int,
     *   aktif: int,
     *   inaktif: int,
     *   review: int,
     *   revisi: int,
     *   waitingTte: int,
     *   destruction: int,
     *   permanen: int,
     *   bulanIni: int
     * }
     */
    public function mainStatistics(?int $unitId = null): array
    {
        $base = Arsip::query();
        if ($unitId !== null) {
            $base->where('unit_organisasi_id', $unitId);
        }

        $total = (clone $base)->count();
        $aktif = (clone $base)->where('workflow_status', WorkflowStatus::Active->value)->count();
        $inaktif = (clone $base)->where('workflow_status', WorkflowStatus::Inactive->value)->count();
        $review = (clone $base)->where('workflow_status', WorkflowStatus::Review->value)->count();
        $revisi = (clone $base)->where('workflow_status', WorkflowStatus::Revisi->value)->count();
        $waitingTte = (clone $base)->where('workflow_status', WorkflowStatus::WaitingTte->value)->count();
        $musnah = (clone $base)->where('workflow_status', WorkflowStatus::Musnah->value)->count();
        $permanen = (clone $base)->where('workflow_status', WorkflowStatus::Permanen->value)->count();

        $bulanIni = (clone $base)->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        return [
            'total' => $total,
            'aktif' => $aktif,
            'inaktif' => $inaktif,
            'review' => $review,
            'revisi' => $revisi,
            'waitingTte' => $waitingTte,
            'musnah' => $musnah,
            'destruction' => $musnah,
            'permanen' => $permanen,
            'bulanIni' => $bulanIni,
        ];
    }

    /**
     * Jumlah arsip per tahap (WorkflowStatus).
     *
     * @return array<string, int>
     */
    public function tahapStatistics(?int $unitId = null): array
    {
        $query = Arsip::selectRaw('workflow_status, count(*) as total');
        if ($unitId !== null) {
            $query->where('unit_organisasi_id', $unitId);
        }

        $counts = $query->groupBy('workflow_status')
            ->pluck('total', 'workflow_status')
            ->toArray();

        $result = [];
        foreach (WorkflowStatus::cases() as $status) {
            $result[$status->value] = (int) ($counts[$status->value] ?? 0);
        }

        return $result;
    }

    /**
     * Jumlah arsip per tahun berdasarkan tanggal_arsip.
     *
     * @return Collection<int, array{tahun: int, total: int}>
     */
    public function arsipPerTahun(?int $unitId = null): Collection
    {
        $query = DB::table('arsip')
            ->whereNull('deleted_at')
            ->whereNotNull('tanggal_arsip');

        if ($unitId !== null) {
            $query->where('unit_organisasi_id', $unitId);
        }

        $dates = $query->pluck('tanggal_arsip');

        $grouped = [];
        foreach ($dates as $date) {
            if (! $date) {
                continue;
            }
            // Parse robustly: might be '2024-05-12' or '2024-05-12 00:00:00' or Carbon or string
            $year = null;
            if (is_numeric($date) && strlen((string) $date) === 4) {
                $year = (int) $date;
            } else {
                $time = strtotime((string) $date);
                if ($time !== false) {
                    $year = (int) date('Y', $time);
                }
            }

            if ($year && $year > 1900 && $year < 2100) {
                $grouped[$year] = ($grouped[$year] ?? 0) + 1;
            }
        }

        ksort($grouped);

        $result = [];
        foreach ($grouped as $year => $total) {
            $result[] = [
                'tahun' => $year,
                'total' => $total,
            ];
        }

        return collect($result);
    }

    /**
     * Top 10 unit organisasi berdasarkan jumlah arsip.
     *
     * @return Collection<int, array{nama: string, kode: string, total: int}>
     */
    public function topUnitOrganisasi(?int $unitId = null): Collection
    {
        $query = DB::table('arsip')
            ->join('unit_organisasi', 'arsip.unit_organisasi_id', '=', 'unit_organisasi.id')
            ->whereNull('arsip.deleted_at');

        if ($unitId !== null) {
            $query->where('arsip.unit_organisasi_id', $unitId);
        }

        return $query
            ->selectRaw('unit_organisasi.nama, unit_organisasi.kode, count(*) as total')
            ->groupBy('arsip.unit_organisasi_id', 'unit_organisasi.nama', 'unit_organisasi.kode')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'nama' => (string) $row->nama,
                'kode' => (string) $row->kode,
                'total' => (int) $row->total,
            ]);
    }

    /**
     * Top 10 klasifikasi arsip berdasarkan jumlah arsip.
     *
     * @return Collection<int, array{nama: string, kode: string, total: int}>
     */
    public function topKlasifikasi(?int $unitId = null): Collection
    {
        $query = DB::table('arsip')
            ->join('klasifikasi_arsip', 'arsip.klasifikasi_arsip_id', '=', 'klasifikasi_arsip.id')
            ->whereNull('arsip.deleted_at');

        if ($unitId !== null) {
            $query->where('arsip.unit_organisasi_id', $unitId);
        }

        return $query
            ->selectRaw('klasifikasi_arsip.nama, klasifikasi_arsip.kode, count(*) as total')
            ->groupBy('arsip.klasifikasi_arsip_id', 'klasifikasi_arsip.nama', 'klasifikasi_arsip.kode')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'nama' => (string) $row->nama,
                'kode' => (string) $row->kode,
                'total' => (int) $row->total,
            ]);
    }

    /**
     * 10 aktivitas arsip terbaru (dibuat, diubah, atau berpindah tahap).
     *
     * Menggabungkan:
     * 1. Arsip terbaru dibuat
     * 2. Transisi tahap terbaru
     *
     * @return Collection<int, array{id: int, arsip_id: int, nomor_arsip: string, judul: string, aktivitas: string, user: string, tanggal: string}>
     */
    public function recentActivities(?int $unitId = null): Collection
    {
        // Get 10 most recent workflow transitions
        $transitionsQuery = ArsipWorkflowHistory::with([
            'arsip' => fn ($q) => $q->withTrashed()->select(['id', 'nomor_arsip', 'judul', 'unit_organisasi_id']),
            'user:id,name',
        ]);

        if ($unitId !== null) {
            $transitionsQuery->whereHas('arsip', function ($q) use ($unitId): void {
                /** @phpstan-ignore-next-line */
                $q->withTrashed()->where('unit_organisasi_id', $unitId);
            });
        }

        $transitions = $transitionsQuery
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (ArsipWorkflowHistory $h) => [
                'id' => $h->id,
                'arsip_id' => $h->arsip_id,
                'nomor_arsip' => $h->arsip ? $h->arsip->nomor_arsip : '-',
                'judul' => $h->arsip ? $h->arsip->judul : '-',
                'aktivitas' => 'Tahap berubah ke '.$h->status_baru->label(),
                'user' => $h->user ? $h->user->name : 'Sistem',
                'tanggal' => AppDateTime::dateTime($h->created_at) ?? '',
                'sort_key' => $h->created_at ? $h->created_at->timestamp : 0,
            ]);

        // Get 10 most recently created archives
        $newArsipQuery = Arsip::with('creator:id,name');

        if ($unitId !== null) {
            $newArsipQuery->where('unit_organisasi_id', $unitId);
        }

        $newArsip = $newArsipQuery
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (Arsip $a) => [
                'id' => $a->id * -1, // negative to avoid collision with history IDs
                'arsip_id' => $a->id,
                'nomor_arsip' => $a->nomor_arsip,
                'judul' => $a->judul,
                'aktivitas' => 'Arsip dibuat',
                'user' => $a->creator ? $a->creator->name : 'Sistem',
                'tanggal' => AppDateTime::dateTime($a->created_at) ?? '',
                'sort_key' => $a->created_at ? $a->created_at->timestamp : 0,
            ]);

        return $transitions->concat($newArsip)
            ->sortByDesc('sort_key')
            ->values()
            ->take(10)
            ->map(fn ($item) => [
                'id' => (int) $item['id'],
                'arsip_id' => (int) $item['arsip_id'],
                'nomor_arsip' => (string) $item['nomor_arsip'],
                'judul' => (string) $item['judul'],
                'aktivitas' => (string) $item['aktivitas'],
                'user' => (string) $item['user'],
                'tanggal' => (string) $item['tanggal'],
            ]);
    }

    /**
     * Arsip yang mendekati masa akhir retensi aktif dalam 1 tahun ke depan.
     *
     * @return Collection<int, array{nomor_arsip: string, judul: string, tahun_retensi_aktif: int, tanggal_arsip: string, tanggal_inaktif: string, tanggal_inaktif_full: string, sisa_waktu: non-falsy-string, is_expired: bool}>
     */
    public function arsipMendekatiRetensi(?int $unitId = null): Collection
    {
        $query = Arsip::with('klasifikasiArsip:id,nama,retensi_aktif')
            ->whereHas('klasifikasiArsip', fn ($q) => $q->whereNotNull('retensi_aktif'))
            ->whereNotNull('tanggal_arsip')
            ->where('workflow_status', WorkflowStatus::Active->value);

        if ($unitId !== null) {
            $query->where('unit_organisasi_id', $unitId);
        }

        return $query
            ->orderBy('tanggal_arsip')
            ->limit(10)
            ->get()
            ->filter(fn (Arsip $a) => $a->klasifikasiArsip !== null)
            ->map(function (Arsip $a) {
                $retensiAktifTahun = (int) $a->klasifikasiArsip->retensi_aktif;
                $tglArsip = $a->tanggal_arsip;
                $tglInaktif = $tglArsip ? $tglArsip->copy()->addYears($retensiAktifTahun) : null;

                $sisaBulan = $tglInaktif ? (int) now()->diffInMonths($tglInaktif, false) : 0;
                $sisaHari = $tglInaktif ? (int) now()->diffInDays($tglInaktif, false) : 0;

                $keteranganSisa = '';
                if ($sisaHari <= 0) {
                    $keteranganSisa = 'Lewat waktu';
                } elseif ($sisaBulan < 1) {
                    $keteranganSisa = "{$sisaHari} hari lagi";
                } elseif ($sisaBulan < 12) {
                    $keteranganSisa = "{$sisaBulan} bln lagi";
                } else {
                    $tahunSisa = floor($sisaBulan / 12);
                    $bulanSisa = $sisaBulan % 12;
                    $keteranganSisa = $bulanSisa > 0 ? "{$tahunSisa} thn {$bulanSisa} bln" : "{$tahunSisa} thn lagi";
                }

                return [
                    'nomor_arsip' => $a->nomor_arsip,
                    'judul' => $a->judul,
                    'tahun_retensi_aktif' => $retensiAktifTahun,
                    'tanggal_arsip' => $tglArsip ? $tglArsip->toDateString() : '',
                    'tanggal_inaktif' => $tglInaktif ? $tglInaktif->translatedFormat('F Y') : '-',
                    'tanggal_inaktif_full' => $tglInaktif ? $tglInaktif->translatedFormat('d M Y') : '-',
                    'sisa_waktu' => $keteranganSisa,
                    'is_expired' => $sisaHari <= 0,
                ];
            })
            ->values();
    }
}
