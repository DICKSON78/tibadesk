<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Encounter;
use App\Models\EncounterReferral;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EncounterReferral>
 */
class EncounterReferralFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'from_department_id' => Department::factory(),
            'to_department_id' => Department::factory(),
            'reason' => fake()->sentence(),
            'status' => 'pending',
            'referred_at' => now(),
        ];
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }
}
