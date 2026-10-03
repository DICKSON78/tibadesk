<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationVisualAcuity extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id', 'unaided_re_va', 'unaided_re_ph', 'unaided_ipd', 'unaided_le_va', 'unaided_le_ph',
        'aided_re_va', 'aided_re_va_description', 'aided_le_va', 'aided_le_va_description', 'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
