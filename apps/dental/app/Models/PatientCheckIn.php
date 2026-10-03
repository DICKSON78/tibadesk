<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientCheckIn extends Model
{
    use HasFactory;

    protected $fillable = ['patient_id', 'payment_mode_id', 'created_by'];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function payment_mode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payment_cache()
    {
        return $this->hasOne(PatientPaymentCache::class, 'check_in_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
