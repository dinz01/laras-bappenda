<?php

declare(strict_types=1);

namespace App\Events;

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkflowTransitioned
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly Arsip $arsip,
        public readonly WorkflowStatus $from,
        public readonly WorkflowStatus $to,
        public readonly User $actor,
    ) {}
}
