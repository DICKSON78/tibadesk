<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CataractSurgeryRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_item_id', 'unaided_re_va', 'unaided_le_va', 'aided_re_va', 'aided_le_va', 'lens_examination_re',
        'lens_examination_le', 'other_ocular_pathology', 'other_ocular_pathology_specify', 'clinical_data',
        'operated_eye', 'operated_eye_refraction_sph', 'operated_eye_refraction_sph_postop', 'operated_eye_refraction_cyl',
        'operated_eye_refraction_axis', 'operated_eye_biometry_k1', 'operated_eye_biometry_k2', 'operated_eye_biometry_axial_length',
        'operation_date', 'operation_place', 'surgery_type', 'iol', 'hospital_id', 'surgeon_id', 'training', 'operative_complications',
        'section', 'capsulotomy', 'iol_type', 'iol_power', 'suture', 'number_of_sutures', 'postoperative_data', 'created_by', 'status',
        'saved_at', 'saved_by',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
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
