<?php

namespace Database\Factories;

use App\Models\Medicine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medicine>
 */
class MedicineFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('MED-###'),
            'name' => fake()->randomElement(['Paracetamol', 'Amoxicillin', 'Metronidazole', 'Ibuprofen', 'Omeprazole', 'Artemether/Lumefantrine', 'Ciprofloxacin', 'ORS']),
            'generic_name' => fake()->randomElement(['Paracetamol', 'Amoxicillin', 'Metronidazole']),
            'form' => fake()->randomElement(['tablet', 'capsule', 'syrup', 'injection']),
            'strength' => fake()->randomElement(['500mg', '250mg', '400mg', '1g']),
            'unit' => fake()->randomElement(['tablet', 'capsule', 'ml', 'vial']),
            'unit_price' => fake()->numberBetween(100, 8000),
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
