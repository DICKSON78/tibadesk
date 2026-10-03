<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // A user belongs to a facility by default. The alternative default
            // of no facility is platform staff who can do nothing, which is
            // the rarer case and so belongs in an explicit state.
            'facility_id' => Facility::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => Role::Receptionist,
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function role(Role $role): static
    {
        return $this->state(fn (array $attributes): array => [
            'role' => $role,
        ]);
    }

    public function forFacility(Facility $facility): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => $facility->getKey(),
        ]);
    }

    /**
     * KADETECH staff who sit above every facility. They deliberately have no
     * role capabilities, so being platform staff never grants clinical access.
     */
    public function platformStaff(): static
    {
        return $this->state(fn (array $attributes): array => [
            'facility_id' => null,
            'role' => Role::FacilityAdmin,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
