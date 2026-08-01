<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\JenisArsip;
use App\Models\KlasifikasiArsip;
use App\Models\LokasiArsip;
use App\Models\SifatArsip;
use App\Models\StatusArsip;
use App\Models\TingkatPerkembanganArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class KelolaArsipController extends Controller
{
    /**
     * Tampilkan antrian kerja arsip: status review/revisi yang masih perlu ditindaklanjuti.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('create', Arsip::class);

        /** @var User $user */
        $user = $request->user();

        $query = Arsip::query()
            ->with([
                'klasifikasiArsip',
                'lokasiArsip',
                'statusArsip',
                'unitOrganisasi',
                'creator',
            ])
            ->whereIn('workflow_status', [
                WorkflowStatus::Review->value,
                WorkflowStatus::Revisi->value,
            ]);

        // Operator Unit Pengolah hanya melihat arsip yang dia kelola (unitnya sendiri).
        // Role lain (Admin, Arsiparis, dst) melihat seluruh antrian lintas unit.
        if ($user->hasRole('Operator Unit Pengolah')) {
            $query->where('unit_organisasi_id', $user->unit_organisasi_id);
        }

        $arsips = $query
            ->orderBy('tanggal_arsip', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('kelola-arsip/index', [
            'arsips' => $arsips,
            'klasifikasis' => KlasifikasiArsip::with('retensiArsip')->active()->get(['id', 'kode', 'nama', 'retensi_arsip_id']),
            'unitOrganisasis' => UnitOrganisasi::active()->get(['id', 'kode', 'nama', 'tipe', 'parent_id']),
            'statusArsips' => StatusArsip::active()->get(['id', 'kode', 'nama']),
            'jenisArsips' => JenisArsip::active()->get(['id', 'kode', 'nama']),
            'sifatArsips' => SifatArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatPerkembanganArsips' => TingkatPerkembanganArsip::active()->get(['id', 'kode', 'nama']),
            'lokasiArsips' => LokasiArsip::active()->get(['id', 'kode', 'nama']),
            'mediaArsips' => \App\Models\MediaArsip::active()->get(['id', 'kode', 'nama']),
            'kondisiArsips' => \App\Models\KondisiArsip::active()->get(['id', 'kode', 'nama']),
            'tingkatAksesArsips' => \App\Models\TingkatAksesArsip::active()->get(['id', 'kode', 'nama']),
        ]);
    }
}