<?php

namespace App\Console\Commands;

use App\Models\Consultation;
use App\Models\DoctorTask;
use Illuminate\Console\Command;

class BackfillDoctorTasksFromConsultations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'doctor-tasks:backfill {--days=30 : Number of days to look back}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill doctor tasks from completed consultations';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $days = $this->option('days');
        $this->info("Backfilling doctor tasks from consultations in the last {$days} days...");

        // Get completed consultations from the last N days
        $consultations = Consultation::with([
            'payment_cache_item.consultant',
            'payment_cache_item.payment_cache.check_in.patient'
        ])
        ->where('status', 'Consulted')
        ->where('created_at', '>=', now()->subDays($days))
        ->get();

        $this->info("Found {$consultations->count()} completed consultations");

        $created = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($consultations as $consultation) {
            try {
                // Check if doctor task already exists
                $existingTask = DoctorTask::where('consultation_id', $consultation->id)->first();
                if ($existingTask) {
                    $skipped++;
                    continue;
                }

                // Create doctor task from consultation
                $doctorTask = DoctorTask::createFromConsultation($consultation);
                
                if ($doctorTask) {
                    $created++;
                    $this->line("✓ Created task for consultation {$consultation->id} - Doctor: {$doctorTask->doctor->full_name}, Patient: {$doctorTask->patient->full_name}");
                } else {
                    $errors++;
                    $this->error("✗ Failed to create task for consultation {$consultation->id}");
                }
            } catch (\Exception $e) {
                $errors++;
                $this->error("✗ Error processing consultation {$consultation->id}: " . $e->getMessage());
            }
        }

        $this->info("\nBackfill completed:");
        $this->info("✓ Created: {$created} tasks");
        $this->info("⚠ Skipped: {$skipped} tasks (already exist)");
        $this->info("✗ Errors: {$errors} tasks");

        return Command::SUCCESS;
    }
}