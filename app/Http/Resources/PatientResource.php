<?php

namespace App\Http\Resources;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Patient
 */
class PatientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_number' => $this->patient_number,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'full_name' => $this->fullName(),
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'age' => $this->ageInYears(),
            'gender' => $this->gender,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'next_of_kin' => [
                'name' => $this->next_of_kin_name,
                'phone' => $this->next_of_kin_phone,
                'relationship' => $this->next_of_kin_relationship,
            ],
            'notes' => $this->notes,
            'is_deceased' => $this->is_deceased,
        ];
    }
}
