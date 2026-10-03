<?php

namespace Database\Factories;

use App\Models\Consultation;
use App\Models\ConsultationDiagnosis;
use App\Models\Facility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConsultationDiagnosis>
 */
class ConsultationDiagnosisFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'consultation_id' => Consultation::factory(),
            'description' => fake()->randomElement([
                'Acute upper respiratory tract infection',
                'Type 2 diabetes mellitus',
                'Essential hypertension',
                'Malaria, uncomplicated',
                'Chronic gastritis',
            ]),
            'type' => 'preliminary',
        ];
    }

    public function forFacility(Facility $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility->getKey(),
        ]);
    }

    public function principal(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'principal',
        ]);
    }
}
