<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientPaymentCache extends Model
{
    use HasFactory;

    protected $table = 'patient_payment_cache';

    protected $fillable = [
        'check_in_id', 'consultation_id', 'created_by',
    ];

    public function check_in()
    {
        return $this->belongsTo(PatientCheckIn::class, 'check_in_id');
    }

    public function items()
    {
        return $this->hasMany(PatientPaymentCacheItem::class, 'payment_cache_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'consultation_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
