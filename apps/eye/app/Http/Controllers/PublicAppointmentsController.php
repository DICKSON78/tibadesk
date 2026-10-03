<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PublicAppointmentsController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'preferred_date' => 'nullable|date',
            'preferred_time' => 'nullable|string|max:10',
            'service' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:2000',
        ]);

        $data = Appointment::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Appointment request submitted successfully. We will contact you soon.',
            'data' => $data,
        ], Response::HTTP_CREATED);
    }
}
