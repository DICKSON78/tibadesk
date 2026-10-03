<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\NhifClaim;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NhifClaimsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,submitted,approved,rejected,paid',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $query = NhifClaim::with(['patient', 'creator']);

        if (!$user->is_admin) {
            $query->where('clinic_id', $user->clinic_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->start_date) {
            $query->whereDate('claim_date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('claim_date', '<=', $request->end_date);
        }

        $query->orderBy('created_at', 'desc');
        return $this->sendResponse($query->paginate($per_page), Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'authorization_no' => 'nullable|string|max:100',
            'member_no' => 'nullable|string|max:100',
            'patient_name' => 'required|string|max:255',
            'diagnosis' => 'nullable|string',
            'treatment_provided' => 'nullable|string',
            'total_amount' => 'required|numeric|min:0',
            'claim_date' => 'nullable|date',
        ]);

        $user = $request->user();
        $input = $request->all();
        $input['clinic_id'] = $user->clinic_id;
        $input['created_by'] = $user->id;

        $data = NhifClaim::create($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'NHIF claim created successfully.');
    }

    public function show($id)
    {
        $data = NhifClaim::with(['patient', 'consultation', 'creator'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $data = NhifClaim::findOrFail($id);

        $request->validate([
            'authorization_no' => 'nullable|string|max:100',
            'member_no' => 'nullable|string|max:100',
            'diagnosis' => 'nullable|string',
            'treatment_provided' => 'nullable|string',
            'total_amount' => 'nullable|numeric|min:0',
            'amount_approved' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,submitted,approved,rejected,paid',
            'submitted_date' => 'nullable|date',
            'approved_date' => 'nullable|date',
            'rejection_reason' => 'nullable|string',
        ]);

        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'NHIF claim updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        $data = NhifClaim::findOrFail($id);
        $data->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'NHIF claim deleted successfully.');
    }
}
