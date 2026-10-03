<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserPrivilege;

class VerifyAdminAccess extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify admin user has full access';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== VERIFYING ADMIN ACCESS ===');
        $this->newLine();

        try {
            // Find admin user
            $admin = User::where('username', 'admin')->first();
            
            if (!$admin) {
                $this->error('❌ Admin user not found!');
                return 1;
            }

            $this->info("Admin User Details:");
            $this->info("  Name: {$admin->first_name} {$admin->last_name}");
            $this->info("  Username: {$admin->username}");
            $this->info("  Role: {$admin->role}");
            $this->info("  Status: {$admin->status}");
            $this->info("  Clinic ID: {$admin->clinic_id}");
            $this->newLine();

            // Check is_admin attribute
            $isAdmin = $admin->is_admin;
            $this->info("Is Admin (computed): " . ($isAdmin ? 'YES' : 'NO'));
            $this->newLine();

            // Check privileges
            $privileges = UserPrivilege::where('user_id', $admin->id)->pluck('privilege')->toArray();
            $this->info("Total Privileges: " . count($privileges));
            $this->newLine();

            // Show privileges by category
            $categories = [
                'Core Access' => ['reception', 'medicine_center', 'dental_lab', 'consultation_room', 'procedure_room', 'other_dispensing'],
                'Management' => ['user_management', 'patient_management', 'doctor_management', 'nurse_management', 'staff_management', 'clinic_management'],
                'Financial' => ['financial_management', 'payment_center', 'financial_reports'],
                'System' => ['settings', 'system_administration', 'backup_management', 'database_management', 'security_management'],
                'Reports' => ['report_management', 'patient_reports', 'inventory_reports', 'staff_reports', 'system_reports'],
                'Advanced' => ['marketing', 'inventory_management', 'data_export', 'data_import', 'audit_logs', 'notification_management'],
            ];

            foreach ($categories as $category => $categoryPrivileges) {
                $this->info("$category:");
                foreach ($categoryPrivileges as $privilege) {
                    $hasPrivilege = in_array($privilege, $privileges);
                    $status = $hasPrivilege ? '✓' : '✗';
                    $this->info("  $status $privilege");
                }
                $this->newLine();
            }

            // Overall status
            $totalExpected = 40; // Based on what we added
            $totalActual = count($privileges);
            
            if ($totalActual >= $totalExpected && $isAdmin) {
                $this->info('✅ ADMIN HAS FULL ACCESS');
                $this->info("✅ Role: Admin");
                $this->info("✅ Privileges: $totalActual/$totalExpected");
                $this->info('✅ System Access: Complete');
            } else {
                $this->warn('⚠️  ADMIN ACCESS INCOMPLETE');
                $this->warn("Role: " . ($isAdmin ? 'Admin' : 'Not Admin'));
                $this->warn("Privileges: $totalActual/$totalExpected");
            }

            $this->newLine();
            $this->info('=== VERIFICATION COMPLETE ===');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }
    }
}
