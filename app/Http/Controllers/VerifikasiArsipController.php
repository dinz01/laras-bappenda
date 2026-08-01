<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VerifikasiArsipController extends Controller
{
    /**
     * Display arsip pending verification (workflow_status = review).
     */
    public function index(Request $request): Response
    {
        Gate::authorize('workflow.approve');

        $arsips = Arsip::query()
            ->with([
                'klasifikasiArsip',
                'lokasiArsip',
                'unitOrganisasi',
                'creator',
            ])
            ->where('workflow_status', WorkflowStatus::Review)
            ->orderBy('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('verifikasi-arsip/index', [
            'arsips' => $arsips,
        ]);
    }
}