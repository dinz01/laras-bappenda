<?php

namespace App\Policies;

use App\Models\Arsip;
use App\Models\User;

class ArsipPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the trash list.
     */
    public function viewTrash(User $user): bool
    {
        return $user->hasRole('Super Administrator');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Arsip $arsip): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Arsip $arsip): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Arsip $arsip): bool
    {
        return true;
    }

    /**
     * Hanya Super Admin yang dapat merestore arsip dari recycle bin.
     */
    public function restore(User $user, Arsip $arsip): bool
    {
        return $user->hasRole('Super Administrator');
    }

    /**
     * Hanya Super Admin yang dapat menghapus arsip secara permanen.
     */
    public function forceDelete(User $user, Arsip $arsip): bool
    {
        return $user->hasRole('Super Administrator');
    }
}
