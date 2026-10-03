<?php

namespace App\Console\Commands;

use App\Models\Clinic;
use App\Models\Department;
use App\Models\JobTitle;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResetDatabaseAndCreateAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:reset-and-create-admin {--force : Force the operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all data from database tables and create an admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (! $this->option('force')) {
            if (! $this->confirm('This will delete ALL data from your database. Are you sure you want to continue?')) {
                $this->info('Operation cancelled.');

                return;
            }
        }

        $this->info('Starting database reset and admin user creation...');

        try {
            // Disable foreign key checks to avoid constraint issues
            DB::statement('SET FOREIGN_KEY_CHECKS = 0');

            $this->info('Deleting all data from tables...');

            // List of tables to truncate (excluding migrations and failed_jobs)
            $tables = [
                'users',
                'patients',
                'consultations',
                'consultation_diagnoses',
                'consultation_external_examinations',
                'consultation_functional_tests',
                'consultation_fundoscopies',
                'consultation_refractions',
                'consultation_visual_acuities',
                'patient_check_ins',
                'patient_item_bills',
                'patient_item_bill_payments',
                'patient_item_payments',
                'patient_payment_cache',
                'patient_payment_cache_items',
                'patient_attachments',
                'patient_notifications',
                'patient_waiting_times',
                'doctor_tasks',
                'messages',
                'expenses',
                'expense_payments',
                'expense_categories',
                'stocktakes',
                'stocktake_items',
                'items',
                'item_prices',
                'item_types',
                'lens_types',
                'units_of_measure',
                'medicines',
                'medicine_taking',
                'inventory_items',
                'consultation_types',
                'payment_modes',
                'payment_channels',
                'departments',
                'job_titles',
                'districts',
                'wards',
                'regions',
                'diseases',
                'user_privileges',
                'preferences',
                'cataract_surgery_records',
                'surgery_record_reports',
                'personal_access_tokens',
                'communication_logs',
                'daily_activities',
                'events',
                'research_plans',
                'marketing_strategies',
                'ideas',
                'information_sources',
            ];

            $progressBar = $this->output->createProgressBar(count($tables));
            $progressBar->start();

            foreach ($tables as $table) {
                try {
                    DB::table($table)->truncate();
                    $progressBar->advance();
                } catch (Exception $e) {
                    $this->warn("Could not truncate table {$table}: ".$e->getMessage());
                }
            }

            $progressBar->finish();
            $this->newLine();

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');

            $this->info('All data deleted successfully!');

            // Create default clinic if it doesn't exist
            $clinic = Clinic::firstOrCreate(
                ['id' => 1],
                [
                    'name' => 'Default Clinic',
                    'address' => 'Default Address',
                    'phone' => '1234567890',
                    'email' => 'clinic@tibadesk.test',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Create default department if it doesn't exist
            $department = Department::firstOrCreate(
                ['id' => 1],
                [
                    'name' => 'Administration',
                    'description' => 'Administrative Department',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Create default job title if it doesn't exist
            $jobTitle = JobTitle::firstOrCreate(
                ['id' => 1],
                [
                    'name' => 'Administrator',
                    'description' => 'System Administrator',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Create admin user
            $adminUser = User::create([
                'clinic_id' => $clinic->id,
                'first_name' => 'Admin',
                'last_name' => 'User',
                'middle_name' => '',
                'designation' => 'System Administrator',
                'department_id' => $department->id,
                'job_title_id' => $jobTitle->id,
                'employee_number' => 'ADMIN001',
                'date_of_birth' => '1990-01-01',
                'gender' => 'Male',
                'national_id' => '123456789',
                'phone' => '1234567890',
                'email' => 'admin@tibadesk.test',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'Admin',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->newLine();
            $this->info('✓ Admin user created successfully!');
            $this->table(
                ['Field', 'Value'],
                [
                    ['Username', 'admin'],
                    ['Password', 'password'],
                    ['Role', 'Admin'],
                    ['Status', 'Active'],
                    ['Email', 'admin@tibadesk.test'],
                ]
            );

            $this->info('Database reset and admin user creation completed successfully!');

        } catch (Exception $e) {
            $this->error('Error: '.$e->getMessage());
            $this->error('Stack trace: '.$e->getTraceAsString());
        }
    }
}
