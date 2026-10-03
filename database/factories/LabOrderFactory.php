<?php

namespace Database\Factories;

use App\Models\Encounter;
use App\Models\LabOrder;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabOrder>
 */
class LabOrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'status' => 'ordered',
            'priority' => fake()->randomElement(['routine', 'urgent', 'stat']),
            'clinical_notes' => fake()->sentence(),
            'ordered_at' => now(),
        ];
    }

    public function resulted(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'resulted',
        ]);
    }
}
