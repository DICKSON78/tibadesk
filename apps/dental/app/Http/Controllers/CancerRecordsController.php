<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\CancerRecord;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CancerRecordsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'cancer_type' => 'sometimes|string',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $query = CancerRecord::with(['patient', 'creator']);

        if (!$user->is_admin) {
            $query->where('clinic_id', $user->clinic_id);
        }

        if ($request->cancer_type) {
            $query->where('cancer_type', $request->cancer_type);
        }
        if ($request->start_date) {
            $query->whereDate('diagnosis_date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('diagnosis_date', '<=', $request->end_date);
        }

        $query->orderBy('created_at', 'desc');
        return $this->sendResponse($query->paginate($per_page), Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'cancer_type' => 'required|string|max:100',
            'anatomical_site' => 'nullable|string|max:255',
            'diagnosis_method' => 'nullable|in:Clinical,Histopathology,Imaging,Surgery,Other',
            'diagnosis_date' => 'nullable|date',
            'stage' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $input = $request->all();
        $input['clinic_id'] = $user->clinic_id;
        $input['created_by'] = $user->id;

        $data = CancerRecord::create($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Cancer record saved successfully.');
    }

    public function show($id)
    {
        return $this->sendResponse(CancerRecord::with(['patient', 'consultation', 'creator'])->findOrFail($id), Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $data = CancerRecord::findOrFail($id);
        $request->validate([
            'cancer_type' => 'nullable|string|max:100',
            'anatomical_site' => 'nullable|string|max:255',
            'diagnosis_method' => 'nullable|in:Clinical,Histopathology,Imaging,Surgery,Other',
            'diagnosis_date' => 'nullable|date',
            'stage' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Cancer record updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        CancerRecord::findOrFail($id)->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
