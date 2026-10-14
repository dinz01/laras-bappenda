<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Arsip;
use App\Models\User;

class WorkflowPolicy
{
    /**
     * Determine whether the user can view workflow.
     */
    public function view(User $user): bool
    {
        return $user->can('verifikasi-arsip.view');
    }

    /**
     * Determine whether the user can verify workflow.
     */
    public function verify(User $user, ?Arsip $arsip = null): bool
    {
        return $user->can('verifikasi-arsip.verify');
    }

    /**
     * Determine whether the user can approve workflow.
     */
    public function approve(User $user, ?Arsip $arsip = null): bool
    {
        return $user->can('verifikasi-arsip.verify');
    }

    /**
     * Determine whether the user can reject workflow.
     */
    public function reject(User $user, ?Arsip $arsip = null): bool
    {
        return $user->can('verifikasi-arsip.reject') || $user->can('verifikasi-arsip.verify');
    }
}
