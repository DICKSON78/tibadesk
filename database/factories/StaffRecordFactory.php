<?php

namespace Database\Factories;

use App\Models\StaffRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StaffRecord>
 */
class StaffRecordFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'staff_number' => 'EMP-'.fake()->unique()->numerify('####'),
            'full_name' => fake()->name(),
            'department' => fake()->randomElement(['Clinical', 'Nursing', 'Pharmacy', 'Laboratory', 'Administration', 'Finance']),
            'designation' => fake()->randomElement(['Nurse', 'Doctor', 'Pharmacist', 'Technician', 'Administrator', 'Accountant']),
            'employment_type' => fake()->randomElement(['full_time', 'part_time', 'contract', 'locum']),
            'hired_on' => fake()->dateTimeBetween('-5 years', 'now'),
            'monthly_salary' => fake()->numberBetween(300000, 4000000),
            'phone' => '+255'.fake()->numerify('7########'),
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
