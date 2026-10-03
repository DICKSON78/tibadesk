<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('DEP-##'),
            'name' => fake()->randomElement(['General Medicine', 'Paediatrics', 'Obstetrics and Gynaecology', 'Surgery', 'Orthopaedics', 'Internal Medicine', 'ENT']),
            'description' => fake()->sentence(),
            'specialty' => fake()->randomElement(['Physician', 'Surgeon', 'Paediatrician', 'Gynaecologist']),
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
