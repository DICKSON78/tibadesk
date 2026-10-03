<?php

namespace Database\Factories;

use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabTest>
 */
class LabTestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('LAB-###'),
            'name' => fake()->randomElement(['Malaria rapid diagnostic test', 'Full blood count', 'Urine analysis', 'Fasting blood sugar', 'HIV screening', 'Sickle cell test', 'Widal test']),
            'category' => fake()->randomElement(['haematology', 'chemistry', 'serology', 'microbiology']),
            'unit' => fake()->randomElement(['g/dL', 'mmol/L', 'cells/uL', 'mg/dL']),
            'unit_price' => fake()->numberBetween(500, 45000),
            'turnaround_hours' => fake()->randomElement([2, 4, 24, 48]),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
