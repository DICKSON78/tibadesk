<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\PaymentMode;
use App\Models\ItemPrice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ItemsController extends Controller
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
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $status = $request->status;
            $q = $request->q;
            $item_type_id = $request->item_type_id;
            $item_type = $request->item_type;
            $lens_type_id = $request->lens_type_id;
            $consultation_type_id = $request->consultation_type_id;
            $consultation_type = $request->consultation_type;
            $is_consultation_item = $request->is_consultation_item;
            $is_stock_item = $request->is_stock_item;
            $include_all_stock = $request->include_all_stock;
            $payment_mode_id = $request->payment_mode_id;
            $date = $request->date;
            $end_date = $request->end_date;

            $data = Item::with(['item_type', 'consultation_type', 'unit_of_measure', 'lens_type', 'prices'])
                ->withCount(['dispensations as dispensed_count' => function ($query) use ($date, $end_date, $include_all_stock) {
                    if ($include_all_stock === 'Yes') {
                        // Show all-time dispensations for stock management pages
                    } elseif ($date && $end_date) {
                        $query->whereBetween('created_at', [$date, $end_date]);
                    } elseif ($date) {
                        $query->whereDate('created_at', $date);
                    } else {
                        $query->whereDate('created_at', now()->toDateString());
                    }
                }]);

            if ($user->is_admin) {
                $data->with(['clinic']);

                if ($clinic_id) {
                    $data->where('clinic_id', $clinic_id);
                }
            } else {
                $data->where('clinic_id', $user->clinic_id);
            }

            if ($status) {
                $data->where('status', $status);
            }

            if ($q) {
                $data->where(function ($query) use ($q) {
                    $query->where('name', 'like', '%' . $q . '%');
                    $query->orWhere('code', 'like', '%' . $q . '%');
                });
            }

            if ($item_type_id) {
                $data->where('item_type_id', $item_type_id);
            }

            if ($item_type) {
                $data->whereHas('item_type', function ($query) use ($item_type) {
                    $query->where('name', $item_type);
                });
                
                // Note: has_expiry and expiry_date columns don't exist in items table
                // Removed expiry filtering for now
            }

            if ($lens_type_id) {
                $data->where('lens_type_id', $lens_type_id);
            }

            if ($consultation_type_id) {
                $data->where('consultation_type_id', $consultation_type_id);
            }

            if ($consultation_type) {
                $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                    $query->where('name', $consultation_type);
                });
                
                // Note: has_expiry and expiry_date columns don't exist in items table
                // Removed expiry filtering for now
            }

            if ($is_consultation_item) {
                $data->where('is_consultation_item', $is_consultation_item);
            }

            if ($is_stock_item) {
                $data->where('is_stock_item', $is_stock_item);
                
                // Note: has_expiry and expiry_date columns don't exist in items table
                // Removed expiry filtering for now
            }

            if ($request->stock_status) {
                $stockStatus = $request->stock_status;
                if ($stockStatus === 'Out of Stock') {
                    $data->where('balance', '<=', 0);
                } elseif ($stockStatus === 'Low Stock') {
                    $data->where('balance', '>', 0)->where('balance', '<=', 5);
                } elseif ($stockStatus === 'In Stock') {
                    $data->where('balance', '>', 0);
                }
            }

            if ($payment_mode_id) {
                $data->with(['prices' => function ($query) use ($payment_mode_id) {
                    $query->where('payment_mode_id', $payment_mode_id);
                }])->whereHas('prices', function ($query) use ($payment_mode_id) {
                    $query->where('payment_mode_id', $payment_mode_id);
                });
            } else {
                $data->with(['prices']);
            }

            $data = $data->paginate($per_page);
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Throwable $e) {
            \Log::error('ItemsController@index failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
                'per_page' => (int) ($request->per_page ?? 25),
            ], Response::HTTP_OK, 'Success.');
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->is_admin) {
            $request->validate([
                'clinic_id' => 'required|exists:clinics,id',
            ]);

            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $request->validate([
            'name' => 'required',
            'code' => 'nullable|unique:items,code',
            'item_type_id' => 'required|exists:item_types,id',
            'consultation_type_id' => 'required|exists:consultation_types,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'lens_type_id' => 'nullable|exists:lens_types,id',
            'is_consultation_item' => 'required|in:Yes,No',
            'is_stock_item' => 'required|in:Yes,No',
            'balance' => 'nullable|numeric|min:0',
            'new_balance' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'expiration_date' => 'nullable|date',
        ]);

        $input = $request->only(
            'name',
            'code',
            'item_type_id',
            'consultation_type_id',
            'unit_of_measure_id',
            'lens_type_id',
            'is_consultation_item',
            'is_stock_item',
            'balance',
            'new_balance',
            'templates',
            'expiration_date',
        );
        // Map expiration_date to DB column name expiry_date
        if (isset($input['expiration_date'])) {
            $input['expiry_date'] = $input['expiration_date'];
            unset($input['expiration_date']);
            $input['has_expiry'] = 'Yes';
        }

        $input['clinic_id'] = $clinic_id;
        $data = Item::create($input);

        // If selling_price provided, create default prices for all payment modes if none exist
        if ($data && $request->filled('selling_price')) {
            $sellingPrice = $request->selling_price;
            $paymentModes = PaymentMode::select('id')->get();
            foreach ($paymentModes as $mode) {
                $exists = ItemPrice::where('item_id', $data->id)
                    ->where('payment_mode_id', $mode->id)
                    ->first();
                if (!$exists) {
                    ItemPrice::create([
                        'item_id' => $data->id,
                        'payment_mode_id' => $mode->id,
                        'unit_price' => $sellingPrice,
                    ]);
                }
            }
        }
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
        $data = Item::with(['item_type', 'consultation_type', 'unit_of_measure', 'lens_type', 'prices'])->findOrFail($id);
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
            'name' => 'sometimes|required',
            'code' => 'nullable|unique:items,code,' . $id,
            'item_type_id' => 'sometimes|required|exists:item_types,id',
            'consultation_type_id' => 'sometimes|required|exists:consultation_types,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'lens_type_id' => 'nullable|exists:lens_types,id',
            'is_consultation_item' => 'sometimes|required|in:Yes,No',
            'is_stock_item' => 'sometimes|required|in:Yes,No',
            'balance' => 'nullable|numeric|min:0',
            'new_balance' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $data = Item::findOrFail($id);
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
        $data = Item::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
