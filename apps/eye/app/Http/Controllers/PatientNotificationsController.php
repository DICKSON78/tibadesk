<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientNotification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientNotificationsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of patient notifications.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:unread,read,all',
            'type' => 'sometimes|string',
            'patient_id' => 'sometimes|exists:patients,id',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $status = $request->status ?? 'all';
        $type = $request->type;
        $patient_id = $request->patient_id;

        $query = PatientNotification::with(['patient']);

        // Filter by clinic if user is not admin
        if (!$user->is_admin) {
            $query->whereHas('patient.creator', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by type
        if ($type) {
            $query->where('type', $type);
        }

        // Filter by patient
        if ($patient_id) {
            $query->where('patient_id', $patient_id);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate($per_page);

        return $this->sendResponse($notifications, Response::HTTP_OK, 'Notifications retrieved successfully.');
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $query = PatientNotification::unread();

        // Filter by clinic if user is not admin
        if (!$user->is_admin) {
            $query->whereHas('patient.creator', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        $count = $query->count();

        return $this->sendResponse(['count' => $count], Response::HTTP_OK, 'Unread count retrieved successfully.');
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = PatientNotification::with('patient')->findOrFail($id);

        // Check if user has access to this notification
        if (!$user->is_admin) {
            $notification->load('patient.creator');
            if ($notification->patient->creator->clinic_id !== $user->clinic_id) {
                return $this->sendError('Unauthorized', Response::HTTP_FORBIDDEN);
            }
        }

        $notification->markAsRead();

        return $this->sendResponse($notification, Response::HTTP_OK, 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $query = PatientNotification::unread();

        // Filter by clinic if user is not admin
        if (!$user->is_admin) {
            $query->whereHas('patient.creator', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        $count = $query->count();
        $query->update([
            'status' => 'read',
            'read_at' => now(),
        ]);

        return $this->sendResponse(['marked_count' => $count], Response::HTTP_OK, 'All notifications marked as read.');
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $notification = PatientNotification::with('patient')->findOrFail($id);

        // Check if user has access to this notification
        if (!$user->is_admin) {
            $notification->load('patient.creator');
            if ($notification->patient->creator->clinic_id !== $user->clinic_id) {
                return $this->sendError('Unauthorized', Response::HTTP_FORBIDDEN);
            }
        }

        $notification->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Notification deleted successfully.');
    }

    /**
     * Create a new patient notification.
     */
    public static function createNotification($patientId, $type, $title, $message, $data = null)
    {
        return PatientNotification::create([
            'patient_id' => $patientId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'status' => 'unread',
        ]);
    }
}
