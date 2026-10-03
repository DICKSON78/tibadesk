<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'name', 'code', 'item_type_id', 'consultation_type_id', 'unit_of_measure_id', 'lens_type_id',
        'is_consultation_item', 'is_stock_item', 'balance', 'new_balance', 'unit_buying_price', 'templates', 'status',
        'expiry_date', 'has_expiry', 'minimum_stock',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function item_type()
    {
        return $this->belongsTo(ItemType::class, 'item_type_id');
    }

    public function consultation_type()
    {
        return $this->belongsTo(ConsultationType::class, 'consultation_type_id');
    }

    public function unit_of_measure()
    {
        return $this->belongsTo(UnitOfMeasure::class, 'unit_of_measure_id');
    }

    public function lens_type()
    {
        return $this->belongsTo(LensType::class, 'lens_type_id');
    }

    public function prices()
    {
        return $this->hasMany(ItemPrice::class, 'item_id');
    }

    public function dispensations()
    {
        return $this->hasMany(PatientPaymentCacheItem::class, 'item_id')
            ->where('status', 'Served');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
