<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PatientWaitingTime;
use Carbon\Carbon;

class FixPatientWaitingTimes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'patients:fix-waiting-times {--force : Force fix all patients}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix patient waiting times by calculating missing durations and auto-completing stuck patients';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting patient waiting time fixes...');
        
        $force = $this->option('force');
        
        // Fix 1: Calculate missing waiting durations
        $this->fixMissingWaitingDurations();
        
        // Fix 2: Calculate missing treatment durations for completed patients
        $this->fixMissingTreatmentDurations();
        
        // Fix 3: Auto-complete stuck patients
        $this->autoCompleteStuckPatients();
        
        // Fix 4: Fix patients with wrong status
        $this->fixWrongStatusPatients();
        
        $this->info('Patient waiting time fixes completed!');
    }
    
    private function fixMissingWaitingDurations()
    {
        $this->info('Fixing missing waiting durations...');
        
        $patients = PatientWaitingTime::whereNull('waiting_duration_minutes')
            ->whereNotNull('registration_time')
            ->whereNotNull('treatment_start_time')
            ->get();
            
        $fixed = 0;
        foreach ($patients as $patient) {
            $patient->waiting_duration_minutes = $patient->registration_time->diffInMinutes($patient->treatment_start_time);
            $patient->save();
            $fixed++;
        }
        
        $this->info("Fixed waiting duration for {$fixed} patients.");
    }
    
    private function fixMissingTreatmentDurations()
    {
        $this->info('Fixing missing treatment durations for completed patients...');
        
        $patients = PatientWaitingTime::where('status', 'completed')
            ->whereNull('treatment_duration_minutes')
            ->whereNotNull('treatment_start_time')
            ->whereNotNull('treatment_end_time')
            ->get();
            
        $fixed = 0;
        foreach ($patients as $patient) {
            $patient->treatment_duration_minutes = $patient->treatment_start_time->diffInMinutes($patient->treatment_end_time);
            $patient->save();
            $fixed++;
        }
        
        $this->info("Fixed treatment duration for {$fixed} patients.");
    }
    
    private function autoCompleteStuckPatients()
    {
        $this->info('Auto-completing stuck patients...');
        
        $stuckPatients = PatientWaitingTime::where('status', 'in_treatment')
            ->where('treatment_start_time', '<', now()->subHours(8))
            ->get();
            
        $completed = 0;
        foreach ($stuckPatients as $patient) {
            if ($patient->autoCompleteIfStuck()) {
                $completed++;
            }
        }
        
        $this->info("Auto-completed {$completed} stuck patients.");
    }
    
    private function fixWrongStatusPatients()
    {
        $this->info('Fixing patients with wrong status...');
        
        $patients = PatientWaitingTime::where('status', 'in_treatment')->get();
        
        $fixed = 0;
        foreach ($patients as $patient) {
            // Check if patient should actually be completed
            if ($patient->hasCompletedFullJourney()) {
                $patient->endTreatment();
                $fixed++;
                $this->line("Fixed patient: " . ($patient->patient->full_name ?? 'Unknown') . " - marked as completed");
            }
        }
        
        $this->info("Fixed status for {$fixed} patients.");
    }
}
