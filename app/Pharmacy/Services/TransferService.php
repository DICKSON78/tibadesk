<?php

namespace App\Pharmacy\Services;

use App\Models\Facility;
use App\Pharmacy\Models\MedicineBatchStock;
use App\Pharmacy\Models\MedicineMovement;
use App\Pharmacy\Models\StockTransfer;
use App\Pharmacy\Models\StockTransferItem;
use App\Services\DocumentNumberGenerator;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Moving stock between a facility's own stores.
 *
 * Phermex decrements the medicine quantity on ship and never increments
 * anything at the destination, so an internal transfer permanently destroys
 * inventory. Here the debit and the credit go through the ledger in the same
 * transaction, and stock cannot leave a store it is not in.
 */
class TransferService
{
    public function __construct(
        private readonly StockLedger $ledger,
        private readonly CurrentFacility $current,
        private readonly DocumentNumberGenerator $numbers,
    ) {}

    /**
     * @param  array{from_location: int, to_location: int, notes?: string|null, items: list<array{medicine_batch_id: int, quantity: int}>}  $attributes
     */
    public function request(array $attributes, ?int $userId = null): StockTransfer
    {
        return DB::transaction(function () use ($attributes, $userId): StockTransfer {
            $from = (int) $attributes['from_location'];
            $to = (int) $attributes['to_location'];

            if ($from === $to) {
                throw new RuntimeException('A transfer needs a different source and destination.');
            }

            $transfer = StockTransfer::create([
                'from_location' => $from,
                'to_location' => $to,
                'transfer_number' => $this->numbers->nextForCurrent(DocumentNumberGenerator::STOCK_TRANSFER),
                'status' => StockTransfer::PENDING,
                'requested_by' => $userId,
                'notes' => $attributes['notes'] ?? null,
            ]);

            foreach ($attributes['items'] as $item) {
                $batch = $this->ledger->findBatch((int) $item['medicine_batch_id']);

                $this->assertSourceHolds($batch->id, $from, (int) $item['quantity']);

                StockTransferItem::create([
                    'stock_transfer_id' => $transfer->id,
                    'medicine_id' => $batch->medicine_id,
                    'medicine_batch_id' => $batch->id,
                    'quantity_sent' => (int) $item['quantity'],
                ]);
            }

            return $transfer->load('items');
        });
    }

    /**
     * Ship it: the goods leave the source store and sit in the facility's
     * transit holding until they are received.
     *
     * The debit happens here, not at receipt. Without it the quantity would
     * still be on the source shelf while a van was carrying it, so the source
     * could dispense stock it no longer has. Crediting the destination at this
     * point would be just as wrong, which is why the goods go to transit
     * rather than jumping straight across.
     */
    public function ship(StockTransfer $transfer, ?int $userId = null): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $userId): StockTransfer {
            $transfer->approve($userId);

            $transit = $this->transitLocationId();

            foreach ($transfer->items as $item) {
                $this->assertSourceHolds($item->medicine_batch_id, (int) $transfer->from_location, (int) $item->quantity_sent);

                $this->ledger->moveBetweenLocations(
                    batchId: (int) $item->medicine_batch_id,
                    fromLocationId: (int) $transfer->from_location,
                    toLocationId: $transit,
                    quantity: (int) $item->quantity_sent,
                    userId: $userId,
                    referenceNumber: $transfer->transfer_number,
                );
            }

            $transfer->ship();

            return $transfer;
        });
    }

    /**
     * Take delivery: credit the destination for what actually arrived.
     *
     * A short delivery credits only what was received, so the difference stays
     * out of stock rather than being conjured at the destination.
     */
    public function receive(StockTransfer $transfer, ?array $received = null, ?int $userId = null): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $received, $userId): StockTransfer {
            foreach ($transfer->items as $item) {
                $arrived = (int) ($received[(string) $item->id] ?? $item->quantity_sent);

                if ($arrived > $item->quantity_sent) {
                    throw new RuntimeException('A transfer cannot receive more than it sent.');
                }

                if ($arrived > 0) {
                    $this->ledger->moveBetweenLocations(
                        batchId: (int) $item->medicine_batch_id,
                        fromLocationId: $this->transitLocationId(),
                        toLocationId: (int) $transfer->to_location,
                        quantity: $arrived,
                        userId: $userId,
                        referenceNumber: $transfer->transfer_number,
                    );
                }

                // Whatever did not arrive is not in the van and not on the
                // shelf, so it comes off the books rather than sitting in
                // transit forever.
                $lost = $item->quantity_sent - $arrived;

                if ($lost > 0) {
                    $this->ledger->issue(
                        medicineId: (int) $item->medicine_id,
                        quantity: $lost,
                        movementType: MedicineMovement::WRITEOFF,
                        userId: $userId,
                        locationId: $this->transitLocationId(),
                        referenceType: 'stock_transfer',
                        referenceNumber: $transfer->transfer_number,
                    );
                }

                $item->update(['quantity_received' => $arrived]);
            }

            $transfer->receive();

            return $transfer;
        });
    }

    private function transitLocationId(): int
    {
        $facility = $this->current->get();

        if ($facility === null) {
            throw new RuntimeException('No facility is bound to this transfer.');
        }

        return $facility->transitLocationId();
    }

    private function assertSourceHolds(int $batchId, int $locationId, int $quantity): void
    {
        $held = (int) MedicineBatchStock::query()
            ->where('medicine_batch_id', $batchId)
            ->where('stock_location_id', $locationId)
            ->value('quantity_on_hand');

        if ($held < $quantity) {
            throw new RuntimeException("The source store holds {$held}, not {$quantity}.");
        }
    }
}
