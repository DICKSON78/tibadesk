<?php

namespace Database\Factories;

use App\Models\Medicine;
use App\Models\MedicineStock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MedicineStock>
 */
class MedicineStockFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'medicine_id' => Medicine::factory(),
            'quantity_on_hand' => fake()->numberBetween(0, 500),
            'reorder_level' => fake()->numberBetween(10, 50),
            'last_counted_on' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }

    public function low(): static
    {
        return $this->state(fn (array $attributes): array => [
            'quantity_on_hand' => 2,
            'reorder_level' => 10,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'quantity_on_hand' => 0,
        ]);
    }
}
