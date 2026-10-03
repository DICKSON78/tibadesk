<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\Medicine;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StockOutController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $request->validate([
            'reason' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|integer',
            'items.*.item_source' => 'nullable|in:item,medicine',
            'items.*.quantity' => 'required|numeric|min:0.001',
        ]);

        $user = $request->user();
        $results = [];

        foreach ($request->items as $input_item) {
            $source = $input_item['item_source'] ?? 'item';
            $quantity = (float) $input_item['quantity'];

            if ($source === 'medicine') {
                $item = Medicine::where('id', $input_item['item_id'])
                    ->where('status', 'Active')
                    ->first();
            } else {
                $item = Item::where('id', $input_item['item_id'])
                    ->where('is_stock_item', 'Yes')
                    ->first();
            }

            if (!$item) {
                return $this->sendError("Item not found: {$input_item['item_id']}", Response::HTTP_NOT_FOUND);
            }

            $balanceBefore = (float) ($item->balance ?? 0);
            if ($balanceBefore < $quantity) {
                return $this->sendError(
                    "Insufficient stock for {$item->name}. Available: {$balanceBefore}, Requested: {$quantity}",
                    Response::HTTP_BAD_REQUEST
                );
            }

            $balanceAfter = $balanceBefore - $quantity;
            $item->update(['balance' => $balanceAfter]);

            $movement = StockMovement::create([
                'item_id' => $item->id,
                'type' => 'out',
                'quantity' => $quantity,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_type' => 'stock_out',
                'reason' => $request->reason,
                'created_by' => $user->id,
            ]);

            $results[] = [
                'item_id' => $item->id,
                'item_name' => $item->name,
                'quantity' => $quantity,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'movement_id' => $movement->id,
            ];
        }

        return $this->sendResponse($results, Response::HTTP_OK, 'Stock out completed successfully.');
    }

    public function reasons()
    {
        $reasons = [
            'Expired',
            'Damaged',
            'Internal Use',
            'Donation',
            'Lost',
            'Return to Supplier',
            'Theft',
            'Other',
        ];

        return $this->sendResponse($reasons, Response::HTTP_OK, 'Success.');
    }
}
