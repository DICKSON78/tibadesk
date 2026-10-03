<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CompleteSetup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:complete';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Complete the database setup after partial reset';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== COMPLETING DATABASE SETUP ===');
        $this->newLine();

        try {
            // Test database connection
            $this->info('1. Testing database connection...');
            DB::connection()->getPdo();
            $this->info('✅ Database connection successful');
            $this->newLine();

            // Create regions (basic)
            $this->info('2. Creating basic regions...');
            $regions = [
                'Dar es Salaam',
                'Mwanza',
                'Arusha',
                'Dodoma',
                'Tanga',
            ];

            foreach ($regions as $region) {
                DB::table('regions')->insert([
                    'name' => $region,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->info('✅ Regions created');
            $this->newLine();

            // Create preferences
            $this->info('3. Creating system preferences...');
            $preferences = [
                ['key' => 'CLINIC_NAME', 'value' => 'TibaDesk'],
                ['key' => 'CLINIC_PHONE', 'value' => '0678110376'],
                ['key' => 'CLINIC_EMAIL', 'value' => 'info@tibadesk.test'],
                ['key' => 'CLINIC_ADDRESS', 'value' => 'Natta, Mwanza'],
                ['key' => 'SYSTEM_VERSION', 'value' => '1.0.0'],
                ['key' => 'MAINTENANCE_MODE', 'value' => 'No'],
            ];

            foreach ($preferences as $pref) {
                DB::table('preferences')->insert([
                    'key' => $pref['key'],
                    'value' => $pref['value'],
                ]);
            }
            $this->info('✅ System preferences created');
            $this->newLine();

            // Verify admin user exists
            $this->info('4. Verifying admin user...');
            $admin = DB::table('users')->where('username', 'admin')->first();
            if ($admin) {
                $this->info("✅ Admin user exists (ID: {$admin->id})");
                $this->info('   Username: admin');
                $this->info('   Password: admin');
            } else {
                $this->error('❌ Admin user not found');
            }

            // Verify essential data
            $this->newLine();
            $this->info('5. Verifying essential data...');
            $clinicCount = DB::table('clinics')->count();
            $paymentModeCount = DB::table('payment_modes')->count();
            $infoSourceCount = DB::table('information_sources')->count();
            $regionCount = DB::table('regions')->count();
            $preferenceCount = DB::table('preferences')->count();

            $this->info("Clinics: $clinicCount");
            $this->info("Payment modes: $paymentModeCount");
            $this->info("Information sources: $infoSourceCount");
            $this->info("Regions: $regionCount");
            $this->info("Preferences: $preferenceCount");

            if ($clinicCount > 0 && $paymentModeCount > 0 && $infoSourceCount > 0 && $admin) {
                $this->newLine();
                $this->info('✅ SETUP COMPLETE!');
                $this->info('You can now login with:');
                $this->info('Username: admin');
                $this->info('Password: admin');
                $this->newLine();
                $this->info('Try registering a new patient to test if the 500 error is fixed.');
            } else {
                $this->newLine();
                $this->error('❌ Setup incomplete. Some essential data is missing.');
            }

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error: '.$e->getMessage());

            return 1;
        }
    }
}
