<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PatientWaitingTime;
use App\Models\PatientCheckIn;
use App\Models\Patient;
use Carbon\Carbon;

class PopulatePatientWaitingTimes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'populate:patient-waiting-times {--days=7 : Number of days back to populate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate patient waiting times for existing check-ins';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $days = $this->option('days');
        $startDate = Carbon::now()->subDays($days);
        
        $this->info("Populating patient waiting times for the last {$days} days...");
        
        // Get all check-ins from the specified period
        $checkIns = PatientCheckIn::with('patient')
            ->where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'asc')
            ->get();
        
        $this->info("Found {$checkIns->count()} check-ins to process");
        
        $created = 0;
        $skipped = 0;
        
        foreach ($checkIns as $checkIn) {
            // Check if waiting time record already exists
            $existingWaitingTime = PatientWaitingTime::where('patient_id', $checkIn->patient_id)
                ->whereDate('registration_time', $checkIn->created_at->format('Y-m-d'))
                ->first();
            
            if ($existingWaitingTime) {
                $skipped++;
                continue;
            }
            
            // Determine status based on consultation and items
            $status = 'waiting';
            $currentDepartment = 'reception';
            
            // Check if patient has consultation
            $consultation = $checkIn->patient->consultations()
                ->whereDate('consultations.created_at', $checkIn->created_at->format('Y-m-d'))
                ->first();
            
            if ($consultation) {
                $status = 'in_treatment';
                $currentDepartment = 'consultation';
            }
            
            // Check if patient has items that need payment
            if ($checkIn->payment_cache) {
                $pendingItems = $checkIn->payment_cache->items()
                    ->whereNotIn('status', ['Served', 'Paid'])
                    ->count();
                
                if ($pendingItems > 0) {
                    $status = 'in_treatment';
                    $currentDepartment = 'cashier';
                }
            }
            
            // Check if all items are served (completed)
            if ($checkIn->payment_cache) {
                $allItemsServed = $checkIn->payment_cache->items()
                    ->where('status', 'Served')
                    ->count() > 0;
                
                $noPendingItems = $checkIn->payment_cache->items()
                    ->whereNotIn('status', ['Served', 'Paid'])
                    ->count() === 0;
                
                if ($allItemsServed && $noPendingItems) {
                    $status = 'completed';
                }
            }
            
            // Create waiting time record
            try {
                PatientWaitingTime::create([
                    'patient_id' => $checkIn->patient_id,
                    'registration_time' => $checkIn->created_at,
                    'status' => $status,
                    'current_department' => $currentDepartment,
                    'department_history' => [
                        [
                            'department' => 'reception',
                            'moved_at' => $checkIn->created_at->toISOString(),
                            'moved_by' => $checkIn->created_by,
                            'notes' => 'Patient checked in'
                        ]
                    ]
                ]);
                
                $created++;
                
                if ($created % 100 === 0) {
                    $this->info("Created {$created} waiting time records...");
                }
                
            } catch (\Exception $e) {
                $this->error("Failed to create waiting time for patient {$checkIn->patient_id}: " . $e->getMessage());
            }
        }
        
        $this->info("Completed! Created {$created} new waiting time records, skipped {$skipped} existing records");
        
        return 0;
    }
}
