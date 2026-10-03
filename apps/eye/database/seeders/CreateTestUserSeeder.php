<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Department;
use App\Models\JobTitle;
use App\Models\Clinic;

class CreateTestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create kayoka user as mentioned by user
        $user = User::updateOrCreate(
            ['username' => 'kayoka'],
            [
                'first_name' => 'Kayoka',
                'last_name' => 'Admin',
                'username' => 'kayoka',
                'password' => Hash::make('2121'),
                'role' => 'Admin',
                'status' => 'Active',
                'email' => 'kayoka@eyecare.com',
                'phone' => '1234567890',
                'gender' => 'Male',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Create test user with known credentials
        $adminUser = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'Admin',
                'status' => 'Active',
                'email' => 'admin@eyecare.com',
                'phone' => '1234567890',
                'gender' => 'Male',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $this->command->info('Test users created:');
        $this->command->info('Username: kayoka, Password: 2121');
        $this->command->info('Username: admin, Password: password');
        $this->command->info('Both users have Active status');
    }
}
