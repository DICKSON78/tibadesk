<?php

namespace App\Pharmacy\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Pharmacy\Http\Resources\BatchResource;
use App\Pharmacy\Http\Resources\MovementResource;
use App\Pharmacy\Http\Resources\PurchaseOrderResource;
use App\Pharmacy\Http\Resources\SupplierResource;
use App\Pharmacy\Http\Resources\TransferResource;
use App\Pharmacy\Models\MedicineBatch;
use App\Pharmacy\Models\MedicineMovement;
use App\Pharmacy\Models\MedicineRecall;
use App\Pharmacy\Models\PharmacySupplier;
use App\Pharmacy\Models\PurchaseOrder;
use App\Pharmacy\Models\StockTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The pharmacy screens, rendered as Inertia pages over the same services the
 * API exposes. The pages read through the same tenant scope as everything else,
 * so a pharmacist sees their facility's stock and nothing else.
 */
class PharmacyScreenController extends Controller
{
    /**
     * What needs attention before it becomes a problem: stock about to expire,
     * stock pulled by a recall, and catalogue lines at or below their reorder
     * level.
     */
    public function index(Request $request): Response
    {
        $expiring = MedicineBatch::query()
            ->with(['medicine', 'recalls'])
            ->where('quantity_available', '>', 0)
            ->expiringWithin(90)
            ->orderBy('expiry_date')
            ->limit(10)
            ->get();

        $recalled = MedicineBatch::query()
            ->with(['medicine', 'recalls'])
            ->whereHas('recalls', fn ($query) => $query->open())
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return Inertia::render('Pharmacy/Index', [
            'alerts' => [
                'expiring_soon' => BatchResource::collection($expiring)->resolve($request),
                'recalled' => BatchResource::collection($recalled)->resolve($request),
            ],
            'counts' => [
                'batches' => MedicineBatch::query()->where('quantity_available', '>', 0)->count(),
                'expiring' => MedicineBatch::query()->where('quantity_available', '>', 0)->expiringWithin(90)->count(),
                'recalled' => MedicineRecall::query()->open()->count(),
                'suppliers' => PharmacySupplier::query()->where('is_active', true)->count(),
                'open_orders' => PurchaseOrder::query()
                    ->whereIn('status', [PurchaseOrder::DRAFT, PurchaseOrder::ORDERED, PurchaseOrder::PARTIALLY_RECEIVED])
                    ->count(),
                'transfers_in_flight' => StockTransfer::query()
                    ->whereIn('status', [StockTransfer::APPROVED, StockTransfer::IN_TRANSIT])
                    ->count(),
            ],
            'recentMovements' => MovementResource::collection(
                MedicineMovement::query()
                    ->with(['medicine', 'batch'])
                    ->orderByDesc('id')
                    ->limit(8)
                    ->get(),
            )->resolve($request),
        ]);
    }

    public function stock(Request $request): Response
    {
        $batches = MedicineBatch::query()
            ->with(['medicine', 'recalls'])
            ->when($request->filled('medicine_id'), fn ($query) => $query->where('medicine_id', $request->integer('medicine_id')))
            ->when($request->boolean('in_stock'), fn ($query) => $query->where('quantity_available', '>', 0))
            ->when($request->boolean('expired'), fn ($query) => $query->whereDate('expiry_date', '<', now()->toDateString()))
            ->when($request->boolean('expiring_soon'), fn ($query) => $query->expiringWithin(90))
            ->when($request->boolean('recalled'), fn ($query) => $query->whereHas('recalls', fn ($q) => $q->open()))
            ->orderBy('expiry_date')
            ->orderBy('id')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Pharmacy/Stock', [
            'batches' => [
                'data' => BatchResource::collection($batches->getCollection())->resolve($request),
                'meta' => [
                    'current_page' => $batches->currentPage(),
                    'last_page' => $batches->lastPage(),
                    'from' => $batches->firstItem(),
                    'to' => $batches->lastItem(),
                    'total' => $batches->total(),
                ],
                'links' => $batches->linkCollection()->toArray(),
            ],
            'filters' => [
                'in_stock' => $request->boolean('in_stock'),
                'expiring_soon' => $request->boolean('expiring_soon'),
                'expired' => $request->boolean('expired'),
                'recalled' => $request->boolean('recalled'),
            ],
        ]);
    }

    public function movements(Request $request): Response
    {
        $movements = MedicineMovement::query()
            ->with(['medicine', 'batch', 'performer'])
            ->when($request->filled('medicine_id'), fn ($query) => $query->where('medicine_id', $request->integer('medicine_id')))
            ->when($request->filled('movement_type'), fn ($query) => $query->where('movement_type', $request->string('movement_type')))
            ->orderByDesc('id')
            ->paginate(60)
            ->withQueryString();

        return Inertia::render('Pharmacy/Movements', [
            'movements' => [
                'data' => MovementResource::collection($movements->getCollection())->resolve($request),
                'meta' => [
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                    'from' => $movements->firstItem(),
                    'to' => $movements->lastItem(),
                    'total' => $movements->total(),
                ],
                'links' => $movements->linkCollection()->toArray(),
            ],
            'filters' => ['movement_type' => $request->string('movement_type')->toString()],
            'movementTypes' => MovementResource::collection(
                MedicineMovement::query()->select('movement_type')->distinct()->orderBy('movement_type')->get(),
            )->resolve($request),
        ]);
    }

    public function purchases(Request $request): Response
    {
        $orders = PurchaseOrder::query()
            ->with(['supplier', 'items.medicine'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Pharmacy/Purchases', [
            'orders' => [
                'data' => PurchaseOrderResource::collection($orders->getCollection())->resolve($request),
                'meta' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'from' => $orders->firstItem(),
                    'to' => $orders->lastItem(),
                    'total' => $orders->total(),
                ],
                'links' => $orders->linkCollection()->toArray(),
            ],
            'filters' => ['status' => $request->string('status')->toString()],
        ]);
    }

    public function suppliers(Request $request): Response
    {
        $suppliers = PharmacySupplier::query()
            ->when($request->filled('search'), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))
            ->orderBy('name')
            ->paginate(40)
            ->withQueryString();

        return Inertia::render('Pharmacy/Suppliers', [
            'suppliers' => [
                'data' => SupplierResource::collection($suppliers->getCollection())->resolve($request),
                'meta' => [
                    'current_page' => $suppliers->currentPage(),
                    'last_page' => $suppliers->lastPage(),
                    'from' => $suppliers->firstItem(),
                    'to' => $suppliers->lastItem(),
                    'total' => $suppliers->total(),
                ],
                'links' => $suppliers->linkCollection()->toArray(),
            ],
            'filters' => ['search' => $request->string('search')->toString()],
        ]);
    }

    public function transfers(Request $request): Response
    {
        $transfers = StockTransfer::query()
            ->with(['origin', 'destination', 'items.medicine'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Pharmacy/Transfers', [
            'transfers' => [
                'data' => TransferResource::collection($transfers->getCollection())->resolve($request),
                'meta' => [
                    'current_page' => $transfers->currentPage(),
                    'last_page' => $transfers->lastPage(),
                    'from' => $transfers->firstItem(),
                    'to' => $transfers->lastItem(),
                    'total' => $transfers->total(),
                ],
                'links' => $transfers->linkCollection()->toArray(),
            ],
            'filters' => ['status' => $request->string('status')->toString()],
        ]);
    }
}
