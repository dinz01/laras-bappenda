<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\JenisArsip;
use App\Models\JenisDokumen;
use App\Models\KategoriArsip;
use App\Models\KlasifikasiArsip;
use App\Models\KondisiArsip;
use App\Models\LokasiArsip;
use App\Models\MediaArsip;
use App\Models\SifatArsip;
use App\Models\TingkatAksesArsip;
use App\Models\TingkatPerkembanganArsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService,
    ) {}

    /**
     * Display a listing of the audit logs.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', AuditLog::class);
        $filters = $request->only([
            'search',
            'event_category',
            'user_type',
            'date_from',
            'date_until',
        ]);

        $masterLookups = [
            'kategori_arsip_id' => KategoriArsip::pluck('nama', 'id'),
            'klasifikasi_arsip_id' => KlasifikasiArsip::all()->mapWithKeys(fn (KlasifikasiArsip $k) => [$k->id => "{$k->kode} - {$k->nama}"]),
            'lokasi_arsip_id' => LokasiArsip::all()->mapWithKeys(fn (LokasiArsip $l) => [$l->id => "{$l->kode} ({$l->nama})"]),
            'jenis_arsip_id' => JenisArsip::pluck('nama', 'id'),
            'sifat_arsip_id' => SifatArsip::pluck('nama', 'id'),
            'tingkat_perkembangan_arsip_id' => TingkatPerkembanganArsip::pluck('nama', 'id'),
            'kondisi_arsip_id' => KondisiArsip::pluck('nama', 'id'),
            'tingkat_akses_arsip_id' => TingkatAksesArsip::pluck('nama', 'id'),
            'unit_organisasi_id' => UnitOrganisasi::pluck('nama', 'id'),
            'jenis_dokumen_id' => JenisDokumen::pluck('nama', 'id'),
            'media_arsip_id' => MediaArsip::pluck('nama', 'id'),
            'user_id' => User::pluck('name', 'id'),
            'created_by' => User::pluck('name', 'id'),
            'uploaded_by' => User::pluck('name', 'id'),
        ];

        return Inertia::render('admin/audit-log/index', [
            'auditLogs' => $this->auditLogService->paginated($filters),
            'statistics' => $this->auditLogService->statistics(),
            'filters' => $filters,
            'masterLookups' => $masterLookups,
        ]);
    }
}
