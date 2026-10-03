<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NhifClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 'consultation_id', 'authorization_no', 'member_no', 'patient_name',
        'diagnosis', 'treatment_provided', 'total_amount', 'amount_approved',
        'status', 'claim_date', 'submitted_date', 'approved_date', 'rejection_reason',
        'clinic_id', 'created_by',
    ];

    protected $casts = [
        'claim_date' => 'date',
        'submitted_date' => 'date',
        'approved_date' => 'date',
        'total_amount' => 'decimal:2',
        'amount_approved' => 'decimal:2',
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
