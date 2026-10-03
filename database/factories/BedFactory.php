<?php

namespace Database\Factories;

use App\Models\Bed;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bed>
 */
class BedFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ward_id' => Ward::factory(),
            'bed_number' => (string) fake()->numberBetween(1, 40),
            'status' => 'available',
            'daily_rate' => fake()->numberBetween(20000, 250000),
        ];
    }

    public function occupied(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'occupied',
        ]);
    }

    public function maintenance(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'maintenance',
        ]);
    }
}
