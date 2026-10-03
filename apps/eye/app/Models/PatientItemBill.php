<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientItemBill extends Model
{
    use HasFactory;

    protected $appends = ['amount_paid'];

    protected $fillable = ['amount', 'discount', 'created_by', 'status', 'cleared_at', 'cleared_by'];

    protected $casts = [
        'cleared_at' => 'datetime:Y-m-d H:i',
    ];

    public function items()
    {
        return $this->hasMany(PatientPaymentCacheItem::class, 'bill_id');
    }

    public function payments()
    {
        return $this->hasMany(PatientItemBillPayment::class, 'bill_id');
    }

    public function first_item()
    {
        return $this->hasOne(PatientPaymentCacheItem::class, 'bill_id')
            ->with(['payment_cache.check_in.patient']);
    }

    public function getAmountPaidAttribute()
    {
        return PatientItemBillPayment::where('bill_id', $this->id)->sum('amount');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function clearer()
    {
        return $this->belongsTo(User::class, 'cleared_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
