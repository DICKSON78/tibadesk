<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientMedicalHistory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientMedicalHistoriesController extends Controller
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

        $data = PatientMedicalHistory::with(['creator'])
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
            'condition_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'details' => 'nullable|string',
            'status' => 'nullable|string|max:255',
            'diagnosed_date' => 'nullable|date',
            'medications' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        $history = PatientMedicalHistory::create([
            'patient_id' => $request->patient_id,
            'consultation_id' => $request->consultation_id,
            'condition_name' => $request->condition_name,
            'category' => $request->category,
            'details' => $request->details,
            'status' => $request->status,
            'diagnosed_date' => $request->diagnosed_date,
            'medications' => $request->medications,
            'is_active' => true,
            'created_by' => $user->id,
        ]);

        return $this->sendResponse($history->fresh(), Response::HTTP_CREATED, 'Medical history recorded successfully.');
    }

    public function show($id)
    {
        $history = PatientMedicalHistory::with(['creator'])->findOrFail($id);
        return $this->sendResponse($history, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $history = PatientMedicalHistory::findOrFail($id);

        $request->validate([
            'condition_name' => 'sometimes|string|max:255',
            'category' => 'nullable|string|max:255',
            'details' => 'nullable|string',
            'status' => 'nullable|string|max:255',
            'diagnosed_date' => 'nullable|date',
            'medications' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $history->update($request->only([
            'condition_name', 'category', 'details', 'status', 'diagnosed_date', 'medications', 'is_active',
        ]));

        return $this->sendResponse($history->fresh(), Response::HTTP_OK, 'Medical history updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        $history = PatientMedicalHistory::findOrFail($id);
        $history->update(['is_active' => false]);

        return $this->sendResponse(null, Response::HTTP_OK, 'Medical history deactivated successfully.');
    }
}
