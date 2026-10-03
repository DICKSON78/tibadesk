<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalTreatmentRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_item_id',
        'consultation_id',
        'treatment_type',
        'tooth_number',
        'tooth_surface',
        'anaesthesia_type',
        'preoperative_notes',
        'intraoperative_notes',
        'postoperative_notes',
        'prescription',
        'material_used',
        'status',
        'phase',
        'treated_by',
        'treatment_date',
        'created_by',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class);
    }

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function treatedBy()
    {
        return $this->belongsTo(User::class, 'treated_by');
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
