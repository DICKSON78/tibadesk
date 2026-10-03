<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AdminAppointmentsController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('full_name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('service', 'like', "%{$s}%");
            });
        }

        $perPage = $request->per_page ?? 25;
        $appointments = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ]);
    }

    public function show($id)
    {
        $appointment = Appointment::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $appointment,
        ]);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,cancelled',
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'sometimes|nullable|email|max:255',
            'preferred_date' => 'sometimes|nullable|date',
            'preferred_time' => 'sometimes|nullable|string',
            'service' => 'sometimes|nullable|string|max:255',
            'message' => 'sometimes|nullable|string',
        ]);

        $appointment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Appointment updated successfully',
            'data' => $appointment,
        ]);
    }

    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment deleted successfully',
        ]);
    }
}
