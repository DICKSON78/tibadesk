<?php

namespace App\Http\Resources;

use App\Models\ConsultationDiagnosis;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ConsultationDiagnosis
 */
class ConsultationDiagnosisResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'code' => $this->code,
            'type' => $this->type,
            'is_principal' => $this->isPrincipal(),
            'notes' => $this->notes,
        ];
    }
}
