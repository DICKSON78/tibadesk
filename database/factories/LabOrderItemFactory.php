<?php

namespace Database\Factories;

use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabOrderItem>
 */
class LabOrderItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lab_order_id' => LabOrder::factory(),
            'lab_test_id' => LabTest::factory(),
            'status' => 'pending',
        ];
    }

    public function resulted(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'resulted',
            'result_value' => fake()->randomFloat(2, 0, 20),
            'result_flag' => fake()->randomElement(['normal', 'low', 'high']),
            'resulted_at' => now(),
        ]);
    }

    public function critical(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'resulted',
            'result_value' => fake()->randomFloat(2, 0, 20),
            'result_flag' => 'critical',
            'resulted_at' => now(),
        ]);
    }
}
