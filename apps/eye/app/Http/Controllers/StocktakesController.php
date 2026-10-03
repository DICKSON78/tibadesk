<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\Stocktake;
use App\Models\StocktakeItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StocktakesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request)
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
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Stocktake::with(['creator']);

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

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
   public function store(Request $request)
{
    try {
        $request->validate([
            'reason' => 'required',
            'items' => 'required|array',
            'items.*.item_id' => 'required|integer',
            'items.*.item_source' => 'nullable|in:item,medicine',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_buying_price' => 'nullable|numeric|min:0',
            'items.*.selling_price' => 'nullable|numeric|min:0',
            'items.*.expiration_date' => 'nullable|date',
        ]);

        $user = $request->user();
        $input = $request->only('reason');
        $input['created_by'] = $user->id;
        $data = Stocktake::create($input);

        if ($data) {
            $input_items = $request->json('items');

            foreach ($input_items as &$input_item) {
                $source = $input_item['item_source'] ?? 'item';

                if ($source === 'medicine') {
                    // Update medicine balance
                    $medicine = \App\Models\Medicine::where('id', $input_item['item_id'])
                        ->where('status', 'Active')
                        ->first();

                    if ($medicine) {
                        $input_item['stocktake_id'] = $data->id;
                        $stocktake_item = StocktakeItem::create([
                            'stocktake_id' => $data->id,
                            'item_id' => $input_item['item_id'],
                            'quantity' => $input_item['quantity'],
                            'unit_buying_price' => $input_item['unit_buying_price'] ?? null,
                            'selling_price' => $input_item['selling_price'] ?? null,
                            'expiration_date' => $input_item['expiration_date'] ?? null,
                        ]);

                        if ($stocktake_item) {
                            $medicine->update([
                                'balance' => $input_item['quantity'],
                                'unit_buying_price' => $input_item['unit_buying_price'] ?? $medicine->unit_buying_price,
                                'selling_price' => $input_item['selling_price'] ?? $medicine->selling_price,
                                'expiry_date' => $input_item['expiration_date'] ?? $medicine->expiry_date,
                            ]);
                        }
                    }
                } else {
                    // Regular item (Lens, Frame, etc.)
                    $item = Item::where('id', $input_item['item_id'])
                        ->where('is_stock_item', 'Yes')
                        ->first();

                    if ($item) {
                        $input_item['stocktake_id'] = $data->id;
                        $stocktake_item = StocktakeItem::create($input_item);

                        if ($stocktake_item) {
                            $item->update([
                                'balance' => $stocktake_item->quantity,
                                'unit_buying_price' => $stocktake_item->unit_buying_price,
                            ]);
                        }
                    }
                }
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    } catch (\Exception $e) {
        \Log::error('Stocktake creation error: ' . $e->getMessage());
        return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error creating stocktake: ' . $e->getMessage());
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
        $data = Stocktake::with(['items.item', 'creator'])->findOrFail($id);
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
        //
    }

    /**
     * Apply a stocktake (move new_balance to balance for all items)
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function apply($id)
    {
        try {
            $stocktake = Stocktake::with(['items.item'])->findOrFail($id);
            
            if ($stocktake->status === 'Applied') {
                return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Stocktake has already been applied.');
            }

            foreach ($stocktake->items as $stocktakeItem) {
                if ($stocktakeItem->item) {
                    $stocktakeItem->item->update([
                        'balance' => $stocktakeItem->quantity, // Use stocktake quantity directly
                        // Note: new_balance column doesn't exist in items table
                    ]);
                }
            }

            $stocktake->update(['status' => 'Applied']);

            return $this->sendResponse($stocktake, Response::HTTP_OK, 'Stocktake applied successfully.');
        } catch (\Exception $e) {
            \Log::error('Stocktake application error: ' . $e->getMessage());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error applying stocktake: ' . $e->getMessage());
        }
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
