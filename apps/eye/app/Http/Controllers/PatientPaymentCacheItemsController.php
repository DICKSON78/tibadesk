<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Collaborator;
use App\Models\Consultation;
use App\Models\PatientItemBill;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientPaymentCacheItemsController extends Controller
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
        $status = $request->status;
        $q = $request->q;
        $payment_cache_id = $request->payment_cache_id;
        $payment_mode_id = $request->payment_mode_id;
        $transaction_type = $request->transaction_type;
        $consultation_type = $request->consultation_type;
        $is_stock_item = $request->is_stock_item;
        $consultant_id = $request->consultant_id;
        $consultation_id = $request->consultation_id;
        $bill_id = $request->bill_id;
        $with_patient = $request->with_patient;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $sort_direction = $request->sort_direction ?? 'asc';

        $data = PatientPaymentCacheItem::with([
            'item' => function($query) {
                $query->select('id', 'name', 'code', 'templates', 'unit_of_measure_id', 'consultation_type_id', 'is_consultation_item', 'is_stock_item', 'balance', 'unit_buying_price', 'status');
            },
            'item.unit_of_measure',
            'item.item_type',
            'consultation_type', 
            'payment_mode', 
            'creator', 
            'server'
        ]);

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

        if ($status) {
            $statuses = explode(',', $status);
            if (count($statuses) > 1) {
                $data->whereIn('status', $statuses);
            } else {
                $data->where('status', $statuses[0]);
            }
        }

        if ($q) {
            $data->whereHas('item', function ($query) use ($q) {
                $query->where('name', 'like', '%' . $q . '%');
                $query->orWhere('code', 'like', '%' . $q . '%');
            });
        }

        if ($payment_cache_id) {
            $data->where('payment_cache_id', $payment_cache_id);
        }

        if ($payment_mode_id) {
            $data->where('payment_mode_id', $payment_mode_id);
        }

        if ($transaction_type) {
            $data->whereHas('payment_mode', function ($query) use ($transaction_type) {
                $query->where('transaction_type', $transaction_type);
            });
        }

        if ($consultation_type) {
            $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                $query->where('name', $consultation_type);
            });
        }

        if ($is_stock_item) {
            $data->whereHas('item', function ($query) use ($is_stock_item) {
                $query->where('is_stock_item', $is_stock_item);
            });
        }

        if ($consultant_id) {
            $data->where('consultant_id', $consultant_id);
        }

        if ($consultation_id) {
            $data->whereHas('payment_cache', function ($query) use ($consultation_id) {
                $query->where('consultation_id', $consultation_id);
            });
        }

        if ($bill_id) {
            $data->where('bill_id', $bill_id);
        }

        if ($with_patient == 'Yes') {
            $data->with(['payment_cache.check_in.patient']);
        }

        if ($patient_name) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($start_date) {
            if ($status) {
                $statuses = explode(',', $status);
                if (in_array('Served', $statuses)) {
                    $data->whereDate('served_at', '>=', $start_date);
                } else {
                    $data->whereDate('created_at', '>=', $start_date);
                }
            } else {
                $data->whereDate('created_at', '>=', $start_date);
            }
        }

        if ($end_date) {
            if ($status) {
                $statuses = explode(',', $status);
                if (in_array('Served', $statuses)) {
                    $data->whereDate('served_at', '<=', $end_date);
                } else {
                    $data->whereDate('created_at', '<=', $end_date);
                }
            } else {
                $data->whereDate('created_at', '<=', $end_date);
            }
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
        //
    }

    public function makeCashPayment(Request $request)
    {
        $request->validate([
            'payment_channel_id' => 'required|exists:payment_channels,id',
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
            'discount' => 'nullable|numeric|min:0',
            'partner_items' => 'nullable|array',
            'partner_items.*.is_partner_item' => 'sometimes|boolean',
            'partner_items.*.collaborator_name' => 'sometimes|string|nullable',
            'partner_items.*.collaborator_id' => 'sometimes|integer|nullable|exists:collaborators,id',
        ]);

        $user = $request->user();
        $amount = 0;
        $partnerItems = $request->json('partner_items') ?? [];

        $payment = PatientItemPayment::create([
            'channel_id' => $request->payment_channel_id,
            'amount' => 0,
            'discount' => $request->discount ?? 0,
            'created_by' => $user->id,
        ]);

        if ($payment) {
            $items = $request->json('items');

            foreach ($items as &$request_item) {
                $item = PatientPaymentCacheItem::find($request_item);

                if ($item) {
                    $amount += ($item->unit_price * $item->quantity);

                    $item->item_payment_id = $payment->id;
                    $item->status = 'Paid';

                    if (isset($partnerItems[$request_item]) && !empty($partnerItems[$request_item]['is_partner_item'])) {
                        $item->is_partner_item = true;
                        $collabName = $partnerItems[$request_item]['collaborator_name'] ?? null;
                        $collabId = $partnerItems[$request_item]['collaborator_id'] ?? null;
                        if (!$collabName && $collabId) {
                            $collabName = Collaborator::find($collabId)?->name;
                        }
                        $item->collaborator_name = $collabName;
                    }

                    $item->save();

                    // if item was not created from consultation, i.e. on check-in, create consultation
                    if (!$item->payment_cache->consultation_id) {
                        if ($item->item->is_consultation_item == 'Yes') {
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'created_by' => $user->id,
                            ]);
                            
                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                        } else {
                            if ($item->item->consultation_type->name == 'Glass' && $item->item->item_type->name == 'Lens') {
                                $consultation = Consultation::create([
                                    'payment_cache_item_id' => $item->id,
                                    'patient_direction' => 'Direct to Optician',
                                    'created_by' => $user->id,
                                    'require_glass' => 'Yes',
                                    'sent_to_optician_at' => now(),
                                    'sent_to_optician_by' => $user->id,
                                ]);

                                $item->payment_cache->consultation_id = $consultation->id;
                                $item->payment_cache->save();
                            }
                        }
                    } else {
                        // Consultation already exists - set sent_to_optician for glass items
                        $consultation = Consultation::find($item->payment_cache->consultation_id);
                        if ($consultation && $consultation->require_glass === 'Yes' && !$consultation->sent_to_optician_at) {
                            $consultation->update([
                                'sent_to_optician_at' => now(),
                                'sent_to_optician_by' => $user->id,
                            ]);
                        }
                    }
                }
            }

            $payment->amount = $amount;
            $payment->save();

            $payment->items = PatientPaymentCacheItem::with(['item.unit_of_measure'])
                ->where('item_payment_id', $payment->id)
                ->get();

            // Trigger notification refresh for real-time updates
            try {
                event(new \App\Events\NotificationUpdate());
                \Log::info('Payment completed - notification refresh triggered', [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to trigger notification refresh after payment', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage()
                ]);
            }

            return $this->sendResponse($payment, Response::HTTP_OK, 'Payment made successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Payment could not be made.'
        );
    }

    public function approveCreditPayment(Request $request)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
        ]);

        $user = $request->user();
        $amount = 0;
        $items = $request->json('items');

        foreach ($items as &$request_item) {
            $item = PatientPaymentCacheItem::find($request_item);

            if ($item) {
                $amount += ($item->unit_price * $item->quantity);

                $item->status = 'Paid';
                $item->save();

                // if item was not created from consultation, i.e. on check-in, create consultation
                if (!$item->payment_cache->consultation_id) {
                    if ($item->item->is_consultation_item == 'Yes') {
                        Consultation::create([
                            'payment_cache_item_id' => $item->id,
                            'created_by' => $user->id,
                        ]);
                    } else {
                        if ($item->item->consultation_type->name == 'Glass' && $item->item->item_type->name == 'Lens') {
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'patient_direction' => 'Direct to Optician',
                                'created_by' => $user->id,
                                'require_glass' => 'Yes',
                                'sent_to_optician_at' => now(),
                                'sent_to_optician_by' => $user->id,
                            ]);

                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                        }
                    }
                } else {
                    // Consultation already exists - set sent_to_optician for glass items
                    $consultation = Consultation::find($item->payment_cache->consultation_id);
                    if ($consultation && $consultation->require_glass === 'Yes' && !$consultation->sent_to_optician_at) {
                        $consultation->update([
                            'sent_to_optician_at' => now(),
                            'sent_to_optician_by' => $user->id,
                        ]);
                    }
                }
            }
        }

        // Trigger notification refresh for real-time updates
        try {
            event(new \App\Events\NotificationUpdate());
            \Log::info('Credit payment approved - notification refresh triggered', [
                'items_count' => count($items)
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to trigger notification refresh after credit payment approval', [
                'error' => $e->getMessage()
            ]);
        }

        return $this->sendResponse($items, Response::HTTP_OK, 'Approved successfully.');
    }

    public function createBill(Request $request)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        $amount = 0;

        $bill = PatientItemBill::create([
            'amount' => 0,
            'discount' => $request->discount ?? 0,
            'created_by' => $user->id,
        ]);

        if ($bill) {
            $items = $request->json('items');

            foreach ($items as &$request_item) {
                $item = PatientPaymentCacheItem::find($request_item);

                if ($item) {
                    $amount += ($item->unit_price * $item->quantity);

                    $item->bill_id = $bill->id;
                    $item->status = 'Billed';
                    $item->save();

                    // if item was not created from consultation, i.e. on check-in, create consultation
                    if (!$item->payment_cache->consultation_id) {
                        if ($item->item->is_consultation_item == 'Yes') {
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'created_by' => $user->id,
                            ]);
                            
                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                        } else {
                            if ($item->item->consultation_type->name == 'Glass' && $item->item->item_type->name == 'Lens') {
                                $consultation = Consultation::create([
                                    'payment_cache_item_id' => $item->id,
                                    'patient_direction' => 'Direct to Optician',
                                    'created_by' => $user->id,
                                    'require_glass' => 'Yes',
                                    'sent_to_optician_at' => now(),
                                    'sent_to_optician_by' => $user->id,
                                ]);

                                $item->payment_cache->consultation_id = $consultation->id;
                                $item->payment_cache->save();
                            }
                        }
                    } else {
                        // Consultation already exists - set sent_to_optician for glass items
                        $consultation = Consultation::find($item->payment_cache->consultation_id);
                        if ($consultation && $consultation->require_glass === 'Yes' && !$consultation->sent_to_optician_at) {
                            $consultation->update([
                                'sent_to_optician_at' => now(),
                                'sent_to_optician_by' => $user->id,
                            ]);
                        }
                    }
                }
            }

            $bill->amount = $amount;
            $bill->save();

            return $this->sendResponse($bill, Response::HTTP_OK, 'Bill created successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Bill could not be created.'
        );
    }

    private function updateStatus(Request $request, $status, $message, $callback)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
        ]);

        $payment_cache = PatientPaymentCache::find($request->payment_cache_id);
        $data = [];
        $user = $request->user();
        $items = $request->json('items');

        foreach ($items as &$request_item) {
            $item = PatientPaymentCacheItem::find($request_item);

            if ($item) {
                $item->status = $status;

                if ($status == 'Served') {
                    $item->served_by = $user->id;
                    $item->served_at = Carbon::now();

                    if ($item->item && $item->item->is_stock_item === 'Yes') {
                        $item->item->decrement('balance', $item->quantity);
                    }
                }

                $item->save();
                $data[] = $item;
            }
        }

        if ($callback) {
            $callback($payment_cache);
        }

        return $this->sendResponse($data, Response::HTTP_OK, $message);
    }

    public function dispense(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Dispensed successfully.', function ($payment_cache) use ($request) {
            $user = $request->user();

            // check if dispensing a glass item and change its consultation status
            $consultation = $payment_cache->consultation;
            if ($consultation && $consultation->patient_direction == 'Direct to Optician') {
                $consultation->update(['status' => 'Consulted']);

                // update consultant
                $consultation->payment_cache_item->consultant_id = $user->id;
                $consultation->payment_cache_item->save();
            }
        });
    }

    public function complete(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Completed successfully.', null);
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientPaymentCacheItem::with([
            'payment_cache.check_in.patient',
            'item.unit_of_measure',
            'consultation_type',
            'payment_mode',
            'creator',
        ])
            ->findOrFail($id);
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
        $data = PatientPaymentCacheItem::findOrFail($id);
        $data->update($request->only('comments', 'dosage'));
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
        $data = PatientPaymentCacheItem::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
