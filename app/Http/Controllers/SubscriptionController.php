<?php

namespace App\Http\Controllers;

use App\Enums\SubscriptionStatus;
use App\Http\Requests\QuoteSubscriptionRequest;
use App\Http\Requests\StoreSubscriptionRequest;
use App\Models\SubscriptionOrder;
use App\Services\Licence\LicenceIssuer;
use App\Services\Payments\PaymentGateway;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly PaymentGateway $gateway,
        private readonly LicenceIssuer $licences,
    ) {}

    public function store(StoreSubscriptionRequest $request): JsonResponse
    {
        $edition = $request->string('edition')->toString();
        $term = SubscriptionOrder::resolveTerm($request->string('licence_term')->toString());

        $order = SubscriptionOrder::create([
            'reference' => $this->reference(),
            'edition' => $edition,
            'licence_term' => $term['key'],
            'licence_months' => $term['months'],
            'currency' => config('tibadesk.currency'),
            'status' => SubscriptionStatus::AwaitingQuote,
            'customer_name' => $request->string('customer_name')->toString(),
            'email' => $request->string('email')->toString(),
            'phone' => $request->string('phone')->toString(),
            'facility_name' => $request->string('facility_name')->toString(),
            'tin' => $request->string('tin')->toString() ?: null,
        ]);

        return response()->json($this->present($order), 201);
    }

    /**
     * The enquiries still waiting on a quote from the team.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(SubscriptionStatus::class)],
            'limit' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $orders = SubscriptionOrder::query()
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')->toString())
            )
            ->latest()
            ->limit($request->integer('limit', 50))
            ->get();

        return response()->json([
            'data' => $orders->map(fn (SubscriptionOrder $order) => $this->presentForTeam($order))->all(),
        ]);
    }

    /**
     * Record the amount the team has quoted, which is the moment a payment link
     * can finally be created.
     */
    public function quote(QuoteSubscriptionRequest $request, string $reference): JsonResponse
    {
        $order = SubscriptionOrder::query()->where('reference', $reference)->first();

        abort_if($order === null, 404, 'Unknown subscription reference.');
        abort_if($order->isPaid(), 409, 'This subscription has already been paid, so the quote is final.');
        abort_if($order->status->isFinished(), 409, 'This subscription is closed, so it cannot be quoted.');

        $order->forceFill([
            'amount' => $request->integer('amount'),
            'quoted_at' => now(),
            'quoted_by' => $request->string('quoted_by')->toString() ?: null,
            'quote_note' => $request->string('note')->toString() ?: null,
            'status' => SubscriptionStatus::AwaitingPayment,
        ])->save();

        $order->forceFill(['checkout_url' => $this->gateway->checkoutUrlFor($order)])->save();

        return response()->json($this->presentForTeam($order));
    }

    public function show(string $reference): JsonResponse
    {
        $order = SubscriptionOrder::query()->where('reference', $reference)->first();

        abort_if($order === null, 404, 'Unknown subscription reference.');

        return response()->json($this->present($order));
    }

    public function download(Request $request, string $reference, LicenceIssuer $licences): BinaryFileResponse|JsonResponse
    {
        $order = SubscriptionOrder::query()->where('reference', $reference)->first();

        abort_if($order === null, 404, 'Unknown subscription reference.');
        abort_unless($order->isPaid(), 402, 'The licence is only available after payment.');

        $artifact = $request->string('artifact', 'package')->toString();

        if ($artifact === 'licence') {
            $path = storage_path('app/private/licences/'.$order->reference.'.json');
            File::ensureDirectoryExists(dirname($path));
            File::put($path, $licences->issue($order));

            return response()->download($path, "tibadesk-{$order->edition}-licence.json");
        }

        $path = config("tibadesk.artifacts.package.{$order->edition}");

        abort_if(
            $path === null || ! is_file($path),
            404,
            'The installer package for this edition has not been published yet. Our team will email it to you.'
        );

        return response()->download($path, "tibadesk-{$order->edition}.zip");
    }

    public function notification(Request $request): JsonResponse
    {
        $resolved = $this->gateway->resolveNotification($request->all());
        $order = $resolved['order'];

        if ($resolved['paid'] && ! $order->isPaid()) {
            abort_if($order->amount === null, 409, 'This subscription has no quoted amount, so it cannot be paid.');

            $order->forceFill([
                'status' => SubscriptionStatus::Paid,
                'paid_at' => now(),
                'payment_reference' => $resolved['payment_reference'],
                'period_start' => now(),
                'period_end' => $this->periodEnd($order),
            ])->save();

            $this->licences->issue($order);

            $order->forceFill([
                'status' => SubscriptionStatus::LicenceIssued,
                'licence_issued_at' => now(),
            ])->save();

            return response()->json(['status' => $order->status->value]);
        }

        $order->forceFill(['status' => SubscriptionStatus::Failed])->save();

        return response()->json(['status' => $order->status->value]);
    }

    /**
     * Local helper so the flow can be walked end to end without ClickPesa
     * credentials. Only available while the fake gateway is configured.
     */
    public function simulatePayment(Request $request, string $reference): JsonResponse
    {
        abort_unless(config('clickpesa.driver') === 'fake', 404);

        return $this->notification($request->merge(['reference' => $reference, 'paid' => true]));
    }

    /**
     * What the customer is allowed to see. There is deliberately no amount and
     * no currency here: the catalogue carries no prices, so nothing on the
     * public side of this flow may introduce one.
     *
     * @return array<string, mixed>
     */
    private function present(SubscriptionOrder $order): array
    {
        return [
            'reference' => $order->reference,
            'edition' => $order->edition,
            'licence_term' => $order->licence_term,
            'licence_term_label' => $order->licenceTermLabel(),
            'licence_months' => $order->licence_months,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'next_step' => $this->nextStep($order),
            'checkout_url' => $order->isPaid() ? null : $order->checkout_url,
            'period_start' => $order->period_start?->toIso8601String(),
            'period_end' => $order->period_end?->toIso8601String(),
        ];
    }

    /**
     * The internal view, which is the only place a quoted amount is readable.
     *
     * @return array<string, mixed>
     */
    private function presentForTeam(SubscriptionOrder $order): array
    {
        return [
            ...$this->present($order),
            'customer_name' => $order->customer_name,
            'email' => $order->email,
            'phone' => $order->phone,
            'facility_name' => $order->facility_name,
            'tin' => $order->tin,
            'amount' => $order->amount,
            'currency' => $order->currency,
            'quoted_at' => $order->quoted_at?->toIso8601String(),
            'quoted_by' => $order->quoted_by,
            'quote_note' => $order->quote_note,
            'payment_mode' => config('clickpesa.driver'),
            'created_at' => $order->created_at?->toIso8601String(),
        ];
    }

    /**
     * Plain-language guidance for the customer, so the checkout screen can say
     * what is happening without knowing anything about the payment provider.
     */
    private function nextStep(SubscriptionOrder $order): string
    {
        return match (true) {
            $order->status === SubscriptionStatus::AwaitingQuote => 'We have your request and will email you a quote with a payment link shortly.',
            $order->status === SubscriptionStatus::AwaitingPayment && $order->checkout_url !== null => 'Your quote is ready. Open the payment link to complete your subscription.',
            $order->status === SubscriptionStatus::AwaitingPayment => 'Your quote is being prepared. The payment link will appear here shortly.',
            $order->status->hasBeenPaid() => 'Payment received. Your licence key and installer are ready to download.',
            default => 'This request is closed. Contact us if you would like to start again.',
        };
    }

    private function reference(): string
    {
        return 'TBS-'.strtoupper(Str::random(10));
    }

    /**
     * The end of the licensed period, measured from the moment payment cleared
     * and running for the term the facility subscribed to.
     */
    private function periodEnd(SubscriptionOrder $order): Carbon
    {
        return now()->addMonths($order->licence_months);
    }
}
