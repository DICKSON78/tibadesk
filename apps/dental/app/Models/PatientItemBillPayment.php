<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientItemBillPayment extends Model
{
    use HasFactory;

    protected $fillable = ['bill_id', 'channel_id', 'amount', 'created_by'];

    public function bill()
    {
        return $this->belongsTo(PatientItemBill::class, 'bill_id');
    }

//    public function items()
//    {
//        return $this->hasManyThrough(PatientPaymentCacheItem::class, PatientItemBill::class, 'bill_id', 'bill_id');
//    }

    public function channel()
    {
        return $this->belongsTo(PaymentChannel::class, 'channel_id');
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
