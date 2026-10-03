<?php

namespace Database\Factories;

use App\Models\DentalChart;
use App\Models\Encounter;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DentalChart>
 */
class DentalChartFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'tooth_number' => fake()->numberBetween(11, 48),
            'surfaces' => ['m', 'o'],
            'condition' => 'caries',
            'notes' => null,
            'recorded_at' => now(),
        ];
    }

    public function healthy(): static
    {
        return $this->state(fn (array $attributes): array => [
            'condition' => 'healthy',
            'surfaces' => null,
        ]);
    }
}
