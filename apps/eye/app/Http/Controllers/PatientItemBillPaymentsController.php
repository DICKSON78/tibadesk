<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBillPayment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientItemBillPaymentsController extends Controller
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
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'sort_direction' => 'sometimes|in:asc,desc',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $bill_id = $request->bill_id;
        $payment_channel_id = $request->payment_channel_id;
        $with_patient = $request->with_patient;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $sort_direction = $request->sort_direction ?? 'asc';

        $data = PatientItemBillPayment::with(['channel', 'creator']);

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

        if ($bill_id) {
            $data->where('bill_id', $bill_id);
        }

        if ($payment_channel_id) {
            $data->where('channel_id', $payment_channel_id);
        }

        if ($with_patient == 'Yes') {
            $data->with(['bill.first_item'])->whereHas('bill.first_item');
        }

        if ($patient_name) {
            $data->whereHas('bill.items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('bill.items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('bill.items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('bill.items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', $sort_direction);
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'bill_id' => 'required|exists:patient_item_bills,id',
            'channel_id' => 'nullable|exists:payment_channels,id',
            'amount' => 'required|numeric|min:0',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = PatientItemBillPayment::create($input);

        // Auto-clear bill if fully paid
        $bill = $data->bill;
        $totalPaid = $bill->payments()->sum('amount');
        $amountDue = $bill->amount - $bill->discount;

        if ($totalPaid >= $amountDue && $bill->status === 'Pending') {
            $bill->update([
                'status' => 'Cleared',
                'cleared_at' => now(),
                'cleared_by' => $request->user()->id,
            ]);

            // Determine next department based on patient's treatment needs when bill is cleared
            if ($bill->first_item) {
                $patient = $bill->first_item->payment_cache->check_in->patient;
                $waitingTime = $patient->current_waiting_time;
                if ($waitingTime) {
                    $this->determineNextDepartment($waitingTime, $bill->first_item->payment_cache);
                }
            }
        }

        // Update bill's amount_paid
        $bill->update(['amount_paid' => $totalPaid]);

        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientItemBillPayment::with(['bill', 'channel', 'creator'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
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
            'bill_id' => 'sometimes|required|exists:patient_item_bills,id',
            'channel_id' => 'nullable|exists:payment_channels,id',
            'amount' => 'sometimes|required|numeric|min:0',
        ]);

        $data = PatientItemBillPayment::findOrFail($id);
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
        $data = PatientItemBillPayment::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }

    /**
     * Determine next department for a patient based on their treatment needs
     */
    private function determineNextDepartment($waitingTime, $paymentCache)
    {
        // Check if patient has consultation that requires glasses FIRST
        $consultation = $paymentCache->consultation;
        
        // Also check if patient has glass items that require optician attention
        $hasGlassItems = $paymentCache->items()
            ->whereHas('consultation_type', function($query) {
                $query->where('name', 'Glass');
            })
            ->count() > 0;
        
        if (($consultation && $consultation->require_glass === 'Yes') || $hasGlassItems) {
            // Patient needs glasses, send to optician (consultation department) FIRST
            $waitingTime->sendToConsultation();
            
            // If consultation exists, set sent_to_optician_at if not already set
            if ($consultation && !$consultation->sent_to_optician_at) {
                $consultation->update([
                    'sent_to_optician_at' => now(),
                    'sent_to_optician_by' => $consultation->creator_id ?? null,
                ]);
            }
            
            // If no consultation exists but patient has glass items, create one
            if (!$consultation && $hasGlassItems) {
                // Find the first glass item to create consultation
                $glassItem = $paymentCache->items()
                    ->whereHas('consultation_type', function($query) {
                        $query->where('name', 'Glass');
                    })
                    ->first();
                    
                if ($glassItem) {
                    // Create consultation record for glass items
                    \App\Models\Consultation::create([
                        'patient_id' => $waitingTime->patient_id,
                        'payment_cache_id' => $paymentCache->id,
                        'require_glass' => 'Yes',
                        'sent_to_optician_at' => now(),
                        'created_by' => auth()->id(),
                    ]);
                }
            }
        } else {
            // Patient doesn't need glasses, send to medicine department
            $waitingTime->sendToMedicine();
        }
    }
}
