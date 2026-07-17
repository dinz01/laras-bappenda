<?php

namespace App\Http\Controllers;

use App\Models\Arsip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request to view the dashboard.
     */
    public function __invoke(Request $request): Response
    {
        $totalArsip = Arsip::count();

        $arsipAktif = Arsip::whereHas('statusArsip', function ($q) {
            $q->where('kode', 'SA-00001'); // Aktif
        })->count();

        // Count inactive archives as Record Center for now
        $recordCenter = Arsip::whereHas('statusArsip', function ($q) {
            $q->where('kode', 'SA-00002'); // Inaktif
        })->count();

        // Active Permohonan is 0 for now since feature is not implemented yet
        $permohonanAktif = 0;

        // Arsip under retention count
        $arsipRetensi = Arsip::whereNotNull('retensi_arsip_id')->count();

        // Activitas Bulan Ini - number of archives created this month
        $aktivitasBulanIni = Arsip::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return Inertia::render('dashboard', [
            'statistics' => [
                'totalArsip' => number_format($totalArsip, 0, ',', '.'),
                'arsipAktif' => number_format($arsipAktif, 0, ',', '.'),
                'recordCenter' => number_format($recordCenter, 0, ',', '.'),
                'permohonanAktif' => number_format($permohonanAktif, 0, ',', '.'),
                'arsipRetensi' => number_format($arsipRetensi, 0, ',', '.'),
                'aktivitasBulanIni' => number_format($aktivitasBulanIni, 0, ',', '.'),
            ],
        ]);
    }
}
