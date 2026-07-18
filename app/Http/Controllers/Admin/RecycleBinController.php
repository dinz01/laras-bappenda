<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Arsip;
use App\Services\RecycleBinService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class RecycleBinController extends Controller
{
    public function __construct(
        protected RecycleBinService $recycleBinService
    ) {}

    /**
     * Tampilkan daftar arsip yang soft-deleted.
     * Hanya Super Admin.
     */
    public function index(): Response
    {
        Gate::authorize('viewTrash', Arsip::class);

        $arsips = $this->recycleBinService->paginate(20);

        return Inertia::render('admin/recycle-bin/index', [
            'arsips' => $arsips->through(fn (Arsip $a) => [
                'id' => $a->id,
                'nomor_arsip' => $a->nomor_arsip,
                'judul' => $a->judul,
                'unit_organisasi' => $a->unitOrganisasi->nama ?? '-',
                'dihapus_oleh' => $a->creator->name ?? '-',
                'deleted_at' => $a->deleted_at?->toDateTimeString(),
                'sisa_waktu_detik' => max(0, (int) now()->diffInSeconds($a->deleted_at?->addHours(24) ?? now(), false)),
            ]),
        ]);
    }

    /**
     * Restore arsip.
     * Hanya Super Admin.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $arsip = Arsip::onlyTrashed()->findOrFail($id);

        Gate::authorize('restore', $arsip);

        $this->recycleBinService->restore($arsip, $request->user(), $request);

        return back()->with('success', "Arsip \"{$arsip->nomor_arsip}\" berhasil dipulihkan.");
    }

    /**
     * Force delete arsip secara permanen.
     * Hanya Super Admin.
     */
    public function forceDelete(Request $request, int $id): RedirectResponse
    {
        $arsip = Arsip::onlyTrashed()->findOrFail($id);

        Gate::authorize('forceDelete', $arsip);

        $nomor = $arsip->nomor_arsip;

        $this->recycleBinService->forceDelete($arsip, $request->user(), $request, 'manual');

        return back()->with('success', "Arsip \"{$nomor}\" telah dihapus secara permanen.");
    }
}
