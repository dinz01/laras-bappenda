<?php

declare(strict_types=1);

namespace App\Casts;

use App\Enums\WorkflowStatus;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use JsonSerializable;
use Stringable;

class WorkflowStatusCast implements CastsAttributes
{
    /**
     * Cast the given value.
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null) {
            return null;
        }

        $strValue = (string) $value;

        if ($status = WorkflowStatus::tryFrom($strValue)) {
            return $status;
        }

        // Return a dynamic value object that mimics WorkflowStatus for custom nasib akhir
        return new class($strValue) implements JsonSerializable, Stringable
        {
            public string $value;

            public function __construct(string $value)
            {
                $this->value = $value;
            }

            public function label(): string
            {
                return Str::headline(str_replace('_', ' ', $this->value));
            }

            public function color(): string
            {
                $nonDangerColors = ['info', 'success', 'warning', 'secondary'];
                $idx = abs(crc32($this->value)) % count($nonDangerColors);

                return $nonDangerColors[$idx];
            }

            public function canTransitionTo(mixed $target): bool
            {
                return false;
            }

            /**
             * @return list<WorkflowStatus>
             */
            public function allowedTransitions(): array
            {
                return [];
            }

            public function __toString(): string
            {
                return $this->value;
            }

            public function jsonSerialize(): string
            {
                return $this->value;
            }
        };
    }

    /**
     * Prepare the given value for storage.
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): string
    {
        if ($value instanceof WorkflowStatus) {
            return $value->value;
        }

        if (is_object($value) && isset($value->value)) {
            return (string) $value->value;
        }

        return (string) $value;
    }
}
