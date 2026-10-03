<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PatientWaitingTime;
use Carbon\Carbon;

class InvestigatePatientWaitingTimes extends Command
{
    protected $signature = 'investigate:patient-waiting-times {--date= : Date to check (Y-m-d format, defaults to today)}';
    protected $description = 'Investigate why patient waiting times are not completing properly';

    public function handle()
    {
        $date = $this->option('date') ?: now()->format('Y-m-d');
        
        $this->info("Investigating patient waiting times for date: {$date}");
        
        $patients = PatientWaitingTime::with(['patient', 'doctor'])
            ->whereDate('registration_time', $date)
            ->where('status', 'in_treatment')
            ->get();
        
        $this->info("Found {$patients->count()} patients in treatment");
        
        if ($patients->count() === 0) {
            $this->info("No patients in treatment found for {$date}");
            return 0;
        }
        
        foreach ($patients as $patient) {
            $this->newLine();
            $this->info("=== INVESTIGATING PATIENT: " . ($patient->patient->full_name ?: 'Unknown') . " ===");
            $this->line("Patient ID: {$patient->patient_id}");
            $this->line("Waiting Time ID: {$patient->id}");
            $this->line("Status: {$patient->status}");
            $this->line("Current Department: " . ($patient->current_department ?: 'None'));
            $this->line("Registration Time: " . ($patient->registration_time ?: 'None'));
            $this->line("Treatment Start Time: " . ($patient->treatment_start_time ?: 'None'));
            $this->line("Treatment End Time: " . ($patient->treatment_end_time ?: 'None'));
            $this->line("Waiting Duration: " . ($patient->waiting_duration_minutes ?: 'Not set') . " minutes");
            $this->line("Treatment Duration: " . ($patient->treatment_duration_minutes ?: 'Not set') . " minutes");
            
            if ($patient->department_history) {
                $this->line("Department History:");
                foreach ($patient->department_history as $index => $entry) {
                    $notes = isset($entry['notes']) ? $entry['notes'] : 'None';
                    $this->line("  {$index}: {$entry['department']} at {$entry['moved_at']} (Notes: {$notes})");
                }
            } else {
                $this->line("Department History: None");
            }
            
            $consultation = $patient->patient->consultations()
                ->whereDate('consultations.created_at', $patient->registration_time->format('Y-m-d'))
                ->first();
            
            if ($consultation) {
                $this->line("Consultation Found:");
                $this->line("  - ID: {$consultation->id}");
                $this->line("  - Status: {$consultation->status}");
                $this->line("  - Require Glass: " . ($consultation->require_glass ?: 'Not set'));
                $this->line("  - Patient to Return: " . ($consultation->patient_to_return ?: 'Not set'));
                $this->line("  - Sent to Optician: " . ($consultation->sent_to_optician_at ?: 'Not set'));
                
                if ($consultation->payment_cache_item && $consultation->payment_cache_item->payment_cache) {
                    $paymentCache = $consultation->payment_cache_item->payment_cache;
                    $items = $paymentCache->items()->with(['item', 'consultation_type'])->get();
                    
                    $this->line("  - Payment Cache Items ({$items->count()} total):");
                    foreach ($items as $item) {
                        $itemName = $item->item && $item->item->name ? $item->item->name : 'Unknown Item';
                        $this->line("    * {$itemName} - Status: {$item->status} - Qty: {$item->quantity}");
                    }
                    
                    $pendingItems = $items->where('status', '!=', 'Served')->count();
                    $this->line("  - Pending Items: {$pendingItems}");
                } else {
                    $this->line("  - No payment cache items found");
                }
            } else {
                $this->line("No consultation found for this patient");
                
                $checkIn = $patient->patient->check_ins()
                    ->whereDate('created_at', $patient->registration_time->format('Y-m-d'))
                    ->first();
                
                if ($checkIn && $checkIn->payment_cache) {
                    $paymentCache = $checkIn->payment_cache;
                    $items = $paymentCache->items()->with(['item', 'consultation_type'])->get();
                    
                    $this->line("Direct Dispensing Found:");
                    $this->line("  - Check-in ID: {$checkIn->id}");
                    $this->line("  - Payment Cache Items ({$items->count()} total):");
                    foreach ($items as $item) {
                        $itemName = $item->item && $item->item->name ? $item->item->name : 'Unknown Item';
                        $this->line("    * {$itemName} - Status: {$item->status} - Qty: {$item->quantity}");
                    }
                    
                    $pendingItems = $items->where('status', '!=', 'Served')->count();
                    $this->line("  - Pending Items: {$pendingItems}");
                } else {
                    $this->line("No direct dispensing found");
                }
            }
            
            $shouldComplete = $patient->shouldCompleteTreatment();
            $hasCompletedJourney = $patient->hasCompletedFullJourney();
            
            $this->line("Completion Logic Results:");
            $this->line("  - shouldCompleteTreatment(): " . ($shouldComplete ? 'TRUE' : 'FALSE'));
            $this->line("  - hasCompletedFullJourney(): " . ($hasCompletedJourney ? 'TRUE' : 'FALSE'));
            
            $this->line("Manual Analysis:");
            
            $hasBeenToDispensing = $patient->hasBeenToDepartment('dispensing');
            $this->line("  - Has been to dispensing: " . ($hasBeenToDispensing ? 'Yes' : 'No'));
            
            $allItemsServed = true;
            if ($consultation && $consultation->payment_cache_item && $consultation->payment_cache_item->payment_cache) {
                $pendingItems = $consultation->payment_cache_item->payment_cache->items()
                    ->whereNotIn('patient_payment_cache_items.status', ['Served', 'Paid'])
                    ->count();
                $allItemsServed = $pendingItems === 0;
                $this->line("  - All consultation items served: " . ($allItemsServed ? 'Yes' : 'No') . " (Pending: {$pendingItems})");
            } else {
                $checkIn = $patient->patient->check_ins()
                    ->whereDate('created_at', $patient->registration_time->format('Y-m-d'))
                    ->first();
                
                if ($checkIn && $checkIn->payment_cache) {
                    $pendingItems = $checkIn->payment_cache->items()
                        ->whereNotIn('patient_payment_cache_items.status', ['Served', 'Paid'])
                        ->count();
                    $allItemsServed = $pendingItems === 0;
                    $this->line("  - All direct dispensing items served: " . ($allItemsServed ? 'Yes' : 'No') . " (Pending: {$pendingItems})");
                } else {
                    $this->line("  - No items found to check");
                }
            }
            
            $consultationCompleted = !$consultation || $consultation->status === 'Consulted';
            $this->line("  - Consultation completed: " . ($consultationCompleted ? 'Yes' : 'No'));
            
            $this->line("Why patient is NOT completing:");
            if (!$consultationCompleted) {
                $consultationStatus = $consultation ? $consultation->status : 'No consultation';
                $this->warn("  - Consultation not completed (Status: {$consultationStatus})");
            }
            if (!$allItemsServed) {
                $this->warn("  - Not all items are served");
            }
            if (!$hasBeenToDispensing && $patient->current_department !== 'dispensing') {
                $this->warn("  - Patient has not been to dispensing yet");
            }
            if ($patient->current_department === 'consultation' && $consultation && $consultation->require_glass === 'Yes') {
                $this->warn("  - Patient needs glasses and is in consultation (should go to dispensing)");
            }
            
            $this->line("=== END INVESTIGATION ===");
        }
        
        return 0;
    }
}
