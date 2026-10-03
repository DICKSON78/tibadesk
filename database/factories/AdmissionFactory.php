<?php

namespace Database\Factories;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\Encounter;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Admission>
 */
class AdmissionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'bed_id' => Bed::factory(),
            'status' => 'admitted',
            'admission_diagnosis' => fake()->sentence(),
            'admitted_at' => now(),
        ];
    }

    public function discharged(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'discharged',
            'discharged_at' => now(),
            'discharge_summary' => fake()->sentence(),
        ]);
    }
}
