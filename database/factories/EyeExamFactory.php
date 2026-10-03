<?php

namespace Database\Factories;

use App\Models\Encounter;
use App\Models\EyeExam;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EyeExam>
 */
class EyeExamFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'od_visual_acuity' => fake()->randomElement(['6/6', '6/9', '6/12', '6/18', '6/24']),
            'os_visual_acuity' => fake()->randomElement(['6/6', '6/9', '6/12', '6/18', '6/24']),
            'od_sphere' => fake()->randomFloat(2, -8, 2),
            'od_cylinder' => fake()->randomFloat(2, -4, 0),
            'od_axis' => fake()->randomFloat(2, 0, 180),
            'os_sphere' => fake()->randomFloat(2, -8, 2),
            'os_cylinder' => fake()->randomFloat(2, -4, 0),
            'os_axis' => fake()->randomFloat(2, 0, 180),
            'od_iop' => fake()->randomFloat(1, 10, 21),
            'os_iop' => fake()->randomFloat(1, 10, 21),
            'diagnosis' => fake()->randomElement(['Myopia', 'Hypermetropia', 'Astigmatism', 'Conjunctivitis']),
            'recorded_at' => now(),
        ];
    }
}
