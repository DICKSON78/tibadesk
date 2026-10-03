<?php

namespace App\Models\Marketing;

use App\Models\Clinic;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InformationSource extends Model
{
    use HasFactory;

    protected $fillable = ['clinic_id', 'name', 'description', 'status'];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
