<?php

namespace Database\Factories;

use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'encounter_id' => Encounter::factory(),
            'patient_id' => Patient::factory(),
            'invoice_number' => 'INV-'.fake()->unique()->numerify('######'),
            'status' => 'unpaid',
            'subtotal' => 0,
            'discount' => 0,
            'total' => 0,
            'amount_paid' => 0,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'paid',
        ]);
    }

    public function partPaid(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'part_paid',
        ]);
    }
}
