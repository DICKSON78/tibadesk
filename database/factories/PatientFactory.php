<?php

namespace Database\Factories;

use App\Models\Facility;
use App\Models\Patient;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['male', 'female']);

        return [
            'patient_number' => 'P-'.fake()->unique()->numerify('######'),
            'first_name' => fake()->firstName($gender),
            'last_name' => fake()->lastName(),
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-1 year'),
            'gender' => $gender,
            'phone' => '+255'.fake()->unique()->numerify('7########'),
            'email' => fake()->unique()->safeEmail(),
            'address' => fake()->address(),
            'next_of_kin_name' => fake()->name(),
            'next_of_kin_phone' => '+255'.fake()->numerify('7########'),
            'next_of_kin_relationship' => fake()->randomElement(['Parent', 'Spouse', 'Sibling', 'Guardian']),
        ];
    }

    public function forFacility(Facility $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility->getKey(),
        ]);
    }

    /**
     * Create the patient as though the given facility were already bound, so
     * the global scope and the creating hook are exercised the way they are in
     * a real request.
     */
    public function inFacility(Facility $facility): static
    {
        return $this->afterMaking(function (Patient $patient) use ($facility): void {
            app(CurrentFacility::class)->runUsing($facility, function () use ($patient): void {
                $patient->facility_id ??= $facility->getKey();
            });
        });
    }
}
