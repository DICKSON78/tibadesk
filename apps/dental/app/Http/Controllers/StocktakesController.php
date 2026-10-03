<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\Medicine;
use App\Models\StockMovement;
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
                    $stockItem = Medicine::where('id', $input_item['item_id'])
                        ->where('status', 'Active')
                        ->first();
                } else {
                    $stockItem = Item::where('id', $input_item['item_id'])
                        ->where('is_stock_item', 'Yes')
                        ->first();
                }

                if ($stockItem) {
                    StocktakeItem::create([
                        'stocktake_id' => $data->id,
                        'item_id' => $input_item['item_id'],
                        'quantity' => $input_item['quantity'],
                        'unit_buying_price' => $input_item['unit_buying_price'] ?? null,
                        'selling_price' => $input_item['selling_price'] ?? null,
                        'expiration_date' => $input_item['expiration_date'] ?? null,
                    ]);

                    $balanceBefore = (float) ($stockItem->balance ?? 0);
                    $balanceAfter = $balanceBefore + (float) $input_item['quantity'];

                    $stockItem->update([
                        'balance' => $balanceAfter,
                        'unit_buying_price' => $input_item['unit_buying_price'] ?? $stockItem->unit_buying_price,
                        'selling_price' => $input_item['selling_price'] ?? ($stockItem->selling_price ?? null),
                        'expiry_date' => $input_item['expiration_date'] ?? ($stockItem->expiry_date ?? null),
                    ]);

                    StockMovement::create([
                        'item_id' => $stockItem->id,
                        'type' => 'in',
                        'quantity' => $input_item['quantity'],
                        'balance_before' => $balanceBefore,
                        'balance_after' => $balanceAfter,
                        'reference_type' => 'stocktake',
                        'reference_id' => $data->id,
                        'reason' => $request->reason,
                        'created_by' => $user->id,
                    ]);
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
     * Apply a stocktake (finalize and mark as Applied)
     * Note: Balances are already updated on store(), this just marks the status.
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
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        Stocktake::findOrFail($id)->delete();
        return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_OK, 'Deleted successfully.');
    }
}
