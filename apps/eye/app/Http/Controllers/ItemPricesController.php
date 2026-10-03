<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\ItemPrice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ItemPricesController extends Controller
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
        ]);

        $per_page = $request->per_page ?? 25;
        $item_id = $request->item_id;
        $payment_mode_id = $request->payment_mode_id;
        $data = ItemPrice::with(['payment_mode']);

        if ($item_id) {
            $data->where('item_id', $item_id);
        }

        if ($payment_mode_id) {
            $data->where('payment_mode_id', $payment_mode_id);
        }

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
            'item_id' => 'required|exists:items,id',
            'payment_mode_id' => 'required|exists:payment_modes,id',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $exists = ItemPrice::where('item_id', $request->item_id)
            ->where('payment_mode_id', $request->payment_mode_id)
            ->first();

        if ($exists) {
            return $this->sendResponse(null, Response::HTTP_UNPROCESSABLE_ENTITY,
                'This item already has a price for the selected payment mode.');
        }

        $data = ItemPrice::create($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Added successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = ItemPrice::with(['payment_mode'])->findOrFail($id);
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
            'item_id' => 'sometimes|required|exists:items,id',
            'payment_mode_id' => 'sometimes|required|exists:payment_modes,id',
            'unit_price' => 'sometimes|required|numeric|min:0',
        ]);

        $data = ItemPrice::findOrFail($id);
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
        $data = ItemPrice::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
