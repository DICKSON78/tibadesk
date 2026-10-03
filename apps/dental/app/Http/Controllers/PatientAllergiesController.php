<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientAllergy;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientAllergiesController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'patient_id' => 'required|exists:patients,id',
        ]);

        $per_page = $request->per_page ?? 25;
        $patient_id = $request->patient_id;
        $is_active = $request->boolean('is_active', true);

        $data = PatientAllergy::with(['creator'])
            ->where('patient_id', $patient_id)
            ->where('is_active', $is_active)
            ->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'allergen' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'severity' => 'nullable|string|max:255',
            'reaction' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $allergy = PatientAllergy::create([
            'patient_id' => $request->patient_id,
            'consultation_id' => $request->consultation_id,
            'allergen' => $request->allergen,
            'type' => $request->type,
            'severity' => $request->severity,
            'reaction' => $request->reaction,
            'notes' => $request->notes,
            'is_active' => true,
            'created_by' => $user->id,
        ]);

        return $this->sendResponse($allergy->fresh(), Response::HTTP_CREATED, 'Allergy recorded successfully.');
    }

    public function show($id)
    {
        $allergy = PatientAllergy::with(['creator'])->findOrFail($id);
        return $this->sendResponse($allergy, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $allergy = PatientAllergy::findOrFail($id);

        $request->validate([
            'allergen' => 'sometimes|string|max:255',
            'type' => 'nullable|string|max:255',
            'severity' => 'nullable|string|max:255',
            'reaction' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $allergy->update($request->only([
            'allergen', 'type', 'severity', 'reaction', 'notes', 'is_active',
        ]));

        return $this->sendResponse($allergy->fresh(), Response::HTTP_OK, 'Allergy updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        $allergy = PatientAllergy::findOrFail($id);
        $allergy->update(['is_active' => false]);

        return $this->sendResponse(null, Response::HTTP_OK, 'Allergy deactivated successfully.');
    }
}
