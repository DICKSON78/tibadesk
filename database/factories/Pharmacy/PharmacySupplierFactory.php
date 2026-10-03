<?php

namespace Database\Factories\Pharmacy;

use App\Models\Facility;
use App\Pharmacy\Models\PharmacySupplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PharmacySupplier>
 */
class PharmacySupplierFactory extends Factory
{
    protected $model = PharmacySupplier::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company().' Medical Supplies',
            'contact_person' => fake()->name(),
            'email' => fake()->companyEmail(),
            'phone' => fake()->numerify('0#########'),
            'city' => fake()->city(),
            'country' => fake()->country(),
            'tax_id' => fake()->numerify('TAX-#####'),
            'payment_terms' => fake()->randomElement(['net_15', 'net_30', 'net_60', 'cash_on_delivery']),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => ['is_active' => false]);
    }

    public function forFacility(Facility|int $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility instanceof Facility ? $facility->getKey() : $facility,
        ]);
    }
}
