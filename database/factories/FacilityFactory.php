<?php

namespace Database\Factories;

use App\Enums\Edition;
use App\Enums\FacilityStatus;
use App\Models\Facility;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Facility>
 */
class FacilityFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company().' Medical Centre';

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(5)),
            'edition' => Edition::Polyclinic,
            'licence_term' => '12-months',
            'licence_months' => 12,
            'licence_expires_at' => now()->addYear(),
            // Active by default so tests about other things are not all
            // quietly blocked by a pending facility.
            'status' => FacilityStatus::Active,
            'facility_type' => 'polyclinic',
            'contact_name' => fake()->name(),
            'contact_email' => fake()->unique()->companyEmail(),
            'contact_phone' => '+255'.fake()->numerify('7########'),
            'address' => fake()->address(),
        ];
    }

    public function edition(Edition $edition): static
    {
        return $this->state(fn (array $attributes): array => [
            'edition' => $edition,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => FacilityStatus::Pending,
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => FacilityStatus::Suspended,
        ]);
    }

    /**
     * A facility entitled to everything its edition sells, which is the state
     * a provisioned customer is in.
     */
    public function provisioned(): static
    {
        return $this->afterCreating(function (Facility $facility): void {
            $facility->grantEditionModules();
        });
    }
}
