<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationPainAssessment extends Model
{
    use HasFactory;

    protected $table = 'consultation_pain_assessments';

    protected $fillable = [
        'consultation_id',
        'pain_level', 'pain_location', 'pain_type', 'pain_duration',
        'pain_triggers', 'pain_relieving_factors', 'pain_radiation',
        'swelling_level', 'swelling_location',
        'numbness_location', 'numbness_severity',
        'created_by',
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
