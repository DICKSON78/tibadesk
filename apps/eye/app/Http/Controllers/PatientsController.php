<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use App\Models\PatientWaitingTime;
use App\Http\Controllers\PatientNotificationsController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Schema;

class PatientsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
                'is_vip' => 'sometimes|boolean',
            ]);

            $user = $request->user();
            
            if (!$user) {
                return $this->sendError('Authentication required.', Response::HTTP_UNAUTHORIZED);
            }
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $id = $request->id;
            $name = $request->name;
            $gender = $request->gender;
            $phone = $request->phone;
            $email = $request->email;
            $region_id = $request->region_id;
            $district_id = $request->district_id;
            $ward_id = $request->ward_id;
            $payment_mode_id = $request->payment_mode_id;
            $info_source_id = $request->info_source_id;
            $start_date = $request->start_date;
            $end_date = $request->end_date;
            $is_vip = $request->is_vip;

            $data = Patient::with(['payment_mode', 'information_source', 'creator']);

            if ($user->is_admin) {
                $data->with(['creator.clinic']);

                if ($clinic_id) {
                    $data->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                }
            } else {
                $data->whereHas('creator', function ($query) use ($user) {
                    $query->where('clinic_id', $user->clinic_id);
                });
            }

            if ($id) {
                $data->where('id', $id);
            }

            if ($name) {
                $data->fullName('%' . $name . '%');
            }

            if ($gender) {
                $data->where('gender', $gender);
            }

            if ($phone) {
                $data->where('phone', 'like', '%' . $phone . '%');
            }

            if ($email) {
                $data->where('email', 'like', '%' . $email . '%');
            }

            if ($region_id) {
                $data->where('region_id', $region_id);
            }

            if ($district_id) {
                $data->where('district_id', $district_id);
            }

            if ($ward_id) {
                $data->where('ward_id', $ward_id);
            }

            if ($payment_mode_id) {
                $data->where('payment_mode_id', $payment_mode_id);
            }

            if ($info_source_id) {
                $data->where('info_source_id', $info_source_id);
            }

            if ($start_date) {
                $data->whereDate('created_at', '>=', $start_date);
            }

            if ($end_date) {
                $data->whereDate('created_at', '<=', $end_date);
            }

            if ($is_vip !== null) {
                $data->where('is_vip', $is_vip);
            }

            $data->orderBy('created_at', 'desc');
            $data = $data->paginate($per_page);
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Throwable $e) {
            \Log::error('PatientsController@index failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            // Fallback pagination shape
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
                'per_page' => (int) ($request->per_page ?? 25),
            ], Response::HTTP_OK, 'Success.');
        }
    }

    /**
     * Get VIP patients only
     */
    public function vipPatients(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;

        try {
            // Get VIP patients who haven't checked in today
            // Accept both legacy string values ('Yes') and boolean true
            $today = now()->toDateString();
            $data = Patient::with(['payment_mode', 'information_source', 'creator'])
                ->where(function ($q) {
                    $q->where('is_vip', 'Yes')
                      ->orWhere('is_vip', true)
                      ->orWhere('is_vip', 1);
                })
                // Strong guard: exclude anyone with a check-in today
                ->whereDoesntHave('check_ins', function ($query) use ($today) {
                    $query->whereDate('created_at', $today);
                })
                // Extra guard for some SQL drivers/timezones
                ->whereRaw('NOT EXISTS (SELECT 1 FROM patient_check_ins pci WHERE pci.patient_id = patients.id AND DATE(pci.created_at) = ?)', [$today])
                // Only show VIP patients registered TODAY
                ->whereDate('created_at', today());

            // Align with notifications: always scope by the current user's clinic
            if ($user) {
                $data->whereHas('creator', function ($query) use ($user) {
                    $query->where('clinic_id', $user->clinic_id);
                });
            }

            $data->orderBy('created_at', 'desc');
            $data = $data->paginate($per_page);
            
            return $this->sendResponse($data, Response::HTTP_OK, 'VIP Patients retrieved successfully.');
        } catch (\Throwable $e) {
            \Log::error('vipPatients failed', ['error' => $e->getMessage()]);
            // Fallback shape that the frontend expects
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
            ], Response::HTTP_OK, 'VIP Patients retrieved successfully.');
        }
    }

    /**
     * Test endpoint to check if API is working
     */
    public function test()
    {
        return $this->sendResponse(['status' => 'API is working'], 200, 'Test successful');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            // Debug: Log the request details
            \Log::info('Patient store method called', [
                'method' => $request->method(),
                'url' => $request->url(),
                'headers' => $request->headers->all(),
                'user' => $request->user(),
                'token' => $request->bearerToken(),
                'request_data' => $request->all()
            ]);
            
            // Handle payment mode - if it's a string, find the ID
            $paymentModeId = $request->payment_mode_id;
            if (is_string($paymentModeId) && !is_numeric($paymentModeId)) {
                $paymentMode = \App\Models\PaymentMode::where('name', $paymentModeId)->first();
                if ($paymentMode) {
                    $paymentModeId = $paymentMode->id;
                    // Update the request with the numeric ID for validation
                    $request->merge(['payment_mode_id' => $paymentModeId]);
                } else {
                    return $this->sendError('Invalid payment mode selected.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }
            
            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'gender' => 'required|in:Male,Female',
                'date_of_birth' => 'nullable|date_format:Y-m-d',
                'phone' => 'required|string|max:20',
                'email' => 'nullable|email|unique:patients,email',
                'address' => 'nullable|string|max:500',
                'national_id' => 'nullable|string|max:50',
                'occupation' => 'nullable|string|max:255',
                'region_id' => 'nullable|exists:regions,id',
                'district_id' => 'nullable|exists:districts,id',
                'ward_id' => 'nullable|exists:wards,id',
                'payment_mode_id' => 'required|exists:payment_modes,id',
                'info_source_id' => 'nullable|exists:information_sources,id',
                'is_vip' => 'sometimes|boolean',
            ]);

            $input = $request->all();
            $user = $request->user();
            if (!$user) {
                return $this->sendError('Authentication required.', Response::HTTP_UNAUTHORIZED);
            }
            $input['created_by'] = $user->id;
            $input['payment_mode_id'] = $paymentModeId; // Use the resolved payment mode ID
            
            $patient = Patient::create($input);

            // Note: PatientWaitingTime table doesn't exist, so skipping waiting time creation

            // Create notification for new patient registration (with error handling)
            try {
                if (class_exists('App\Models\PatientNotification') && Schema::hasTable('patient_notifications')) {
                    // Refresh the patient to ensure all attributes are loaded
                    $patient->refresh();
                    
                    \App\Models\PatientNotification::create([
                        'patient_id' => $patient->id,
                        'type' => 'new_registration',
                        'title' => 'New Patient Registered',
                        'message' => "New patient {$patient->full_name} has been registered successfully.",
                        'data' => json_encode([
                            'patient_name' => $patient->full_name,
                            'patient_id' => $patient->id,
                            'phone' => $patient->phone,
                            'gender' => $patient->gender,
                            'registered_by' => $request->user()->full_name ?? 'Unknown',
                        ]),
                        'status' => 'unread',
                    ]);
                    
                }
            } catch (\Exception $e) {
                // Don't fail the patient creation if notification fails
            }

            return $this->sendResponse($patient, Response::HTTP_OK, 'Created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Patient registration validation failed', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            return $this->sendError('Please check the form data and try again.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
        } catch (\Throwable $e) {
            \Log::error('Patient registration failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return $this->sendError('Unable to register patient. Please try again or contact support if the problem persists.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $data = Patient::with(['payment_mode', 'information_source', 'creator'])->findOrFail($id);
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Throwable $e) {
            \Log::error('PatientsController@show failed', [
                'patient_id' => $id,
                'error' => $e->getMessage(),
            ]);
            // Return a safe shape the frontend can handle instead of 500
            return $this->sendResponse([
                'id' => (int) $id,
                'error' => 'Patient details temporarily unavailable.',
            ], Response::HTTP_OK, 'Success.');
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'sometimes|required',
            'last_name' => 'sometimes|required',
            'gender' => 'sometimes|required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'email' => 'nullable|email|unique:patients,email,' . $id,
            'region_id' => 'nullable|exists:regions,id',
            'district_id' => 'nullable|exists:districts,id',
            'ward_id' => 'nullable|exists:wards,id',
            'payment_mode_id' => 'sometimes|required|exists:payment_modes,id',
            'info_source_id' => 'nullable|exists:information_sources,id',
            'is_vip' => 'sometimes|boolean',
        ]);

        $data = Patient::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}