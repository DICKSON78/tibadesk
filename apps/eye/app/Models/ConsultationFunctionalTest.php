<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationFunctionalTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id', 're_npc', 're_npa', 're_confrontation', 're_cover_test',
        'le_npc', 'le_npa', 'le_confrontation', 'le_cover_test', 'created_by'
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
