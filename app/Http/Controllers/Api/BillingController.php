<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddInvoiceItemRequest;
use App\Http\Requests\ApplyDiscountRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\StoreServicePriceRequest;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\ServicePriceResource;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\ServicePrice;
use App\Services\BillingService;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class BillingController extends Controller
{
    public function __construct(
        private readonly BillingService $billing,
        private readonly CurrentFacility $current,
    ) {}

    public function invoices(Request $request): AnonymousResourceCollection
    {
        $invoices = Invoice::query()
            ->with('patient')
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')->toString()),
            )
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return InvoiceResource::collection($invoices);
    }

    public function show(Invoice $invoice): InvoiceResource
    {
        return new InvoiceResource($invoice->load(['items', 'payments.receivedBy', 'patient']));
    }

    /**
     * The invoice for a visit, created on first request.
     */
    public function forEncounter(Encounter $encounter): InvoiceResource
    {
        return new InvoiceResource(
            $this->billing->invoiceFor($encounter)->load(['items', 'payments.receivedBy'])
        );
    }

    public function addItem(AddInvoiceItemRequest $request, Invoice $invoice): JsonResponse
    {
        try {
            $invoice = $request->has('service_price_ids')
                ? $this->billing->addServices(
                    $invoice,
                    $request->validated('service_price_ids'),
                    $request->integer('quantity') ?: null,
                )
                : $this->billing->addAdhocCharge(
                    $invoice,
                    $request->string('description')->toString(),
                    $request->integer('unit_price'),
                    $request->integer('quantity', 1),
                    $request->string('module')->toString() ?: null,
                );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new InvoiceResource($invoice->load('items')))->response();
    }

    public function discount(ApplyDiscountRequest $request, Invoice $invoice): JsonResponse
    {
        try {
            $invoice = $this->billing->applyDiscount($invoice, $request->integer('amount'));
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new InvoiceResource($invoice->load('items')))->response();
    }

    public function payment(StorePaymentRequest $request, Invoice $invoice): JsonResponse
    {
        try {
            $payment = $this->billing->recordPayment(
                $invoice,
                $request->integer('amount'),
                $request->string('method')->toString(),
                $request->string('reference')->toString() ?: null,
                $request->user()->id,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new InvoiceResource($invoice->fresh()->load('payments.receivedBy')))->response();
    }

    /**
     * The price list, narrowed to the modules this facility actually holds.
     */
    public function priceList(Request $request): AnonymousResourceCollection
    {
        $facility = $this->current->get();
        $held = $facility?->enabledModuleValues() ?? [];

        $prices = ServicePrice::query()
            ->where('is_active', true)
            ->when($request->filled('module'), fn ($q) => $q->where('module', $request->string('module')->toString()))
            // A price row for a module the clinic has not bought is not shown,
            // so nobody can charge for something they do not offer.
            ->when($held !== [], fn ($q) => $q->whereIn('module', $held))
            ->orderBy('module')
            ->orderBy('name')
            ->get();

        return ServicePriceResource::collection($prices);
    }

    public function storePrice(StoreServicePriceRequest $request): JsonResponse
    {
        $price = ServicePrice::create([
            'facility_id' => $this->current->idOrFail(),
            ...$request->safe()->all(),
        ]);

        return (new ServicePriceResource($price))->response()->setStatusCode(JsonResponse::HTTP_CREATED);
    }
}
