<?php

namespace Database\Factories;

use App\Models\LeaveRequest;
use App\Models\StaffRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'staff_record_id' => StaffRecord::factory(),
            'leave_type' => fake()->randomElement(['annual', 'sick', 'maternity', 'unpaid', 'study']),
            'from_date' => now()->addDays(7),
            'to_date' => now()->addDays(11),
            'days' => 5,
            'reason' => fake()->sentence(),
            'status' => 'pending',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);
    }
}
