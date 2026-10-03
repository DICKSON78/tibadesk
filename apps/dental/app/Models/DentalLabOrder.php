<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalLabOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'payment_cache_item_id',
        'order_type',
        'description',
        'material',
        'shade',
        'tooth_number',
        'teeth_involved',
        'impression_date',
        'delivery_date',
        'status',
        'lab_notes',
        'lab_name',
        'cost',
        'technician_charges',
        'ordered_by',
        'created_by',
    ];

    protected $casts = [
        'teeth_involved' => 'json',
        'cost' => 'decimal:2',
        'technician_charges' => 'decimal:2',
        'impression_date' => 'date:Y-m-d',
        'delivery_date' => 'date:Y-m-d',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class);
    }

    public function orderedBy()
    {
        return $this->belongsTo(User::class, 'ordered_by');
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
