<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserPrivilege;

class FixUserPrivileges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'privileges:fix';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix user privileges to match frontend requirements';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== FIXING USER PRIVILEGES ===');
        $this->newLine();

        try {
            // Find admin user
            $admin = User::where('username', 'admin')->first();
            
            if (!$admin) {
                $this->error('❌ Admin user not found!');
                return 1;
            }

            $this->info("Fixing privileges for admin user: {$admin->first_name} {$admin->last_name} (ID: {$admin->id})");
            $this->newLine();

            // Define all privileges that the frontend expects
            $frontendPrivileges = [
                // Core access privileges (from App.jsx)
                'dashboard',
                'reception',
                'payment_center',
                'consultation_room',
                'optician_center',
                'medicine_center',
                'procedure_room',
                'inventory_management',
                'marketing',
                'financial_management',
                'user_management',
                'settings',
                
                // Additional system privileges
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
                
                // Additional privileges that might be needed
                'other_dispensing',
                'medicine_center',
                'patient_records',
                'dispensing',
                'stock_management',
                'supplier_management',
                'purchase_management',
                'sales_management',
                'billing_management',
                'payment_processing',
                'refund_management',
                'insurance_management',
                'appointment_management',
                'schedule_management',
                'task_management',
                'document_management',
                'report_generation',
                'data_analysis',
                'system_monitoring',
                'log_management',
                'error_tracking',
                'performance_monitoring',
                'backup_restore',
                'system_configuration',
                'user_authentication',
                'role_management',
                'permission_management',
                'access_control',
                'audit_trail',
                'activity_logging',
                'system_logs',
                'error_logs',
                'access_logs',
                'security_logs',
                'compliance_logs',
                'audit_logs',
                'system_health',
                'performance_metrics',
                'usage_statistics',
                'user_activity',
                'system_usage',
                'feature_usage',
                'module_access',
                'function_access',
                'api_access',
                'database_access',
                'file_access',
                'network_access',
                'external_access',
                'integration_access',
                'third_party_access',
                'service_access',
                'resource_access',
                'content_access',
                'data_access',
                'information_access',
                'knowledge_access',
                'document_access',
                'media_access',
                'asset_access',
                'resource_management',
                'content_management',
                'information_management',
                'knowledge_management',
                'document_management',
                'media_management',
                'asset_management',
                'resource_planning',
                'content_planning',
                'information_planning',
                'knowledge_planning',
                'document_planning',
                'media_planning',
                'asset_planning',
            ];

            $this->info('Adding all frontend-required privileges...');

            // Clear existing privileges for admin
            UserPrivilege::where('user_id', $admin->id)->delete();
            $this->info('✅ Cleared existing privileges');

            // Add all privileges
            foreach ($frontendPrivileges as $privilege) {
                UserPrivilege::create([
                    'user_id' => $admin->id,
                    'privilege' => $privilege
                ]);
            }

            $this->info("✅ Added " . count($frontendPrivileges) . " privileges to admin user");

            // Verify privileges
            $totalPrivileges = UserPrivilege::where('user_id', $admin->id)->count();
            $this->info("Total privileges now: $totalPrivileges");

            // Show key privileges that frontend needs
            $keyPrivileges = [
                'dashboard', 'reception', 'payment_center', 'consultation_room',
                'optician_center', 'medicine_center', 'procedure_room',
                'inventory_management', 'marketing', 'financial_management',
                'user_management', 'settings'
            ];

            $this->newLine();
            $this->info('Key frontend privileges:');
            foreach ($keyPrivileges as $privilege) {
                $hasPrivilege = UserPrivilege::where('user_id', $admin->id)
                    ->where('privilege', $privilege)
                    ->exists();
                $status = $hasPrivilege ? '✓' : '✗';
                $this->info("  $status $privilege");
            }

            $this->newLine();
            $this->info('=== PRIVILEGES FIXED ===');
            $this->info('✅ Admin user now has all required privileges');
            $this->info('✅ Frontend should now show all menus and pages');
            $this->info('✅ Dashboard and all modules should be accessible');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            $this->error('Stack trace:');
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
