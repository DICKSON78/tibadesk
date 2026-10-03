<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalSurgeryRecord extends Model
{
    use HasFactory;

    protected $table = 'dental_surgery_records';

    protected $fillable = [
        'payment_cache_item_id', 'patient_id', 'surgery_type', 'tooth_number',
        'pre_op_diagnosis', 'post_op_diagnosis', 'clinical_data',
        'anesthesia_type', 'anesthesia_amount', 'surgical_technique',
        'complications', 'operative_findings', 'procedure_done',
        'operation_date', 'surgeon_id', 'assistant_surgeon_id',
        'postoperative_instructions', 'postoperative_data',
        'created_by', 'status', 'saved_at', 'saved_by',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function surgeon()
    {
        return $this->belongsTo(User::class, 'surgeon_id');
    }

    public function assistant_surgeon()
    {
        return $this->belongsTo(User::class, 'assistant_surgeon_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
