<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StocktakeItem extends Model
{
    use HasFactory;

    protected $fillable = ['stocktake_id', 'item_id', 'quantity', 'unit_buying_price', 'selling_price', 'expiration_date'];

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
