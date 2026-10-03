<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id', 'patient_id', 'consultation_id', 'task_type', 'treatment_details', 'status',
        'assigned_at', 'started_at', 'completed_at', 'notes', 'assigned_by'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function startTask()
    {
        $this->started_at = now();
        $this->status = 'in_progress';
        $this->save();

        // Also update patient waiting time
        $waitingTime = $this->patient->current_waiting_time;
        if ($waitingTime) {
            $waitingTime->startTreatment($this->doctor_id);
        }
    }

    public function completeTask($notes = null)
    {
        $this->completed_at = now();
        $this->status = 'completed';
        if ($notes) {
            $this->notes = $notes;
        }
        $this->save();

        // Also update patient waiting time
        $waitingTime = $this->patient->current_waiting_time;
        if ($waitingTime) {
            $waitingTime->endTreatment();
        }
    }

    public function getDurationAttribute()
    {
        // For completed tasks, calculate duration from start to completion
        if ($this->started_at && $this->completed_at) {
            return $this->started_at->diffInMinutes($this->completed_at);
        }
        
        // For in-progress tasks, calculate duration from start to now
        if ($this->started_at && $this->status === 'in_progress') {
            return $this->started_at->diffInMinutes(now());
        }
        
        // For pending tasks, return null (no duration yet)
        if ($this->status === 'pending') {
            return null;
        }
        
        // Fallback: if we have assigned_at but no started_at, calculate from assignment
        if ($this->assigned_at && !$this->started_at) {
            return $this->assigned_at->diffInMinutes(now());
        }
        
        return null;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Create a doctor task from a completed consultation
     */
    public static function createFromConsultation($consultation)
    {
        try {
            // Get the consultant/doctor from the consultation
            $doctor = $consultation->payment_cache_item->consultant ?? null;
            
            if (!$doctor) {
                \Log::warning('No consultant found for consultation', [
                    'consultation_id' => $consultation->id,
                    'payment_cache_item_id' => $consultation->payment_cache_item_id
                ]);
                return null;
            }

            // Get the patient from the consultation
            $patient = $consultation->payment_cache_item->payment_cache->check_in->patient ?? null;
            
            if (!$patient) {
                \Log::warning('No patient found for consultation', [
                    'consultation_id' => $consultation->id,
                    'payment_cache_item_id' => $consultation->payment_cache_item_id
                ]);
                return null;
            }

            // Check if a task already exists for this consultation
            $existingTask = self::where('consultation_id', $consultation->id)->first();
            if ($existingTask) {
                \Log::info('Doctor task already exists for consultation', [
                    'consultation_id' => $consultation->id,
                    'task_id' => $existingTask->id
                ]);
                return $existingTask;
            }

            // Determine task type based on consultation details
            $taskType = 'General Consultation';
            if ($consultation->require_glass === 'Yes') {
                $taskType = 'Eye Examination with Spectacle Prescription';
            } elseif ($consultation->patient_direction === 'Direct to Optician') {
                $taskType = 'Eye Examination for Spectacle Fitting';
            }

            // Create the doctor task
            $task = self::create([
                'doctor_id' => $doctor->id,
                'patient_id' => $patient->id,
                'consultation_id' => $consultation->id,
                'task_type' => $taskType,
                'treatment_details' => 'Consultation completed - ' . $consultation->status,
                'status' => 'completed', // Mark as completed since consultation is done
                'assigned_at' => $consultation->created_at,
                'started_at' => $consultation->created_at, // Assume started when consultation was created
                'completed_at' => $consultation->updated_at, // Completed when consultation was updated
                'assigned_by' => $consultation->created_by,
                'notes' => 'Auto-generated from completed consultation'
            ]);

            \Log::info('Doctor task created from consultation', [
                'consultation_id' => $consultation->id,
                'task_id' => $task->id,
                'doctor_id' => $doctor->id,
                'doctor_name' => $doctor->full_name,
                'patient_id' => $patient->id,
                'patient_name' => $patient->full_name,
                'task_type' => $taskType
            ]);

            return $task;

        } catch (\Exception $e) {
            \Log::error('Failed to create doctor task from consultation', [
                'consultation_id' => $consultation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Get consultation relationship
     */
    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'consultation_id');
    }
}