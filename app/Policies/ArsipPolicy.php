<?php

declare(strict_types=1);

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
        return $user->can('arsip.view');
    }

    /**
     * Determine whether the user can view the trash list.
     */
    public function viewTrash(User $user): bool
    {
        return $user->can('arsip.restore') || $user->can('arsip.delete');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Arsip $arsip): bool
    {
        return $user->can('arsip.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('arsip.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Arsip $arsip): bool
    {
        return $user->can('arsip.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Arsip $arsip): bool
    {
        return $user->can('arsip.delete');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Arsip $arsip): bool
    {
        return $user->can('arsip.restore');
    }

    /**
     * Determine whether the user can force delete the model.
     */
    public function forceDelete(User $user, Arsip $arsip): bool
    {
        return $user->can('arsip.delete');
    }
}
