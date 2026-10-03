<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalLabOrder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalLabOrdersController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'nullable|string',
            'consultation_id' => 'sometimes|exists:consultations,id',
        ]);

        $per_page = $request->per_page ?? 25;
        $data = DentalLabOrder::with([
            'consultation', 'orderedBy', 'creator',
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient']);
            },
            'consultation.payment_cache_item.payment_cache.check_in.patient',
        ]);

        if ($request->status) {
            $data->where('status', $request->status);
        }

        if ($request->consultation_id) {
            $data->where('consultation_id', $request->consultation_id);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function show($id)
    {
        $data = DentalLabOrder::with([
            'consultation', 'orderedBy', 'creator',
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient']);
            },
            'consultation.payment_cache_item.payment_cache.check_in.patient',
        ])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'order_type' => 'required|string',
            'description' => 'nullable|string',
            'material' => 'nullable|string',
            'shade' => 'nullable|string',
            'tooth_number' => 'nullable|integer',
            'teeth_involved' => 'nullable|array',
            'impression_date' => 'nullable|date_format:Y-m-d',
            'delivery_date' => 'nullable|date_format:Y-m-d',
            'lab_notes' => 'nullable|string',
            'lab_name' => 'nullable|string',
            'cost' => 'nullable|numeric',
            'technician_charges' => 'nullable|numeric',
        ]);

        $input = $request->all();
        $input['ordered_by'] = $request->user()->id;
        $input['created_by'] = $request->user()->id;
        $data = DentalLabOrder::create($input);

        return $this->sendResponse($data, Response::HTTP_OK, 'Order created successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = DentalLabOrder::findOrFail($id);

        $request->validate([
            'consultation_id' => 'sometimes|exists:consultations,id',
            'order_type' => 'sometimes|string',
            'description' => 'nullable|string',
            'material' => 'nullable|string',
            'shade' => 'nullable|string',
            'tooth_number' => 'nullable|integer',
            'teeth_involved' => 'nullable|array',
            'impression_date' => 'nullable|date_format:Y-m-d',
            'delivery_date' => 'nullable|date_format:Y-m-d',
            'insertion_date' => 'nullable|date_format:Y-m-d',
            'lab_notes' => 'nullable|string',
            'lab_name' => 'nullable|string',
            'cost' => 'nullable|numeric',
            'technician_charges' => 'nullable|numeric',
            'status' => 'nullable|string|in:Ordered,In Progress,Ready,Delivered',
        ]);

        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    public function markReady($id)
    {
        $data = DentalLabOrder::findOrFail($id);
        $data->update([
            'status' => 'Ready',
            'delivery_date' => now()->format('Y-m-d'),
        ]);
        return $this->sendResponse($data, Response::HTTP_OK, 'Marked as ready for delivery.');
    }

    public function markDelivered($id)
    {
        $data = DentalLabOrder::findOrFail($id);
        $wasDelivered = $data->status === 'Delivered';
        $data->update([
            'status' => 'Delivered',
        ]);

        if ($wasDelivered) {
            return $this->sendResponse($data, Response::HTTP_OK, 'Already delivered.');
        }

        // Return the patient to the doctor so they can continue the visit
        try {
            $consultation = $data->consultation;
            if ($consultation) {
                if ($consultation->status !== 'Pending') {
                    $consultation->update([
                        'status' => 'Pending',
                        'returned_from' => 'dental_lab',
                    ]);
                } else {
                    $consultation->update(['returned_from' => 'dental_lab']);
                }

                $patient = $consultation->payment_cache_item?->payment_cache?->check_in?->patient;
                if ($patient) {
                    $waitingTime = $patient->waiting_times()
                        ->whereDate('registration_time', $consultation->created_at->format('Y-m-d'))
                        ->whereIn('status', ['waiting', 'in_treatment'])
                        ->latest()
                        ->first();

                    if ($waitingTime) {
                        $waitingTime->moveToDepartment('consultation', 'Patient returned from dental lab');
                    }
                }

                \Log::info('Lab order delivered - patient returned to doctor', [
                    'lab_order_id' => $data->id,
                    'consultation_id' => $consultation->id,
                    'patient_id' => $patient->id ?? null,
                    'patient_name' => $patient?->full_name ?? 'Unknown',
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to return patient to doctor after lab delivery', [
                'lab_order_id' => $data->id,
                'error' => $e->getMessage(),
                'exception_type' => get_class($e),
            ]);
        }

        // Trigger notification refresh for the doctor's pending badge
        try {
            event(new \App\Events\NotificationUpdate());
        } catch (\Exception $e) {
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Marked as delivered. Patient returned to doctor.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        DentalLabOrder::findOrFail($id)->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
