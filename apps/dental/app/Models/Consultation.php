<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_cache_item_id', 'chief_complaint', 'history_present_illness',
        'family_history', 'general_health', 'family_dental_history', 'family_general_history',
        'patient_to_return', 'to_return_date', 'to_return_time', 'remarks', 'created_by',
        'status', 'oral_hygiene_status', 'tobacco_use', 'alcohol_use',
        'extra_oral_examination', 'tmj_examination', 'lymph_nodes',
        'returned_from',
    ];

    public function payment_cache_item()
    {
        return $this->belongsTo(PatientPaymentCacheItem::class, 'payment_cache_item_id');
    }

    public function payment_cache()
    {
        return $this->hasMany(PatientPaymentCache::class, 'consultation_id');
    }

    public function diagnoses()
    {
        return $this->hasMany(ConsultationDiagnosis::class, 'consultation_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function dental_facial_assessment()
    {
        return $this->hasOne(ConsultationFacialAssessment::class, 'consultation_id');
    }

    public function dental_functional_assessment()
    {
        return $this->hasOne(ConsultationDentalFunctionalTest::class, 'consultation_id');
    }

    public function dental_pain_assessment()
    {
        return $this->hasOne(ConsultationPainAssessment::class, 'consultation_id');
    }

    public function dental_oral_examination()
    {
        return $this->hasOne(DentalOralExamination::class, 'consultation_id');
    }

    public function dental_charting()
    {
        return $this->hasMany(DentalCharting::class, 'consultation_id');
    }

    public function dental_treatment_records()
    {
        return $this->hasMany(DentalTreatmentRecord::class, 'consultation_id');
    }

    public function dental_lab_orders()
    {
        return $this->hasMany(DentalLabOrder::class, 'consultation_id');
    }

    public function dental_radiographs()
    {
        return $this->hasMany(DentalRadiograph::class, 'consultation_id');
    }

    public function dental_appointments()
    {
        return $this->hasMany(DentalAppointment::class, 'consultation_id');
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'consultation_id');
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
