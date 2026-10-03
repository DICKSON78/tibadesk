<?php

namespace Database\Factories;

use App\Models\Consultation;
use App\Models\Facility;
use App\Models\Prescription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prescription>
 */
class PrescriptionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'consultation_id' => Consultation::factory(),
            'medicine' => fake()->randomElement([
                'Paracetamol 500mg',
                'Amoxicillin 500mg',
                'Metronidazole 400mg',
                'Ibuprofen 400mg',
                'Omeprazole 20mg',
            ]),
            'dose' => fake()->randomElement(['1 tablet', '2 tablets', '5ml']),
            'route' => fake()->randomElement(['Oral', 'Topical', 'IM']),
            'frequency' => fake()->randomElement(['Once daily', 'Twice daily', 'Three times daily']),
            'duration' => fake()->randomElement(['3 days', '5 days', '7 days', '1 month']),
            'quantity' => fake()->numberBetween(6, 30),
            'status' => 'pending',
        ];
    }

    public function forFacility(Facility $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility->getKey(),
        ]);
    }

    public function dispensed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'dispensed',
            'dispensed_at' => now(),
        ]);
    }
}
