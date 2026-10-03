<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PatientItemPayment extends Model
{
    use HasFactory;

    protected $fillable = ['channel_id', 'amount', 'discount', 'created_by'];

    public function channel()
    {
        return $this->belongsTo(PaymentChannel::class, 'channel_id');
    }

    public function items()
    {
        return $this->hasMany(PatientPaymentCacheItem::class, 'item_payment_id');
    }

    public function first_item()
    {
        return $this->hasOne(PatientPaymentCacheItem::class, 'item_payment_id')
            ->with(['payment_cache.check_in.patient']);
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
