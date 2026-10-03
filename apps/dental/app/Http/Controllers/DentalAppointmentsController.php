<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalAppointment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalAppointmentsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'date' => 'sometimes|date_format:Y-m-d',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'status' => 'sometimes|string',
            'patient_id' => 'sometimes|integer|exists:patients,id',
            'user_id' => 'sometimes|integer|exists:users,id',
        ]);

        $per_page = $request->per_page ?? 50;
        $data = DentalAppointment::with([
            'patient' => function ($query) {
                $query->with(['region', 'district', 'ward']);
            },
            'consultation', 'user', 'creator',
        ]);

        if ($request->date) {
            $data->whereDate('appointment_date', $request->date);
        }

        if ($request->start_date) {
            $data->whereDate('appointment_date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $data->whereDate('appointment_date', '<=', $request->end_date);
        }

        if ($request->status) {
            $data->where('status', $request->status);
        }

        if ($request->patient_id) {
            $data->where('patient_id', $request->patient_id);
        }

        if ($request->user_id) {
            $data->where('user_id', $request->user_id);
        }

        $data->orderBy('appointment_date');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function show($id)
    {
        $data = DentalAppointment::with([
            'patient', 'consultation', 'user', 'creator',
        ])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'user_id' => 'nullable|exists:users,id',
            'appointment_date' => 'required|date_format:Y-m-d H:i:s|after:now',
            'appointment_type' => 'required|string',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'chair_number' => 'nullable|string',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = DentalAppointment::create($input);

        return $this->sendResponse($data, Response::HTTP_OK, 'Appointment created successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = DentalAppointment::findOrFail($id);

        $request->validate([
            'appointment_date' => 'sometimes|date_format:Y-m-d H:i:s',
            'appointment_type' => 'sometimes|string',
            'status' => 'sometimes|string',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'chair_number' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Appointment updated successfully.');
    }

    public function markStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Scheduled,Confirmed,In Progress,Completed,Cancelled,No Show',
        ]);

        $data = DentalAppointment::findOrFail($id);
        $data->update(['status' => $request->status]);

        return $this->sendResponse($data, Response::HTTP_OK, 'Status updated successfully.');
    }

    public function getToday(Request $request)
    {
        $today = Carbon::now()->format('Y-m-d');
        $data = DentalAppointment::with([
            'patient', 'user', 'creator',
        ])->whereDate('appointment_date', $today)
          ->orderBy('appointment_date')
          ->get();

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function getByDateRange(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        $data = DentalAppointment::with([
            'patient', 'user', 'creator',
        ])->whereDate('appointment_date', '>=', $request->start_date)
          ->whereDate('appointment_date', '<=', $request->end_date)
          ->orderBy('appointment_date')
          ->get();

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        DentalAppointment::findOrFail($id)->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
