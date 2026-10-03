<?php

namespace App\Services;

use App\Enums\Module;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\ServicePrice;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Charging for a visit and taking the money.
 *
 * Every total is recomputed from the lines rather than carried forward, so an
 * invoice can never disagree with its own items.
 */
class BillingService
{
    public function __construct(
        private readonly CurrentFacility $current,
        private readonly DocumentNumberGenerator $numbers,
    ) {}

    /**
     * The one invoice for an encounter, created on first use.
     */
    public function invoiceFor(Encounter $encounter): Invoice
    {
        $existing = Invoice::query()
            ->where('encounter_id', $encounter->getKey())
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return DB::transaction(function () use ($encounter): Invoice {
            $invoice = Invoice::create([
                'facility_id' => $this->current->idOrFail(),
                'encounter_id' => $encounter->getKey(),
                'patient_id' => $encounter->patient_id,
                'invoice_number' => $this->numbers->nextForCurrent(DocumentNumberGenerator::INVOICE),
                'status' => 'unpaid',
            ]);

            // A visit always carries at least the consultation or registration
            // fee, so a cashier is not left billing a zero invoice.
            $this->seedConsultationFee($invoice, $encounter);

            $invoice->recalculate();

            return $invoice;
        });
    }

    /**
     * @param  list<int>  $servicePriceIds
     */
    public function addServices(Invoice $invoice, array $servicePriceIds, ?int $quantity = null): Invoice
    {
        if ($servicePriceIds === []) {
            throw new RuntimeException('Select at least one item to add.');
        }

        return DB::transaction(function () use ($invoice, $servicePriceIds, $quantity): Invoice {
            foreach (array_unique($servicePriceIds) as $priceId) {
                $price = ServicePrice::query()->where('is_active', true)->find($priceId);

                if ($price === null) {
                    throw new RuntimeException("Service #{$priceId} is not on the price list.");
                }

                $this->assertModuleIsHeld($price->module);

                $this->assertInvoiceIsOpen($invoice);

                $item = InvoiceItem::create([
                    'facility_id' => $this->current->idOrFail(),
                    'invoice_id' => $invoice->getKey(),
                    'code' => $price->code,
                    'description' => $price->name,
                    'module' => $price->module,
                    'quantity' => $quantity ?? 1,
                    'unit_price' => $price->price,
                    'line_total' => ($quantity ?? 1) * $price->price,
                ]);
            }

            $invoice->recalculate();

            return $invoice->fresh();
        });
    }

    public function addAdhocCharge(Invoice $invoice, string $description, int $unitPrice, int $quantity = 1, ?string $module = null): Invoice
    {
        return DB::transaction(function () use ($invoice, $description, $unitPrice, $quantity, $module): Invoice {
            $this->assertInvoiceIsOpen($invoice);

            if ($module !== null) {
                $this->assertModuleIsHeld($module);
            }

            InvoiceItem::create([
                'facility_id' => $this->current->idOrFail(),
                'invoice_id' => $invoice->getKey(),
                'description' => $description,
                'module' => $module,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'line_total' => $unitPrice * $quantity,
            ]);

            $invoice->recalculate();

            return $invoice->fresh();
        });
    }

    public function applyDiscount(Invoice $invoice, int $amount): Invoice
    {
        $this->assertInvoiceIsOpen($invoice);

        if ($amount < 0) {
            throw new RuntimeException('A discount cannot be negative.');
        }

        if ($amount > $invoice->subtotal) {
            throw new RuntimeException('The discount is more than the invoice is for.');
        }

        $invoice->forceFill(['discount' => $amount])->save();
        $invoice->recalculate();

        return $invoice->fresh();
    }

    /**
     * Take money against an invoice.
     *
     * Overpayment is refused rather than silently carried: a cashier handing
     * back change from a till is a different action, and it needs a different
     * record.
     */
    public function recordPayment(Invoice $invoice, int $amount, string $method, ?string $reference, int $userId): Payment
    {
        if ($amount <= 0) {
            throw new RuntimeException('A payment must be for a positive amount.');
        }

        return DB::transaction(function () use ($invoice, $amount, $method, $reference, $userId): Payment {
            $invoice->refresh();

            if ($invoice->isPaid()) {
                throw new RuntimeException('This invoice is already settled.');
            }

            if ($amount > $invoice->balance()) {
                throw new RuntimeException(
                    "The balance is {$invoice->balance()}; {$amount} was tendered."
                );
            }

            $payment = Payment::create([
                'facility_id' => $this->current->idOrFail(),
                'invoice_id' => $invoice->getKey(),
                'amount' => $amount,
                'method' => $method,
                'reference' => $reference,
                'received_by' => $userId,
                'received_at' => now(),
            ]);

            $invoice->recalculate();

            return $payment;
        });
    }

    private function seedConsultationFee(Invoice $invoice, Encounter $encounter): void
    {
        $price = ServicePrice::query()
            ->where('module', 'consultation')
            ->where('is_active', true)
            ->orderBy('price')
            ->first()
            ?? ServicePrice::query()
                ->where('module', 'registration')
                ->where('is_active', true)
                ->orderBy('price')
                ->first();

        InvoiceItem::create([
            'facility_id' => $this->current->idOrFail(),
            'invoice_id' => $invoice->getKey(),
            'code' => $price?->code,
            'description' => $price?->name ?? "{$encounter->type} attendance",
            'module' => $price?->module ?? 'consultation',
            'quantity' => 1,
            'unit_price' => $price?->price ?? 0,
            'line_total' => $price?->price ?? 0,
        ]);
    }

    private function assertInvoiceIsOpen(Invoice $invoice): void
    {
        if ($invoice->isPaid()) {
            throw new RuntimeException('A settled invoice cannot be changed. Raise a new visit instead.');
        }
    }

    /**
     * A clinic that has not bought a module must not be able to charge for it,
     * even if a stale price row survives in its price list.
     */
    private function assertModuleIsHeld(string $module): void
    {
        $facility = $this->current->get();

        abort_if(
            $facility !== null && ! $facility->hasModule(Module::from($module)),
            422,
            "This facility does not hold the {$module} module.",
        );
    }
}
