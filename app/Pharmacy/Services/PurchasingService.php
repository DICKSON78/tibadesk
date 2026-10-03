<?php

namespace App\Pharmacy\Services;

use App\Pharmacy\Models\PurchaseOrder;
use App\Pharmacy\Models\PurchaseOrderItem;
use App\Services\DocumentNumberGenerator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Raising and receiving purchase orders against a supplier.
 *
 * Phermex's receiveGoods() reads the request body for a single medicine and a
 * single quantity, so a multi-line order cannot be received at all, and it
 * writes the medicine quantity, the purchase order, its items and a stock
 * movement in four separate statements with no transaction. Here a receipt
 * walks the order's own lines, creates a batch per line from the batch details
 * supplied, and runs inside one transaction: either the whole delivery lands or
 * none of it does.
 */
class PurchasingService
{
    public function __construct(
        private readonly StockLedger $ledger,
        private readonly DocumentNumberGenerator $numbers,
    ) {}

    /**
     * @param  array{supplier_id: int, expected_on?: string|null, notes?: string|null, items: list<array{medicine_id: int, quantity: int, unit_cost?: int}>}  $attributes
     */
    public function raise(array $attributes, ?int $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($attributes, $userId): PurchaseOrder {
            $order = PurchaseOrder::create([
                'supplier_id' => $attributes['supplier_id'],
                'order_number' => $this->numbers->nextForCurrent(DocumentNumberGenerator::PURCHASE_ORDER),
                'status' => PurchaseOrder::DRAFT,
                'ordered_on' => now()->toDateString(),
                'expected_on' => $attributes['expected_on'] ?? null,
                'raised_by' => $userId,
                'notes' => $attributes['notes'] ?? null,
            ]);

            $total = 0;

            foreach ($attributes['items'] as $item) {
                $quantity = (int) $item['quantity'];
                $cost = (int) ($item['unit_cost'] ?? 0);
                $lineTotal = $quantity * $cost;
                $total += $lineTotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity_ordered' => $quantity,
                    'unit_cost' => $cost,
                    'line_total' => $lineTotal,
                ]);
            }

            $order->update(['total_value' => $total]);
            $order->markOrdered();

            return $order->load('items');
        });
    }

    /**
     * Book in a delivery.
     *
     * Each receipt line names the medicine, how much arrived, and the batch
     * details for that delivery. The batch is created through the ledger so the
     * journal, the batch balance and the location balance all move together.
     *
     * @param  array{supplier_id: int, expected_on?: string|null, notes?: string|null, items: list<array{medicine_id: int, quantity: int, unit_cost?: int, batch_number: string, expiry_date: string}>}  $attributes
     */
    public function raiseAndReceive(array $attributes, ?int $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($attributes, $userId): PurchaseOrder {
            $order = $this->raise($attributes, $userId);

            $this->receive($order, $userId);

            return $order->refresh()->load('items');
        });
    }

    /**
     * Receive every outstanding line of an order. Phermex could only receive
     * a hand-picked single medicine; this walks the order.
     */
    public function receive(PurchaseOrder $order, ?int $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($order, $userId): PurchaseOrder {
            if ($order->isReceived()) {
                throw new RuntimeException("Purchase order {$order->order_number} has already been received.");
            }

            $receivedAny = false;

            foreach ($order->items as $item) {
                $outstanding = $item->quantityOutstanding();

                if ($outstanding <= 0) {
                    continue;
                }

                $batchNumber = $item->batch_number ?? "PO{$order->id}-M{$item->medicine_id}";
                $expiry = $item->expiry_date ?? now()->addYears(2)->toDateString();

                $this->ledger->receive(
                    batch: $item->medicine_id,
                    attributes: [
                        'batch_number' => $batchNumber,
                        'expiry_date' => $expiry,
                        'quantity' => $outstanding,
                        'cost_price' => $item->unit_cost,
                    ],
                    userId: $userId,
                );

                $item->update(['quantity_received' => $item->quantity_ordered]);
                $receivedAny = true;
            }

            $order->markReceived($userId);

            return $order;
        });
    }
}
