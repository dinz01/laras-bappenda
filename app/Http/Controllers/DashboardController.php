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
        $mainStats = $this->dashboardService->mainStatistics();
        $tahapStats = $this->dashboardService->tahapStatistics();
        $perTahun = $this->dashboardService->arsipPerTahun();
        $topUnit = $this->dashboardService->topUnitOrganisasi();
        $topKlasifikasi = $this->dashboardService->topKlasifikasi();
        $recentActivities = $this->dashboardService->recentActivities();
        $mendekatiRetensi = $this->dashboardService->arsipMendekatiRetensi();
        $recycleBinCount = $this->recycleBinService->pendingCount();

        return Inertia::render('dashboard', [
            'statistics' => [
                'totalArsip' => number_format($mainStats['total'], 0, ',', '.'),
                'arsipAktif' => number_format($mainStats['aktif'], 0, ',', '.'),
                'arsipInaktif' => number_format($mainStats['inaktif'], 0, ',', '.'),
                'arsipPermanen' => number_format($mainStats['permanen'], 0, ',', '.'),
                'aktivitasBulanIni' => number_format($mainStats['bulanIni'], 0, ',', '.'),
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
