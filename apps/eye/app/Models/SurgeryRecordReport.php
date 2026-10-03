<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurgeryRecordReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_item_id', 'unaided_re_va', 'unaided_le_va', 'aided_re_va', 'aided_le_va', 'surgeon',
        'assistant_surgeon', 'scrub_nurse', 'operation_type', 'anaesthesia_type', 'operated_eye', 'intraoperative_notes',
        'postoperative_management', 'remarks', 'created_by', 'status', 'saved_at', 'saved_by',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
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
