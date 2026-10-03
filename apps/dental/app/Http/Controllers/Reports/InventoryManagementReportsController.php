<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCacheItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class InventoryManagementReportsController extends Controller
{
    use ApiResponse;

    public function getItemQuantityDispensedReport(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d'
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $q = $request->q;
            $payment_mode_id = $request->payment_mode_id;
            $consultation_type = $request->consultation_type;
            $start_date = $request->start_date;
            $end_date = $request->end_date;
            $data = PatientPaymentCacheItem::with(['item.unit_of_measure'])
                ->whereHas('item', function ($query) {
                    $query->where('is_stock_item', 'Yes');
                })
                ->where('status', 'Served');

            if (!$user || $user->is_admin) {
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

            if ($q) {
                $data->whereHas('item', function ($query) use ($q) {
                    $query->where('name', 'like', '%' . $q . '%');
                    $query->orWhere('code', 'like', '%' . $q . '%');
                });
            }

            if ($payment_mode_id) {
                $data->where('payment_mode_id', $payment_mode_id);
            }

            if ($consultation_type) {
                $consultation_type = explode(',', $consultation_type);
                $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                    $query->whereIn('name', $consultation_type);
                });
            }

            if ($start_date) {
                $data->whereDate('created_at', '>=', $start_date);
            }

            if ($end_date) {
                $data->whereDate('created_at', '<=', $end_date);
            }

            $data->orderBy('created_at', 'desc');
            $data->groupBy('item_id');
            $data->selectRaw('item_id, sum(quantity) as quantity_dispensed, sum(unit_price * quantity) as dispensed_value');

            $data = $data->paginate($per_page);
            // Ensure balance-like fields exist for frontend reducers (defensive)
            $data->getCollection()->transform(function ($row) {
                // item is already eager-loaded via with(['item'])
                $itemBalance = $row->item ? max(0, $row->item->balance) : 0;
                // balance = total stock before this period's dispensations
                $row->balance = $itemBalance + max(0, $row->quantity_dispensed);
                // new_balance / remaining = current actual stock after all deductions
                $row->new_balance = $itemBalance;
                // Common aliases different UIs might reference
                $row->current_balance = $row->balance;
                $row->available_balance = $row->new_balance;
                return $row;
            });
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Throwable $e) {
            \Log::error('getItemQuantityDispensedReport failed', ['error' => $e->getMessage()]);
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
            ], Response::HTTP_OK, 'Success.');
        }
    }

    public function getItemBalanceReport(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d'
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $q = $request->q;
            $consultation_type = $request->consultation_type;

            $data = \App\Models\Item::with(['unit_of_measure'])
                ->where('is_stock_item', 'Yes')
                ->where('status', 'Active')
                ->select('items.*')
                ->addSelect(DB::raw('0 as balance'));

            if (!$user || $user->is_admin) {
                if ($clinic_id) {
                    $data->where('clinic_id', $clinic_id);
                }
            } else {
                $data->where('clinic_id', $user->clinic_id);
            }

            if ($q) {
                $data->where(function ($query) use ($q) {
                    $query->where('name', 'like', '%' . $q . '%');
                    $query->orWhere('code', 'like', '%' . $q . '%');
                });
            }

            if ($consultation_type) {
                $consultation_type = explode(',', $consultation_type);
                $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                    $query->whereIn('name', $consultation_type);
                });
            }

            $data->orderBy('name', 'asc');

            $data = $data->paginate($per_page);
            // Ensure balance-like fields exist for frontend reducers (defensive)
            $data->getCollection()->transform(function ($row) {
                $row->balance = isset($row->balance) && $row->balance !== null ? $row->balance : 0;
                $row->new_balance = isset($row->new_balance) && $row->new_balance !== null ? $row->new_balance : 0;
                // Common aliases different UIs might reference
                $row->current_balance = isset($row->current_balance) && $row->current_balance !== null ? $row->current_balance : $row->balance;
                $row->available_balance = isset($row->available_balance) && $row->available_balance !== null ? $row->available_balance : $row->balance;
                return $row;
            });
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Throwable $e) {
            \Log::error('getItemBalanceReport failed', ['error' => $e->getMessage()]);
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
            ], Response::HTTP_OK, 'Success.');
        }
    }
}
