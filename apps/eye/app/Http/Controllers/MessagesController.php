<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MessagesController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $patient_name = $request->patient_name;
        $patient_phone = $request->patient_phone;
        $patient_id = $request->patient_id;
        $phone = $request->phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = Message::with(['patient']);

        if ($user->is_admin) {
            $data->with(['patient.creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('patient.creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('patient.creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($patient_name) {
            $data->whereHas('patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_phone) {
            $data->whereHas('patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($patient_id) {
            $data->where('patient_id', $patient_id);
        }

        if ($phone) {
            $data->where('phone', 'like', '%' . $phone . '%');
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
