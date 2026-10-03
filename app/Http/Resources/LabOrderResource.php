<?php

namespace App\Http\Resources;

use App\Models\LabOrder;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LabOrder
 */
class LabOrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'encounter_id' => $this->encounter_id,
            'status' => $this->status,
            'priority' => $this->priority,
            'clinical_notes' => $this->clinical_notes,
            'ordered_at' => $this->ordered_at?->toIso8601String(),
            'patient' => $this->whenLoaded('encounter', fn () => [
                'id' => $this->encounter?->patient?->id,
                'name' => $this->encounter?->patient?->fullName(),
                'patient_number' => $this->encounter?->patient?->patient_number,
            ]),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'test' => $item->labTest?->name,
                'code' => $item->labTest?->code,
                'unit' => $item->labTest?->unit,
                'status' => $item->status,
                'result_value' => $item->result_value,
                'result_text' => $item->result_text,
                'result_flag' => $item->result_flag,
                'result_notes' => $item->result_notes,
                'resulted_at' => $item->resulted_at?->toIso8601String(),
            ])),
        ];
    }
}
