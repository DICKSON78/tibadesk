<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationExternalExamination extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id', 're_lid', 're_sclera', 're_cornea', 're_conjuctiva', 're_iris', 're_pupil', 're_lens', 're_iop',
        'le_lid', 'le_sclera', 'le_cornea', 'le_conjuctiva', 'le_iris', 'le_pupil', 'le_lens', 'le_iop', 'created_by',
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
