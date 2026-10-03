<?php

namespace App\Http\Resources;

use App\Models\EyeExam;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin EyeExam
 */
class EyeExamResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'od_visual_acuity' => $this->od_visual_acuity,
            'os_visual_acuity' => $this->os_visual_acuity,
            'right_eye' => $this->rightEye(),
            'left_eye' => $this->leftEye(),
            'od_iop' => $this->od_iop,
            'os_iop' => $this->os_iop,
            'diagnosis' => $this->diagnosis,
            'notes' => $this->notes,
        ];
    }
}
