<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalOralExamination extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'lips',
        'buccal_mucosa',
        'tongue',
        'floor_of_mouth',
        'hard_palate',
        'soft_palate',
        'oropharynx',
        'gingiva',
        'salivary_glands',
        'occlusion',
        'other_findings',
        'created_by',
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
