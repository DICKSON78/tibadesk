<?php

namespace Database\Factories\Pharmacy;

use App\Models\Facility;
use App\Pharmacy\Models\StockLocation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockLocation>
 */
class StockLocationFactory extends Factory
{
    protected $model = StockLocation::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Main Store', 'Dispensary', 'Branch Store', 'Outpatient Store', 'Pharmacy Store']),
            'code' => fake()->unique()->bothify('LOC-##'),
            'kind' => fake()->randomElement(['store', 'dispensary', 'branch']),
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
