<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 'name', 'code', 'description', 'item_type_id', 'unit_of_measure_id',
        'balance', 'new_balance', 'unit_buying_price', 'selling_price', 'expiry_date',
        'minimum_stock', 'has_expiry', 'supplier', 'location', 'notes', 'status'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'balance' => 'double',
        'new_balance' => 'double',
        'unit_buying_price' => 'double',
        'selling_price' => 'double',
        'minimum_stock' => 'double',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function item_type()
    {
        return $this->belongsTo(ItemType::class, 'item_type_id');
    }

    public function unit_of_measure()
    {
        return $this->belongsTo(UnitOfMeasure::class, 'unit_of_measure_id');
    }

    public function inventory_payments()
    {
        return $this->hasMany(PatientPaymentCacheItem::class, 'item_id')
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', '!=', 'Pharmacy');
            });
    }

    public function inventory_dispensations()
    {
        return $this->hasMany(PatientPaymentCacheItem::class, 'item_id')
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', '!=', 'Pharmacy');
            })
            ->where('status', 'Served');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
