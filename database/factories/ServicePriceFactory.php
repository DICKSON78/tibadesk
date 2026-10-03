<?php

namespace Database\Factories;

use App\Enums\Module;
use App\Models\ServicePrice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServicePrice>
 */
class ServicePriceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('SVC-###'),
            'name' => fake()->randomElement(['Consultation fee', 'Registration fee', 'Dressing', 'Minor surgery', 'Dental scaling', 'Eye examination', 'Full blood count', 'Admission - general ward']),
            'module' => fake()->randomElement(Module::cases())->value,
            'price' => fake()->numberBetween(1000, 500000),
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
