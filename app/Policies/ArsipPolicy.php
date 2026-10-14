<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PeminjamanStatus;
use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\DokumenArsipVersion;
use App\Models\User;

class ArsipPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('repositori-arsip.view')
            || $user->can('kelola-arsip.view')
            || $user->can('arsip-inaktif.view')
            || $user->can('nasib-akhir-arsip.view')
            || $user->can('peminjaman.view');
    }

    /**
     * Determine whether the user can view the trash list.
     */
    public function viewTrash(User $user): bool
    {
        return $user->can('admin-recycle-bin.view') || $user->can('admin-recycle-bin.restore');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Arsip $arsip): bool
    {
        if (! $this->viewAny($user)) {
            return false;
        }

        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            if (in_array($arsip->workflow_status, [
                WorkflowStatus::Active,
                WorkflowStatus::Inactive,
                WorkflowStatus::Musnah,
                WorkflowStatus::Permanen,
                WorkflowStatus::DinilaiKembali,
            ], true) || ! in_array($arsip->workflow_status, [
                WorkflowStatus::Review,
                WorkflowStatus::Revisi,
                WorkflowStatus::Approved,
                WorkflowStatus::WaitingTte,
            ], true)) {
                return true;
            }

            return $arsip->unit_organisasi_id === $user->unit_organisasi_id;
        }

        return true;
    }

    /**
     * Determine whether the user can download the document.
     * Operator Unit must use the peminjaman flow for TTE-signed arsip (v2+),
     * but initial version (v1) before TTE can still be accessed/downloaded.
     */
    public function download(User $user, Arsip $arsip, ?int $versionId = null): bool
    {
        // Allow download if user has an approved peminjaman
        $hasApprovedPeminjaman = $arsip->peminjamans()
            ->where('pemohon_id', $user->id)
            ->where('status', PeminjamanStatus::Approved)
            ->exists();

        if ($hasApprovedPeminjaman) {
            return true;
        }

        if (! $user->can('dokumen-arsip.download') && ! $user->can('repositori-arsip.download') && ! $user->can('kelola-arsip.view')) {
            return false;
        }

        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            // Allow download if not TTE-signed status
            if (in_array($arsip->workflow_status, [
                WorkflowStatus::Review,
                WorkflowStatus::Revisi,
                WorkflowStatus::Approved,
                WorkflowStatus::WaitingTte,
            ], true)) {
                return true;
            }

            // If version ID passed, check if version is v1
            if ($versionId) {
                $ver = DokumenArsipVersion::find($versionId);
                if ($ver && $ver->versi === 1) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('kelola-arsip.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Arsip $arsip): bool
    {
        if (! $user->can('kelola-arsip.update')) {
            return false;
        }

        if ($user->hasRole(['Operator Unit', 'Operator Unit Pengolah'])) {
            return $arsip->unit_organisasi_id === $user->unit_organisasi_id;
        }

        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Arsip $arsip): bool
    {
        return $user->can('kelola-arsip.delete')
            || $user->can('repositori-arsip.delete')
            || $user->can('nasib-akhir-arsip.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Arsip $arsip): bool
    {
        return $user->can('admin-recycle-bin.restore');
    }

    /**
     * Determine whether the user can force delete the model.
     */
    public function forceDelete(User $user, Arsip $arsip): bool
    {
        return $user->can('admin-recycle-bin.force-delete');
    }
}
