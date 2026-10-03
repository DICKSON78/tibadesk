<?php

namespace Database\Factories;

use App\Models\DentalProcedure;
use App\Models\Encounter;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DentalProcedure>
 */
class DentalProcedureFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'code' => fake()->randomElement(['EXT', 'FILL', 'RCT', 'SCALE', 'CROW']),
            'name' => fake()->randomElement(['Extraction', 'Amalgam filling', 'Root canal treatment', 'Scaling and polishing', 'Crown fitting']),
            'tooth_number' => fake()->numberBetween(11, 48),
            'surfaces' => ['o'],
            'status' => 'planned',
            'quoted_price' => fake()->numberBetween(20000, 900000),
            'recorded_at' => now(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
        ]);
    }
}
