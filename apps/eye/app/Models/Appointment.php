<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name', 'phone', 'email', 'preferred_date', 'preferred_time',
        'service', 'message', 'status',
    ];

    protected $casts = [
        'preferred_date' => 'date:Y-m-d',
        'preferred_time' => 'string',
    ];

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
