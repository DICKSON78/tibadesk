<?php

namespace Database\Factories;

use App\Models\Dispense;
use App\Models\Encounter;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dispense>
 */
class DispenseFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'status' => 'completed',
            'notes' => null,
            'dispensed_at' => now(),
        ];
    }
}
