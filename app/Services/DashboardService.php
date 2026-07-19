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
     * Statistik utama arsip berdasarkan status arsip (Aktif/Inaktif/Permanen).
     *
     * @return array{
     *   total: int,
     *   aktif: int,
     *   inaktif: int,
     *   permanen: int,
     *   bulanIni: int
     * }
     */
    public function mainStatistics(): array
    {
        $total = Arsip::count();

        $perStatus = Arsip::selectRaw('status_arsip_id, count(*) as total')
            ->groupBy('status_arsip_id')
            ->pluck('total', 'status_arsip_id')
            ->toArray();

        // SA-00001=Aktif, SA-00002=Inaktif, SA-00003=Permanen
        // Resolve IDs via names safely
        $statusIds = DB::table('status_arsip')
            ->whereIn('kode', ['SA-00001', 'SA-00002', 'SA-00003'])
            ->pluck('id', 'kode')
            ->toArray();

        $aktifId = $statusIds['SA-00001'] ?? 0;
        $inaktifId = $statusIds['SA-00002'] ?? 0;
        $permanenId = $statusIds['SA-00003'] ?? 0;

        $bulanIni = Arsip::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        return [
            'total' => $total,
            'aktif' => (int) ($perStatus[$aktifId] ?? 0),
            'inaktif' => (int) ($perStatus[$inaktifId] ?? 0),
            'permanen' => (int) ($perStatus[$permanenId] ?? 0),
            'bulanIni' => $bulanIni,
        ];
    }

    /**
     * Jumlah arsip per tahap (WorkflowStatus).
     *
     * @return array<string, int>
     */
    public function tahapStatistics(): array
    {
        $counts = Arsip::selectRaw('workflow_status, count(*) as total')
            ->groupBy('workflow_status')
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
    public function arsipPerTahun(): Collection
    {
        $dates = DB::table('arsip')
            ->whereNull('deleted_at')
            ->whereNotNull('tanggal_arsip')
            ->pluck('tanggal_arsip');

        $grouped = [];
        foreach ($dates as $date) {
            $year = (int) date('Y', is_string($date) ? strtotime($date) : $date);
            if (! isset($grouped[$year])) {
                $grouped[$year] = 0;
            }
            $grouped[$year]++;
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
    public function topUnitOrganisasi(): Collection
    {
        return DB::table('arsip')
            ->join('unit_organisasi', 'arsip.unit_organisasi_id', '=', 'unit_organisasi.id')
            ->whereNull('arsip.deleted_at')
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
    public function topKlasifikasi(): Collection
    {
        return DB::table('arsip')
            ->join('klasifikasi_arsip', 'arsip.klasifikasi_arsip_id', '=', 'klasifikasi_arsip.id')
            ->whereNull('arsip.deleted_at')
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
    public function recentActivities(): Collection
    {
        // Get 10 most recent workflow transitions
        $transitions = ArsipWorkflowHistory::with([
            'arsip' => fn ($q) => $q->withTrashed()->select(['id', 'nomor_arsip', 'judul']),
            'user:id,name',
        ])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (ArsipWorkflowHistory $h) => [
                'id' => $h->id,
                'arsip_id' => $h->arsip_id,
                'nomor_arsip' => $h->arsip->nomor_arsip,
                'judul' => $h->arsip->judul,
                'aktivitas' => 'Tahap berubah ke '.$h->status_baru->label(),
                'user' => $h->user ? $h->user->name : 'Sistem',
                'tanggal' => AppDateTime::dateTime($h->created_at) ?? '',
                'sort_key' => $h->created_at ? $h->created_at->timestamp : 0,
            ]);

        // Get 10 most recently created archives
        $newArsip = Arsip::with('creator:id,name')
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
     * @return Collection<int, array{nomor_arsip: string, judul: string, tahun_retensi_aktif: int, tanggal_arsip: string}>
     */
    public function arsipMendekatiRetensi(): Collection
    {
        return Arsip::with('retensiArsip:id,nama,retensi_aktif')
            ->whereNotNull('retensi_arsip_id')
            ->whereNotNull('tanggal_arsip')
            ->whereIn('workflow_status', [
                WorkflowStatus::Active->value,
                WorkflowStatus::Retention->value,
            ])
            ->orderBy('tanggal_arsip')
            ->limit(10)
            ->get()
            ->filter(fn (Arsip $a) => $a->retensiArsip !== null)
            ->map(fn (Arsip $a) => [
                'nomor_arsip' => $a->nomor_arsip,
                'judul' => $a->judul,
                'tahun_retensi_aktif' => (int) $a->retensiArsip->retensi_aktif,
                'tanggal_arsip' => $a->tanggal_arsip->toDateString(),
            ])
            ->values();
    }
}
