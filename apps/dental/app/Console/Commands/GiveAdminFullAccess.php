<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserPrivilege;

class GiveAdminFullAccess extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:full-access';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Give admin user full access to all system privileges';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== GIVING ADMIN FULL ACCESS ===');
        $this->newLine();

        try {
            // Find admin user
            $admin = User::where('username', 'admin')->first();
            
            if (!$admin) {
                $this->error('❌ Admin user not found!');
                return 1;
            }

            $this->info("Found admin user: {$admin->first_name} {$admin->last_name} (ID: {$admin->id})");
            $this->info("Current role: {$admin->role}");
            $this->newLine();

            // Check current privileges
            $currentPrivileges = UserPrivilege::where('user_id', $admin->id)->pluck('privilege')->toArray();
            $this->info('Current privileges: ' . (empty($currentPrivileges) ? 'None' : implode(', ', $currentPrivileges)));
            $this->newLine();

            // Define all possible privileges in the system
            $allPrivileges = [
                'reception',
                'medicine_center',
                'dental_lab',
                'consultation_room',
                'procedure_room',
                'other_dispensing',
                'marketing',
                'financial_management',
                'payment_center',
                'inventory_management',
                'user_management',
                'settings',
                'patient_management',
                'doctor_management',
                'nurse_management',
                'staff_management',
                'clinic_management',
                'report_management',
                'backup_management',
                'system_administration',
                'data_export',
                'data_import',
                'audit_logs',
                'notification_management',
                'communication_management',
                'research_management',
                'marketing_management',
                'financial_reports',
                'patient_reports',
                'inventory_reports',
                'staff_reports',
                'system_reports',
                'emergency_access',
                'maintenance_mode',
                'database_management',
                'file_management',
                'security_management',
                'compliance_management',
                'quality_assurance',
                'training_management',
            ];

            $this->info('Adding all privileges to admin user...');

            // Add all privileges to admin
            foreach ($allPrivileges as $privilege) {
                UserPrivilege::updateOrInsert(
                    ['user_id' => $admin->id, 'privilege' => $privilege],
                    ['user_id' => $admin->id, 'privilege' => $privilege]
                );
            }

            // Verify privileges were added
            $newPrivileges = UserPrivilege::where('user_id', $admin->id)->pluck('privilege')->toArray();
            $this->info("✅ Added " . count($newPrivileges) . " privileges to admin user");
            $this->newLine();

            // Show all privileges
            $this->info('Admin now has the following privileges:');
            foreach ($newPrivileges as $privilege) {
                $this->info("  ✓ $privilege");
            }

            // Update admin role to ensure it's set correctly
            $admin->update(['role' => 'Admin']);
            $this->info("✅ Admin role confirmed: {$admin->role}");

            $this->newLine();
            $this->info('=== ADMIN FULL ACCESS COMPLETE ===');
            $this->info('✅ Admin user now has full access to the entire system');
            $this->info('✅ All privileges have been granted');
            $this->newLine();
            $this->info('The admin user should now be able to access all menus and features.');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            $this->error('Stack trace:');
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
