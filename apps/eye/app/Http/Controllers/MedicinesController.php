<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Clinic;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MedicinesController extends Controller
{
    private function allowedColumns()
    {
        return [
            'clinic_id', 'name', 'code', 'item_type_id', 'consultation_type_id',
            'unit_of_measure_id', 'lens_type_id', 'is_consultation_item', 'is_stock_item',
            'balance', 'new_balance', 'unit_buying_price', 'expiry_date',
            'minimum_stock', 'has_expiry', 'templates', 'status'
        ];
    }

    public function index(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id;
            }

            $report_period = $request->get('report_period', 'weekly');

            $query = Medicine::with(['clinic', 'unit_of_measure', 'item_type', 'consultation_type'])
                ->withCount(['medicine_dispensations as issued_today' => function ($q) use ($report_period) {
                    switch ($report_period) {
                        case 'daily':
                            $q->whereDate('created_at', now()->toDateString());
                            break;
                        case 'monthly':
                            $q->where('created_at', '>=', now()->startOfMonth());
                            break;
                        case 'yearly':
                            $q->where('created_at', '>=', now()->startOfYear());
                            break;
                        default: // weekly
                            $q->where('created_at', '>=', now()->startOfWeek());
                            break;
                    }
                }])
                ->medicines()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                })
                ->where('status', 'Active');

            $search = $request->search ?? $request->q;
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            if ($request->has('has_expiry') && $request->has_expiry !== '') {
                $query->where('has_expiry', $request->has_expiry);
            }

            if ($request->has('prescription_required') && $request->prescription_required !== '') {
                $query->where('prescription_required', $request->prescription_required);
            }

            if ($request->has('controlled_substance') && $request->controlled_substance !== '') {
                $query->where('controlled_substance', $request->controlled_substance);
            }

            // Stock status filter
            if ($request->stock_status === 'In Stock') {
                $query->where('balance', '>', 5);
            } elseif ($request->stock_status === 'Low Stock') {
                $query->where('balance', '>', 0)->where('balance', '<=', 5);
            } elseif ($request->stock_status === 'Out of Stock') {
                $query->where('balance', '<=', 0);
            }

            $allowedSortColumns = ['name', 'code', 'balance', 'unit_buying_price', 'minimum_stock'];
            $sortBy = in_array($request->get('sort_by'), $allowedSortColumns) ? $request->get('sort_by') : 'name';
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = (int) $request->get('per_page', 15);
            $medicines = $query->paginate($perPage);

            $medicines->getCollection()->transform(function ($row) {
                $row->balance = $row->balance ?? 0;
                $row->new_balance = $row->new_balance ?? 0;
                return $row;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $medicines->items(),
                    'total' => $medicines->total(),
                    'current_page' => $medicines->currentPage(),
                    'per_page' => $medicines->perPage(),
                    'last_page' => $medicines->lastPage(),
                ]
            ]);
        } catch (\Throwable $e) {
            \Log::error('Medicines index failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => [],
                    'total' => 0,
                    'current_page' => (int) ($request->get('page', 1)),
                    'per_page' => (int) ($request->get('per_page', 15)),
                    'last_page' => 0,
                ]
            ]);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $clinic_id = $user->clinic_id;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'unit_of_measure_id' => 'required|exists:units_of_measure,id',
            'item_type_id' => 'required|exists:item_types,id',
            'consultation_type_id' => 'required|exists:consultation_types,id',
            'balance' => 'required|numeric|min:0',
            'unit_buying_price' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date',
            'minimum_stock' => 'nullable|numeric|min:0',
            'has_expiry' => 'required|in:Yes,No',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $attributes = [
                'clinic_id' => $clinic_id,
                'name' => $request->name,
                'code' => $request->code,
                'item_type_id' => $request->item_type_id,
                'consultation_type_id' => $request->consultation_type_id,
                'unit_of_measure_id' => $request->unit_of_measure_id,
                'is_consultation_item' => $request->is_consultation_item ?? 'Yes',
                'is_stock_item' => 'Yes',
                'balance' => $request->balance,
                'new_balance' => $request->balance,
                'unit_buying_price' => $request->unit_buying_price,
                'expiry_date' => $request->expiry_date,
                'minimum_stock' => $request->minimum_stock ?? 0,
                'has_expiry' => $request->has_expiry,
                'status' => 'Active',
            ];

            $attributes = array_intersect_key($attributes, array_flip($this->allowedColumns()));
            $medicine = Medicine::create($attributes);

            return response()->json([
                'success' => true,
                'message' => 'Medicine created successfully',
                'data' => $medicine->load(['clinic', 'unit_of_measure'])
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating medicine: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show($id)
    {
        $user = Auth::user();
        $clinic_id = $user->clinic_id;

        $medicine = Medicine::with(['clinic', 'unit_of_measure', 'item_type', 'consultation_type'])
            ->where('clinic_id', $clinic_id)
            ->where('id', $id)
            ->first();

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $medicine
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $clinic_id = $user->clinic_id;

        $medicine = Medicine::where('clinic_id', $clinic_id)
            ->where('id', $id)
            ->first();

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $allowed = $this->allowedColumns();
            $updateData = [];

            foreach ($allowed as $column) {
                if ($request->has($column)) {
                    $updateData[$column] = $request->$column;
                }
            }

            if (empty($updateData)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Nothing to update',
                    'data' => $medicine
                ]);
            }

            $medicine->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Medicine updated successfully',
                'data' => $medicine->load(['clinic', 'unit_of_measure'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Medicine update failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error updating medicine: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $clinic_id = $user->clinic_id;

        $medicine = Medicine::where('clinic_id', $clinic_id)
            ->where('id', $id)
            ->first();

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $medicine->update(['status' => 'Inactive']);
            return response()->json([
                'success' => true,
                'message' => 'Medicine deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting medicine: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getForSelection(Request $request)
    {
        $user = Auth::user();
        $clinic_id = $user->clinic_id;

        $query = Medicine::where('clinic_id', $clinic_id)
            ->where('status', 'Active')
            ->medicines();

        if ($request->get('exclude_expired', false)) {
            $query->where(function ($q) {
                $q->where('has_expiry', 'No')
                  ->orWhere('expiry_date', '>', now());
            });
        }

        if ($request->get('exclude_out_of_stock', false)) {
            $query->where('balance', '>', 0);
        }

        $medicines = $query->select('id', 'name', 'code', 'balance', 'unit_buying_price')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $medicines
        ]);
    }

    public function bulkCreate(Request $request)
    {
        $user = Auth::user();
        $clinic_id = $user->clinic_id;

        if (!Schema::hasTable('medicines')) {
            return response()->json([
                'success' => false,
                'message' => 'Database is not ready: missing medicines table.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $payload = $request->all();
        if (isset($payload['medicines']) && is_array($payload['medicines'])) {
            foreach ($payload['medicines'] as $i => $m) {
                foreach (['code', 'expiry_date'] as $nf) {
                    if (array_key_exists($nf, $m) && $m[$nf] === '') {
                        $payload['medicines'][$i][$nf] = null;
                    }
                }
                foreach (['unit_buying_price', 'minimum_stock'] as $nf) {
                    if (array_key_exists($nf, $m) && $m[$nf] === '') {
                        $payload['medicines'][$i][$nf] = 0;
                    }
                }
                if (isset($m['balance']) && !is_numeric($m['balance'])) {
                    $payload['medicines'][$i]['balance'] = (float) $m['balance'];
                }
                foreach (['has_expiry'] as $flag) {
                    if (array_key_exists($flag, $m)) {
                        if ($m[$flag] === true) $payload['medicines'][$i][$flag] = 'Yes';
                        if ($m[$flag] === false) $payload['medicines'][$i][$flag] = 'No';
                    }
                }
            }
        }

        $validator = Validator::make($payload, [
            'medicines' => 'required|array|min:1',
            'medicines.*.name' => 'required|string|max:255',
            'medicines.*.unit_of_measure_id' => 'required|exists:units_of_measure,id',
            'medicines.*.item_type_id' => 'required|exists:item_types,id',
            'medicines.*.consultation_type_id' => 'required|exists:consultation_types,id',
            'medicines.*.balance' => 'required|numeric|min:0',
            'medicines.*.has_expiry' => 'required|in:Yes,No',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $createdMedicines = DB::transaction(function () use ($payload, $clinic_id) {
                $out = [];
                $allowed = $this->allowedColumns();

                foreach ($payload['medicines'] as $medicineData) {
                    if (($medicineData['has_expiry'] ?? 'No') === 'No') {
                        $medicineData['expiry_date'] = null;
                    }

                    $attributes = [
                        'clinic_id' => $clinic_id,
                        'name' => $medicineData['name'],
                        'code' => $medicineData['code'] ?? null,
                        'item_type_id' => $medicineData['item_type_id'],
                        'consultation_type_id' => $medicineData['consultation_type_id'],
                        'unit_of_measure_id' => $medicineData['unit_of_measure_id'],
                        'is_consultation_item' => $medicineData['is_consultation_item'] ?? 'Yes',
                        'is_stock_item' => 'Yes',
                        'balance' => $medicineData['balance'],
                        'new_balance' => $medicineData['balance'],
                        'unit_buying_price' => $medicineData['unit_buying_price'] ?? 0,
                        'expiry_date' => $medicineData['expiry_date'] ?? null,
                        'minimum_stock' => $medicineData['minimum_stock'] ?? 0,
                        'has_expiry' => $medicineData['has_expiry'],
                        'status' => 'Active',
                    ];

                    $attributes = array_intersect_key($attributes, array_flip($allowed));
                    $medicine = Medicine::create($attributes);
                    $out[] = $medicine->load(['clinic', 'unit_of_measure']);
                }
                return $out;
            });

            return response()->json([
                'success' => true,
                'message' => count($createdMedicines) . ' medicine(s) created successfully',
                'data' => $createdMedicines
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            \Log::error('Medicines bulkCreate failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error creating medicines',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}