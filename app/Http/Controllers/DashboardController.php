<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Services\RecycleBinService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected RecycleBinService $recycleBinService
    ) {}

    /**
     * Handle the incoming request to view the dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $unitId = ($user && $user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) ? $user->unit_organisasi_id : null;

        $mainStats = $this->dashboardService->mainStatistics($unitId);
        $tahapStats = $this->dashboardService->tahapStatistics($unitId);
        $perTahun = $this->dashboardService->arsipPerTahun($unitId);
        $topUnit = $this->dashboardService->topUnitOrganisasi($unitId);
        $topKlasifikasi = $this->dashboardService->topKlasifikasi($unitId);
        $recentActivities = $this->dashboardService->recentActivities($unitId);
        $mendekatiRetensi = $this->dashboardService->arsipMendekatiRetensi($unitId);
        $recycleBinCount = ($user && $user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) ? 0 : $this->recycleBinService->pendingCount();

        return Inertia::render('dashboard', [
            'statistics' => [
                'totalArsip' => number_format($mainStats['total'], 0, ',', '.'),
                'arsipAktif' => number_format($mainStats['aktif'], 0, ',', '.'),
                'arsipInaktif' => number_format($mainStats['inaktif'], 0, ',', '.'),
                'menungguReview' => number_format($mainStats['review'], 0, ',', '.'),
                'perluRevisi' => number_format($mainStats['revisi'], 0, ',', '.'),
                'menungguTte' => number_format($mainStats['waitingTte'], 0, ',', '.'),
                'pemusnahan' => number_format($mainStats['destruction'], 0, ',', '.'),
            ],
            'tahapStatistics' => $tahapStats,
            'arsipPerTahun' => $perTahun,
            'topUnit' => $topUnit,
            'topKlasifikasi' => $topKlasifikasi,
            'recentActivities' => $recentActivities,
            'mendekatiRetensi' => $mendekatiRetensi,
            'recycleBinCount' => $recycleBinCount,
        ]);
    }
}
