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
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        $data = PatientItemBillPayment::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }

    /**
     * Determine next department for a patient based on their treatment needs
     */
    private function determineNextDepartment($waitingTime, $paymentCache)
    {
        // Send patient to medicine department
        $waitingTime->sendToMedicine();
    }
}
