<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultationRefraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id', 'ob_re_sph', 'ob_re_cyl', 'ob_re_axis', 'ob_re_va', 'ob_le_sph', 'ob_le_cyl', 'ob_le_axis',
        'ob_le_va', 'sub_re_sph', 'sub_re_cyl', 'sub_re_axis', 'sub_re_va', 'sub_re_add', 'sub_re_add_va', 'sub_le_sph',
        'sub_le_cyl', 'sub_le_axis', 'sub_le_va', 'sub_le_add', 'sub_le_add_va', 'created_by',
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
