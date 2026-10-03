<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DoctorTask;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DoctorTasksController extends Controller
{
    use ApiResponse;

    /**
     * Display doctors with their tasks and patients served
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'date_from' => 'sometimes|date_format:Y-m-d',
            'date_to' => 'sometimes|date_format:Y-m-d',
            'status' => 'sometimes|in:pending,in_progress,completed',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $dateFrom = $request->date_from ?? now()->subDays(7)->format('Y-m-d');
        $dateTo = $request->date_to ?? now()->format('Y-m-d');
        $status = $request->status;

        $query = User::doctors()->with([
            'doctor_tasks' => function ($q) use ($dateFrom, $dateTo, $status) {
                $q->with(['patient', 'assignedBy', 'consultation'])
                  ->whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59']);
                
                if ($status) {
                    $q->where('status', $status);
                }
                
                $q->orderBy('created_at', 'desc');
            }
        ]);

        if ($user && !$user->is_admin) {
            $query->where('clinic_id', $user->clinic_id);
        }

        try {
            $doctors = $query->paginate($per_page);

            // Add task statistics for each doctor
            $doctors->getCollection()->transform(function ($doctor) use ($dateFrom, $dateTo) {
                $tasks = $doctor->doctor_tasks;
                
                $doctor->task_statistics = [
                    'total_tasks' => $tasks->count(),
                    'pending_tasks' => $tasks->where('status', 'pending')->count(),
                    'in_progress_tasks' => $tasks->where('status', 'in_progress')->count(),
                    'completed_tasks' => $tasks->where('status', 'completed')->count(),
                    'patients_served' => $tasks->where('status', 'completed')->pluck('patient_id')->unique()->count(),
                    'average_completion_time' => $tasks->where('status', 'completed')->avg('duration'),
                ];

                return $doctor;
            });

            return $this->sendResponse($doctors, Response::HTTP_OK, 'Doctor tasks retrieved successfully.');
        } catch (\Throwable $e) {
            \Log::error('DoctorTasks index failed', ['error' => $e->getMessage()]);
            // Return empty paginated-like structure
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
            ], Response::HTTP_OK, 'Doctor tasks retrieved successfully.');
        }
    }

    /**
     * Get tasks for a specific doctor
     */
    public function doctorTasks(Request $request, $doctorId)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:pending,in_progress,completed',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $status = $request->status;

        $doctor = User::findOrFail($doctorId);

        if ($user && !$user->is_admin && $doctor->clinic_id !== $user->clinic_id) {
            return $this->sendError('Access denied.', [], Response::HTTP_FORBIDDEN);
        }

        $query = DoctorTask::with(['patient', 'assignedBy', 'consultation'])
                    ->where('doctor_id', $doctorId);

        if ($status) {
            $query->where('status', $status);
        }

        $query->orderBy('created_at', 'desc');
        $tasks = $query->paginate($per_page);

        return $this->sendResponse($tasks, Response::HTTP_OK, 'Doctor tasks retrieved successfully.');
    }

    /**
     * Store a newly created task
     */
    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'patient_id' => 'required|exists:patients,id',
            'task_type' => 'required|string',
            'treatment_details' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $input = $request->all();
        $input['assigned_by'] = $request->user()->id;
        $input['assigned_at'] = now();
        
        $task = DoctorTask::create($input);

        return $this->sendResponse($task->load(['patient', 'doctor', 'assignedBy']), Response::HTTP_CREATED, 'Task assigned successfully.');
    }

    /**
     * Start a task
     */
    public function startTask($id)
    {
        $task = DoctorTask::findOrFail($id);
        $task->startTask();

        return $this->sendResponse($task->load(['patient', 'doctor']), Response::HTTP_OK, 'Task started successfully.');
    }

    /**
     * Complete a task
     */
    public function completeTask(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $task = DoctorTask::findOrFail($id);
        $task->completeTask($request->notes);

        return $this->sendResponse($task->load(['patient', 'doctor']), Response::HTTP_OK, 'Task completed successfully.');
    }

    /**
     * Get task statistics
     */
    public function statistics(Request $request)
    {
        try {
            $user = $request->user();
            $dateFrom = $request->date_from ?? now()->subDays(30)->format('Y-m-d');
            $dateTo = $request->date_to ?? now()->format('Y-m-d');

            $query = DoctorTask::whereBetween('created_at', [$dateFrom, $dateTo . ' 23:59:59']);

            if ($user && !$user->is_admin) {
                $query->whereHas('doctor', function ($q) use ($user) {
                    $q->where('clinic_id', $user->clinic_id);
                });
            }

            $stats = [
                'total_tasks' => $query->count(),
                'pending_tasks' => (clone $query)->where('status', 'pending')->count(),
                'in_progress_tasks' => (clone $query)->where('status', 'in_progress')->count(),
                'completed_tasks' => (clone $query)->where('status', 'completed')->count(),
                'total_doctors' => (clone $query)->distinct()->count('doctor_id'),
                'total_patients_served' => (clone $query)->where('status', 'completed')->distinct()->count('patient_id'),
                'average_completion_time' => (clone $query)->where('status', 'completed')->get()->avg('duration'),
            ];

            return $this->sendResponse($stats, Response::HTTP_OK, 'Statistics retrieved successfully.');
        } catch (\Throwable $e) {
            \Log::error('DoctorTasks statistics failed', ['error' => $e->getMessage()]);
            return $this->sendResponse([
                'total_tasks' => 0,
                'pending_tasks' => 0,
                'in_progress_tasks' => 0,
                'completed_tasks' => 0,
                'total_doctors' => 0,
                'total_patients_served' => 0,
                'average_completion_time' => 0,
            ], Response::HTTP_OK, 'Statistics retrieved successfully.');
        }
    }
}