<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddInvoiceItemRequest;
use App\Http\Requests\ApplyDiscountRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\StoreServicePriceRequest;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\ServicePriceResource;
use App\Models\Invoice;
use App\Models\ServicePrice;
use App\Services\BillingService;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class BillingController extends Controller
{
    public function __construct(
        private readonly BillingService $billing,
        private readonly CurrentFacility $current,
    ) {}

    /**
     * The unpaid work queue, which is the screen a cashier actually lives in.
     */
    public function index(Request $request): Response
    {
        $invoices = Invoice::query()
            ->with('patient')
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')->toString()),
            )
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Billing/Index', [
            'invoices' => [
                'data' => InvoiceResource::collection($invoices)->resolve($request),
                'meta' => $invoices->toArray()['meta'],
            ],
            'filters' => ['status' => $request->string('status')->toString()],
            'statuses' => ['unpaid', 'part_paid', 'paid'],
            'canManage' => $this->can($request, 'billing.manage'),
            'canCharge' => $this->can($request, 'billing.charge'),
        ]);
    }

    public function show(Request $request, Invoice $invoice): Response
    {
        return Inertia::render('Billing/Show', [
            'invoice' => (new InvoiceResource(
                $invoice->load(['items', 'payments.receivedBy', 'patient', 'encounter']),
            ))->resolve($request),
            'priceList' => ServicePriceResource::collection(
                ServicePrice::query()->where('is_active', true)->orderBy('name')->get(),
            )->resolve($request),
            'canCharge' => $this->can($request, 'billing.charge'),
            'canManage' => $this->can($request, 'billing.manage'),
        ]);
    }

    public function storePrice(StoreServicePriceRequest $request): RedirectResponse
    {
        ServicePrice::create([
            'facility_id' => $this->current->idOrFail(),
            ...$request->safe()->all(),
        ]);

        return back()->with('success', 'Price added to the price list.');
    }

    public function addItem(AddInvoiceItemRequest $request, Invoice $invoice): RedirectResponse
    {
        try {
            $request->has('service_price_ids')
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
            return back()->withErrors(['unit_price' => $e->getMessage()]);
        }

        return back()->with('success', 'Charge added.');
    }

    public function applyDiscount(ApplyDiscountRequest $request, Invoice $invoice): RedirectResponse
    {
        try {
            $this->billing->applyDiscount($invoice, $request->integer('amount'));
        } catch (RuntimeException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return back()->with('success', 'Discount applied.');
    }

    public function takePayment(StorePaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        try {
            $this->billing->recordPayment(
                $invoice,
                $request->integer('amount'),
                $request->string('method')->toString(),
                $request->string('reference')->toString() ?: null,
                $request->user()->id,
            );
        } catch (RuntimeException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return back()->with('success', 'Payment recorded.');
    }

    private function can(Request $request, string $capability): bool
    {
        return in_array($capability, $request->user()?->capabilities() ?? [], true);
    }
}
