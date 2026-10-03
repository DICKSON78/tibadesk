<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'amount' => fake()->numberBetween(1000, 100000),
            'method' => fake()->randomElement(['cash', 'mobile_money', 'card', 'bank_transfer', 'insurance']),
            'reference' => fake()->numerify('MPN######'),
            'received_at' => now(),
        ];
    }
}
