<?php

namespace Database\Factories;

use App\Models\Consultation;
use App\Models\Encounter;
use App\Models\Facility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Consultation>
 */
class ConsultationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'consultation_number' => 'CONS-'.fake()->unique()->numerify('######'),
            'status' => 'draft',
            'chief_complaint' => fake()->sentence(6),
            'history_present_illness' => fake()->paragraph(2),
            'examination' => fake()->paragraph(2),
            'clinical_notes' => fake()->paragraph(2),
            'plan' => fake()->paragraph(1),
        ];
    }

    public function forFacility(Facility $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility->getKey(),
        ]);
    }

    public function forEncounter(Encounter $encounter): static
    {
        return $this->state(fn (array $attributes): array => [
            'encounter_id' => $encounter->getKey(),
            'facility_id' => $encounter->facility_id,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
