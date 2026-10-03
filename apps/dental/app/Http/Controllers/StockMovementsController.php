<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StockMovementsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'item_id' => 'sometimes|integer|exists:items,id',
            'type' => 'sometimes|in:in,out,adjustment',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();

        $query = StockMovement::with(['item', 'creator']);

        if ($request->item_id) {
            $query->where('item_id', $request->item_id);
        }
        if ($request->type) {
            $query->where('type', $request->type);
        }
        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($user && !$user->is_admin) {
            $query->whereHas('item', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        $query->orderBy('created_at', 'desc');
        $data = $query->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        $today = now()->format('Y-m-d');

        $query = StockMovement::query();
        if ($user && !$user->is_admin) {
            $query->whereHas('item', function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id);
            });
        }

        $stockInToday = (clone $query)->where('type', 'in')->whereDate('created_at', $today)->sum('quantity');
        $stockOutToday = (clone $query)->where('type', 'out')->whereDate('created_at', $today)->sum('quantity');

        return $this->sendResponse([
            'stock_in_today' => $stockInToday,
            'stock_out_today' => $stockOutToday,
            'total_movements' => (clone $query)->count(),
            'total_in' => (clone $query)->where('type', 'in')->sum('quantity'),
            'total_out' => (clone $query)->where('type', 'out')->sum('quantity'),
        ], Response::HTTP_OK, 'Success.');
    }
}
