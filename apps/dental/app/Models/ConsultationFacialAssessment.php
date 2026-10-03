<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationFacialAssessment extends Model
{
    use HasFactory;

    protected $table = 'consultation_facial_assessments';

    protected $fillable = [
        'consultation_id',
        'facial_symmetry', 'facial_swelling', 'facial_trauma',
        'right_tmj_tenderness', 'right_tmj_clicking', 'right_tmj_pain_on_opening',
        'left_tmj_tenderness', 'left_tmj_clicking', 'left_tmj_pain_on_opening',
        'submandibular_lymph_nodes', 'cervical_lymph_nodes', 'pre_auricular_lymph_nodes',
        'lip_competence', 'lip_dryness', 'lip_lesions',
        'palate_shape', 'palate_lesions', 'hard_palate', 'soft_palate',
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
