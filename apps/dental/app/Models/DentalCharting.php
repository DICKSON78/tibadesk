<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalCharting extends Model
{
    use HasFactory;

    protected $table = 'dental_charting';

    protected $fillable = [
        'consultation_id',
        'tooth_number',
        'tooth_quadrant',
        'status',
        'caries_status',
        'restoration_type',
        'surface_involved',
        'mobility',
        'periodontal_pocket_depth',
        'bleeding_on_probing',
        'furcation_involvement',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'bleeding_on_probing' => 'boolean',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
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
