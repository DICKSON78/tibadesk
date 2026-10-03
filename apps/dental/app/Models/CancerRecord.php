<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CancerRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 'consultation_id', 'cancer_type', 'anatomical_site',
        'diagnosis_method', 'diagnosis_date', 'stage', 'notes',
        'clinic_id', 'created_by',
    ];

    protected $casts = [
        'diagnosis_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
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
