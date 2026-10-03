<?php

namespace Database\Factories;

use App\Models\Ward;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ward>
 */
class WardFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('WD-##'),
            'name' => fake()->randomElement(['General Ward Male', 'General Ward Female', 'Private Ward', 'Maternity Ward', 'Surgical Ward', 'Paediatric Ward']),
            'specialty' => fake()->randomElement(['General', 'Surgical', 'Maternity', 'Paediatric']),
            'description' => fake()->sentence(),
        ];
    }
}
