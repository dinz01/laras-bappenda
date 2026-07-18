<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(NotificationType::cases());

        return [
            'user_id' => User::factory(),
            'title' => $type->label(),
            'message' => fake()->sentence(),
            'type' => $type,
            'url' => fake()->boolean(70) ? '/arsip/'.fake()->numberBetween(1, 100) : null,
            'is_read' => false,
        ];
    }

    /**
     * State: notifikasi sudah dibaca.
     */
    public function read(): static
    {
        return $this->state(['is_read' => true]);
    }

    /**
     * State: notifikasi belum dibaca.
     */
    public function unread(): static
    {
        return $this->state(['is_read' => false]);
    }
}
