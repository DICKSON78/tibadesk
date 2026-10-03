<?php

namespace Database\Factories;

use App\Models\Dispense;
use App\Models\DispenseItem;
use App\Models\Medicine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DispenseItem>
 */
class DispenseItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dispense_id' => Dispense::factory(),
            'medicine_id' => Medicine::factory(),
            'quantity' => fake()->numberBetween(1, 30),
            'unit_price' => fake()->numberBetween(100, 5000),
            'line_total' => 0,
        ];
    }
}
