<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientMedicalHistory extends Model
{
    use HasFactory;

    protected $table = 'patient_medical_histories';

    protected $fillable = [
        'patient_id', 'consultation_id', 'condition_name', 'category',
        'details', 'status', 'diagnosed_date', 'medications',
        'is_active', 'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'diagnosed_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
