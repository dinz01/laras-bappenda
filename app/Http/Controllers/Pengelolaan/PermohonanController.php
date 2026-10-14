<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pengelolaan;

use App\Enums\WorkflowStatus;
use App\Http\Controllers\Controller;
use App\Models\Arsip;
use App\Models\UnitOrganisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PermohonanController extends Controller
{
    /**
     * Display a listing of inaktif arsip for permohonan.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('peminjaman.view');
        $search = $request->string('search')->trim()->toString();
        $unitFilter = $request->integer('unit_organisasi_id') ?: null;

        $query = Arsip::query()
            ->with([
                'klasifikasiArsip.parent.parent.parent.nasibAkhir',
                'lokasiArsip.parent.parent.parent.parent',
                'unitOrganisasi',
                'creator',
            ])
            ->where('workflow_status', WorkflowStatus::Inactive);

        if ($unitFilter) {
            $query->where('unit_organisasi_id', $unitFilter);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('nomor_arsip', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        $arsips = $query
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pengelolaan/permohonan/index', [
            'arsips' => $arsips,
            'filters' => [
                'search' => $search,
                'unit_organisasi_id' => $unitFilter,
            ],
            'unitOrganisasis' => UnitOrganisasi::active()->orderBy('nama')->get(['id', 'kode', 'nama', 'tipe', 'parent_id']),
        ]);
    }
}
