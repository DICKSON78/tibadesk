<?php

namespace App\Models;

use App\Models\Marketing\InformationSource;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $appends = ['full_name'];

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'gender', 'date_of_birth', 'region_id', 'district_id', 'ward_id',
        'address', 'national_id', 'phone', 'email', 'occupation', 'next_of_kin', 'tribe', 'religion',
        'payment_mode_id', 'info_source_id', 'is_vip', 'created_by',
    ];

    protected $casts = [
        'is_vip' => 'boolean',
        'date_of_birth' => 'date',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class, 'ward_id');
    }

    public function payment_mode()
    {
        return $this->belongsTo(PaymentMode::class, 'payment_mode_id');
    }

    public function information_source()
    {
        return $this->belongsTo(InformationSource::class, 'info_source_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function waiting_times()
    {
        return $this->hasMany(PatientWaitingTime::class, 'patient_id');
    }

    public function current_waiting_time()
    {
        return $this->hasOne(PatientWaitingTime::class, 'patient_id')->whereIn('patient_waiting_times.status', ['waiting', 'in_treatment']);
    }

    public function consultations()
    {
        // This is a method to get consultations for a patient through the relationship chain
        // Used by PatientWaitingTime model to check consultation status
        try {
            return Consultation::join('patient_payment_cache_items', 'consultations.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                ->where('patient_check_ins.patient_id', $this->id)
                ->select('consultations.*')
                ->orderBy('consultations.created_at', 'desc');
        } catch (\Exception $e) {
            \Log::error('Error in Patient consultations method: ' . $e->getMessage(), [
                'patient_id' => $this->id
            ]);
            // Return an empty query builder to prevent further errors
            return Consultation::whereRaw('1 = 0');
        }
    }

    public function check_ins()
    {
        return $this->hasMany(PatientCheckIn::class, 'patient_id');
    }

    public function allergies()
    {
        return $this->hasMany(PatientAllergy::class, 'patient_id');
    }

    public function active_allergies()
    {
        return $this->hasMany(PatientAllergy::class, 'patient_id')->where('is_active', true);
    }

    public function medical_histories()
    {
        return $this->hasMany(PatientMedicalHistory::class, 'patient_id');
    }

    public function active_medical_histories()
    {
        return $this->hasMany(PatientMedicalHistory::class, 'patient_id')->where('is_active', true);
    }

    protected function displayTitleCase($value)
    {
        if ($value === null || trim((string) $value) === '') {
            return $value;
        }
        return mb_convert_case($value, MB_CASE_TITLE, 'UTF-8');
    }

    public function getFirstNameAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getMiddleNameAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getLastNameAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getAddressAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getTribeAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getReligionAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getOccupationAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getNextOfKinAttribute($value)
    {
        return $this->displayTitleCase($value);
    }

    public function getFullNameAttribute()
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name
        ]);
        return implode(' ', $parts);
    }

    public function scopeFullName($query, $value)
    {
        return $query->whereRaw('concat(first_name, coalesce(middle_name, ""), last_name) like ?', [str_replace(' ', '', $value)]);
    }

    public function scopeVip($query)
    {
        return $query->where('is_vip', true);
    }

    public function scopeRegular($query)
    {
        return $query->where('is_vip', false);
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}