<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationDentalFunctionalTest extends Model
{
    use HasFactory;

    protected $table = 'consultation_dental_functional_tests';

    protected $fillable = [
        'consultation_id',
        'maximum_mouth_opening', 'lateral_excursion_right', 'lateral_excursion_left',
        'protrusion', 'bite_force', 'bite_classification',
        'occlusal_relationship', 'cross_bite', 'overjet', 'overbite',
        'centric_relation', 'centric_occlusion',
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
