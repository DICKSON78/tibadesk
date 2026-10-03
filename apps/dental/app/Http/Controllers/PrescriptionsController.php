<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PrescriptionsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'patient_id' => 'sometimes|integer|exists:patients,id',
            'consultation_id' => 'sometimes|integer|exists:consultations,id',
            'status' => 'sometimes|in:Active,Completed,Cancelled',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;

        $query = Prescription::with(['patient', 'medicine', 'prescribedBy', 'creator', 'consultation']);

        if ($request->patient_id) {
            $query->where('patient_id', $request->patient_id);
        }
        if ($request->consultation_id) {
            $query->where('consultation_id', $request->consultation_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($user && !$user->is_admin) {
            $query->whereHas('patient', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        $prescriptions = $query->orderBy('created_at', 'desc')->paginate($per_page);
        return $this->sendResponse($prescriptions, Response::HTTP_OK, 'Prescriptions retrieved successfully.');
    }

    public function show($id)
    {
        $prescription = Prescription::with(['patient', 'medicine', 'prescribedBy', 'creator', 'consultation'])->findOrFail($id);
        return $this->sendResponse($prescription, Response::HTTP_OK, 'Prescription retrieved successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|integer|exists:consultations,id',
            'patient_id' => 'required|integer|exists:patients,id',
            'medicine_id' => 'nullable|integer|exists:items,id',
            'medicine_name' => 'required|string',
            'dosage' => 'nullable|string',
            'frequency' => 'nullable|string',
            'duration' => 'nullable|string',
            'route' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $data = $request->all();
        $data['prescribed_by'] = $request->user()->id;
        $data['created_by'] = $request->user()->id;
        $data['status'] = 'Active';

        $prescription = Prescription::create($data);
        $prescription->load(['patient', 'medicine', 'prescribedBy', 'creator', 'consultation']);

        return $this->sendResponse($prescription, Response::HTTP_CREATED, 'Prescription created successfully.');
    }

    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);

        $request->validate([
            'medicine_id' => 'nullable|integer|exists:items,id',
            'medicine_name' => 'sometimes|string',
            'dosage' => 'nullable|string',
            'frequency' => 'nullable|string',
            'duration' => 'nullable|string',
            'route' => 'nullable|string',
            'instructions' => 'nullable|string',
            'status' => 'sometimes|in:Active,Completed,Cancelled',
        ]);

        $prescription->update($request->all());
        $prescription->load(['patient', 'medicine', 'prescribedBy', 'creator', 'consultation']);

        return $this->sendResponse($prescription, Response::HTTP_OK, 'Prescription updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        $prescription = Prescription::findOrFail($id);
        $prescription->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Prescription deleted successfully.');
    }
}
