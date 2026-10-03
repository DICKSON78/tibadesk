<?php

namespace App\Pharmacy\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Pharmacy\Http\Requests\StorePurchaseOrderRequest;
use App\Pharmacy\Http\Resources\PurchaseOrderResource;
use App\Pharmacy\Http\Resources\SupplierResource;
use App\Pharmacy\Models\PharmacySupplier;
use App\Pharmacy\Models\PurchaseOrder;
use App\Pharmacy\Services\PurchasingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class SupplyController extends Controller
{
    public function __construct(private readonly PurchasingService $purchasing) {}

    /**
     * @return AnonymousResourceCollection<PharmacySupplier, SupplierResource>
     */
    public function suppliers(Request $request): AnonymousResourceCollection
    {
        return SupplierResource::collection(
            PharmacySupplier::query()
                ->when($request->filled('search'), fn ($query) => $query->where(
                    'name',
                    'like',
                    '%'.$request->string('search')->toString().'%',
                ))
                ->when($request->boolean('active_only'), fn ($query) => $query->where('is_active', true))
                ->orderBy('name')
                ->paginate(50)
                ->withQueryString(),
        );
    }

    public function storeSupplier(Request $request): JsonResponse
    {
        $supplier = PharmacySupplier::create($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:1000'],
            'city' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:120'],
            'tax_id' => ['nullable', 'string', 'max:60'],
            'payment_terms' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]));

        return SupplierResource::make($supplier)->response()->setStatusCode(201);
    }

    /**
     * @return AnonymousResourceCollection<PurchaseOrder, PurchaseOrderResource>
     */
    public function purchaseOrders(Request $request): AnonymousResourceCollection
    {
        return PurchaseOrderResource::collection(
            PurchaseOrder::query()
                ->with(['supplier', 'items.medicine'])
                ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
                ->when($request->filled('supplier_id'), fn ($query) => $query->where('supplier_id', $request->integer('supplier_id')))
                ->orderByDesc('id')
                ->paginate(50)
                ->withQueryString(),
        );
    }

    public function storePurchaseOrder(StorePurchaseOrderRequest $request): JsonResponse
    {
        $order = $request->wantsToReceiveGoods()
            ? $this->purchasing->raiseAndReceive($request->orderAttributes(), $request->user()->id)
            : $this->purchasing->raise($request->orderAttributes(), $request->user()->id);

        return PurchaseOrderResource::make($order->load(['supplier', 'items.medicine']))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Book in a delivery against an order already raised.
     */
    public function receivePurchaseOrder(PurchaseOrder $purchaseOrder): JsonResponse
    {
        try {
            $order = $this->purchasing->receive($purchaseOrder, request()->user()->id);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return PurchaseOrderResource::make($order->load(['supplier', 'items.medicine']))->response();
    }
}
