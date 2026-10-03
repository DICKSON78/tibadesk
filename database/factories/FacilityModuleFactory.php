<?php

namespace Database\Factories;

use App\Enums\Module;
use App\Models\Facility;
use App\Models\FacilityModule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FacilityModule>
 */
class FacilityModuleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'facility_id' => Facility::factory(),
            'module' => Module::Registration,
            'granted_at' => now(),
        ];
    }

    public function forFacility(Facility $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility->getKey(),
        ]);
    }

    public function module(Module $module): static
    {
        return $this->state(fn (array $attributes): array => [
            'module' => $module,
        ]);
    }

    public function revoked(): static
    {
        return $this->state(fn (array $attributes): array => [
            'revoked_at' => now(),
        ]);
    }
}
