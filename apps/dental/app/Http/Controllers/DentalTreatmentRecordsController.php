<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalTreatmentRecord;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalTreatmentRecordsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'status' => 'sometimes|string',
            'consultation_id' => 'sometimes|exists:consultations,id',
            'patient_id' => 'sometimes|integer|exists:patients,id',
        ]);

        $per_page = $request->per_page ?? 25;
        $data = DentalTreatmentRecord::with([
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient' => function ($query2) {
                    $query2->with(['region', 'district', 'ward']);
                }]);
                $query->with(['payment_mode', 'consultant']);
            },
            'consultation', 'treatedBy', 'creator',
        ]);

        if ($request->status) {
            $data->where('status', $request->status);
        }

        if ($request->consultation_id) {
            $data->where('consultation_id', $request->consultation_id);
        }

        if ($request->patient_id) {
            $data->whereHas('payment_cache_item.payment_cache.check_in', function ($query) use ($request) {
                $query->where('patient_id', $request->patient_id);
            });
        }

        if ($request->start_date) {
            $data->whereDate('treatment_date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $data->whereDate('treatment_date', '<=', $request->end_date);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function show($id)
    {
        $data = DentalTreatmentRecord::with([
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient' => function ($query2) {
                    $query2->with(['region', 'district', 'ward']);
                }]);
                $query->with(['payment_mode', 'consultant', 'server']);
            },
            'consultation', 'treatedBy', 'creator',
        ])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'payment_cache_item_id' => 'required|exists:patient_payment_cache_items,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'treatment_type' => 'nullable|string',
            'tooth_number' => 'nullable|integer',
            'tooth_surface' => 'nullable|string',
            'anaesthesia_type' => 'nullable|string',
            'preoperative_notes' => 'nullable|string',
            'intraoperative_notes' => 'nullable|string',
            'postoperative_notes' => 'nullable|string',
            'prescription' => 'nullable|string',
            'material_used' => 'nullable|string',
            'status' => 'nullable|string',
            'phase' => 'nullable|string',
            'treated_by' => 'nullable|exists:users,id',
            'treatment_date' => 'nullable|date_format:Y-m-d',
        ]);

        $data = DentalTreatmentRecord::where('payment_cache_item_id', $request->payment_cache_item_id)->first();
        if ($data) {
            $data->update($request->except('created_by'));
        } else {
            $input = $request->all();
            $input['created_by'] = $request->user()->id;
            $data = DentalTreatmentRecord::create($input);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = DentalTreatmentRecord::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        DentalTreatmentRecord::findOrFail($id)->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
