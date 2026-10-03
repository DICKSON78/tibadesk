<?php

namespace Database\Factories;

use App\Models\Encounter;
use App\Models\Facility;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Encounter>
 */
class EncounterFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'encounter_number' => 'OPD-'.fake()->unique()->numerify('######'),
            'type' => 'opd',
            'status' => 'registered',
            'payment_mode' => 'cash',
            'reason_for_visit' => fake()->randomElement([
                'General consultation',
                'Follow-up review',
                'Fever and headache',
                'Routine check-up',
            ]),
            'registered_at' => now(),
        ];
    }

    public function forFacility(Facility $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility->getKey(),
        ]);
    }

    public function forPatient(Patient $patient): static
    {
        return $this->state(fn (array $attributes): array => [
            'patient_id' => $patient->getKey(),
            'facility_id' => $patient->facility_id,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
            'started_at' => now()->subHour(),
            'completed_at' => now(),
        ]);
    }
}
