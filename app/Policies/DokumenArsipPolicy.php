<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PeminjamanStatus;
use App\Models\DokumenArsip;
use App\Models\User;

class DokumenArsipPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('repositori-arsip.view')
            || $user->can('kelola-arsip.view')
            || $user->can('arsip-inaktif.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, DokumenArsip $dokumen): bool
    {
        return $user->can('repositori-arsip.view')
            || $user->can('kelola-arsip.view')
            || $user->can('arsip-inaktif.view');
    }

    /**
     * Determine whether the user can upload documents.
     */
    public function upload(User $user): bool
    {
        return $user->can('kelola-arsip.create')
            || $user->can('kelola-arsip.update');
    }

    /**
     * Determine whether the user can download documents.
     */
    public function download(User $user, DokumenArsip $dokumen): bool
    {
        $arsip = $dokumen->arsip;
        if ($arsip && $arsip->peminjamans()->where('pemohon_id', $user->id)->where('status', PeminjamanStatus::Approved)->exists()) {
            return true;
        }

        return $user->can('dokumen-arsip.download')
            || $user->can('repositori-arsip.download')
            || $user->can('kelola-arsip.view');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, DokumenArsip $dokumen): bool
    {
        return $user->can('kelola-arsip.delete');
    }
}
