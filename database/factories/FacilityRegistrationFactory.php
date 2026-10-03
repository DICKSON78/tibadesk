<?php

namespace Database\Factories;

use App\Enums\RegistrationStatus;
use App\Models\FacilityRegistration;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FacilityRegistration>
 */
class FacilityRegistrationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => 'TBR-'.Str::upper(Str::random(10)),
            'facility_name' => fake()->company().' Hospital',
            'facility_type' => 'hospital',
            'edition' => 'polyclinic',
            'licence_term' => '12-months',
            'months' => 12,
            'contact_name' => fake()->name(),
            'contact_email' => fake()->unique()->safeEmail(),
            'contact_phone' => '+255'.fake()->numerify('7########'),
            'username' => fake()->unique()->userName(),
            'password' => bcrypt('secret-password'),
            'status' => RegistrationStatus::Pending,
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => RegistrationStatus::Approved,
        ]);
    }
}
