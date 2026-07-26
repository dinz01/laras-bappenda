<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\DokumenArsip;
use App\Models\User;

class DokumenArsipPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('dokumen.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, DokumenArsip $dokumen): bool
    {
        return $user->can('dokumen.view');
    }

    /**
     * Determine whether the user can upload documents.
     */
    public function upload(User $user): bool
    {
        return $user->can('dokumen.upload');
    }

    /**
     * Determine whether the user can download documents.
     */
    public function download(User $user, DokumenArsip $dokumen): bool
    {
        return $user->can('dokumen.download');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, DokumenArsip $dokumen): bool
    {
        return $user->can('dokumen.delete');
    }
}
