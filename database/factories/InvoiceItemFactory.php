<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'description' => fake()->randomElement(['Consultation fee', 'Registration fee', 'Dressing']),
            'quantity' => fake()->numberBetween(1, 3),
            'unit_price' => fake()->numberBetween(1000, 100000),
            'line_total' => 0,
        ];
    }
}
