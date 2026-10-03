<?php

namespace App\Pharmacy\Services;

use App\Pharmacy\Models\MedicineBatch;
use App\Pharmacy\Models\MedicineBatchStock;
use App\Pharmacy\Models\MedicineMovement;
use App\Pharmacy\Models\MedicineRecall;
use App\Pharmacy\Models\StockLocation;
use App\Pharmacy\Services\Exceptions\InsufficientStock;
use App\Pharmacy\Services\Exceptions\StockNotFound;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

/**
 * The only place medicine stock is allowed to change.
 *
 * Phermex updates `medicines.quantity` from five different controllers with no
 * transaction and no journal entry, which is how its transfer silently
 * destroys stock and its damaged-goods write-off ends up half-applied. Here
 * every change to a batch balance goes through this one class, is written to
 * medicine_movements in the same transaction, and refuses to take stock below
 * zero.
 *
 * The invariant every caller relies on: once this method returns, the sum of
 * the ledger for a batch equals the batch's quantity_available, and the batch
 * balances across locations equal that same total. The tests assert it.
 */
class StockLedger
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * Create or top up a batch. A repeat receipt of the same batch number adds
     * to the existing batch rather than overwriting it, which is the Phermex
     * behaviour that lost expiry dates.
     *
     * @param  array{batch_number: string, expiry_date: string, quantity: int, cost_price?: int, location_id?: int, received_on?: string, notes?: string|null}  $attributes
     */
    public function receive(MedicineBatch|int $batch, array $attributes, ?int $userId = null): MedicineBatch
    {
        return DB::transaction(function () use ($batch, $attributes, $userId): MedicineBatch {
            $quantity = (int) $attributes['quantity'];

            if ($quantity <= 0) {
                throw new InsufficientStock('A goods receipt must be for a positive quantity.');
            }

            if ($batch instanceof MedicineBatch) {
                $record = $this->lockBatch($batch->id);
            } else {
                $record = MedicineBatch::query()
                    ->where('medicine_id', $batch)
                    ->where('batch_number', $attributes['batch_number'])
                    ->lockForUpdate()
                    ->first();

                if (! $record) {
                    $record = new MedicineBatch([
                        'medicine_id' => $batch,
                        'batch_number' => $attributes['batch_number'],
                    ]);
                }
            }

            $locationId = $attributes['location_id'] ?? $this->defaultLocationId();
            $costPrice = (int) ($attributes['cost_price'] ?? $record->cost_price ?? 0);

            $record->fill([
                'expiry_date' => $attributes['expiry_date'],
                'cost_price' => $costPrice,
                'quantity_received' => $record->quantity_received + $quantity,
                'quantity_available' => $record->quantity_available + $quantity,
                'received_on' => $attributes['received_on'] ?? now()->toDateString(),
                'notes' => $attributes['notes'] ?? $record->notes,
            ])->save();

            $this->adjustLocationBalance($record, $locationId, $quantity);

            $this->journal(
                medicineId: $record->medicine_id,
                batchId: $record->id,
                movementType: MedicineMovement::PURCHASE,
                quantity: $quantity,
                unitCost: $costPrice,
                performedBy: $userId,
            );

            return $record->refresh();
        });
    }

    /**
     * Take stock out for a sale or a manual issue, breaking the request down
     * across batches oldest-expiry-first.
     *
     * $pinBatchId restricts the issue to one batch, which a write-off and a
     * recall need: they record the batch they apply to, so the ledger must
     * not quietly decrement a different one that happened to expire sooner.
     *
     * $includeExpired allows taking stock that has already lapsed. Selling it
     * is never allowed, but a write-off of dead stock has to be able to move
     * the quantity, or the loss can never be recorded.
     *
     * @return list<array{batch_id: int, batch_number: string, expiry_date: string, quantity: int, unit_cost: int}>
     */
    public function issue(
        int $medicineId,
        int $quantity,
        string $movementType = MedicineMovement::SALE,
        ?int $userId = null,
        ?int $locationId = null,
        ?string $referenceType = null,
        ?string $referenceNumber = null,
        ?int $pinBatchId = null,
        bool $includeExpired = false,
    ): array {
        return DB::transaction(function () use ($medicineId, $quantity, $movementType, $userId, $locationId, $referenceType, $referenceNumber, $pinBatchId, $includeExpired): array {
            if ($quantity <= 0) {
                throw new InsufficientStock('A stock issue must be for a positive quantity.');
            }

            $locationId ??= $this->defaultLocationId();

            $available = $this->availableAt($medicineId, $locationId, includeExpired: $includeExpired);

            if ($available < $quantity) {
                throw new InsufficientStock(sprintf(
                    'Only %d of %d in stock is available at this location.',
                    $available,
                    $quantity,
                ));
            }

            $taken = [];
            $remaining = $quantity;

            // First-expiring-first-out. Expired batches are excluded by
            // scopeSellable, so a sell-through never hands out dead stock.
            $batches = MedicineBatch::query()
                ->where('medicine_id', $medicineId)
                ->where('quantity_available', '>', 0)
                ->when(
                    $includeExpired,
                    fn (Builder $query) => $query,
                    fn (Builder $query) => $query->whereDate('expiry_date', '>=', now()->toDateString()),
                )
                ->when($pinBatchId, fn (Builder $query) => $query->whereKey($pinBatchId))
                ->orderBy('expiry_date')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }

                $heldHere = (int) $this->balanceAt($batch->id, $locationId);

                if ($heldHere <= 0) {
                    continue;
                }

                $takenFromBatch = min($heldHere, $remaining);

                $this->decrementBatch($batch, $takenFromBatch, $locationId);

                $this->journal(
                    medicineId: $medicineId,
                    batchId: $batch->id,
                    movementType: $movementType,
                    quantity: -$takenFromBatch,
                    unitCost: $batch->cost_price,
                    performedBy: $userId,
                    referenceType: $referenceType,
                    referenceNumber: $referenceNumber,
                );

                $taken[] = [
                    'batch_id' => $batch->id,
                    'batch_number' => $batch->batch_number,
                    'expiry_date' => $batch->expiry_date?->toDateString(),
                    'quantity' => $takenFromBatch,
                    'unit_cost' => $batch->cost_price,
                ];

                $remaining -= $takenFromBatch;
            }

            if ($remaining > 0) {
                // The per-batch check and this one disagree, which means the
                // balances moved under us. Abort rather than oversell.
                throw new InsufficientStock("Stock for medicine {$medicineId} is inconsistent; the issue was rolled back.");
            }

            return $taken;
        });
    }

    /**
     * Pull an entire batch off the shelf wherever it happens to be held.
     *
     * A recall applies to a batch, not to a shelf, and a batch can be split
     * across several stores. Routing this through issue() at one location would
     * leave the remainder sitting in another store, still dispenseable, under
     * a batch the facility believes it has already pulled.
     *
     * @return int the quantity actually withdrawn
     */
    public function withdrawBatch(
        MedicineBatch|int $batch,
        string $movementType = MedicineMovement::RECALL,
        ?int $userId = null,
        ?string $referenceType = null,
        ?string $referenceNumber = null,
    ): int {
        return DB::transaction(function () use ($batch, $movementType, $userId, $referenceType, $referenceNumber): int {
            $batch = $batch instanceof MedicineBatch ? $batch : $this->findBatch($batch);

            // Lock the batch first so its total cannot move under us, then walk
            // each store that holds a share of it.
            $batch = MedicineBatch::query()->lockForUpdate()->findOrFail($batch->id);

            $withdrawn = 0;

            foreach ($this->locationsHolding($batch->id) as $locationId => $held) {
                if ($held <= 0) {
                    continue;
                }

                // includeExpired: recalled goods are frequently already past
                // their date, and that must not stop them being withdrawn.
                $this->issue(
                    medicineId: $batch->medicine_id,
                    quantity: $held,
                    movementType: $movementType,
                    userId: $userId,
                    locationId: $locationId,
                    referenceType: $referenceType,
                    referenceNumber: $referenceNumber,
                    pinBatchId: $batch->id,
                    includeExpired: true,
                );

                $withdrawn += $held;
            }

            return $withdrawn;
        });
    }

    /**
     * @return array<int, int> location id => quantity held there
     */
    private function locationsHolding(int $batchId): array
    {
        return MedicineBatchStock::query()
            ->where('medicine_batch_id', $batchId)
            ->where('quantity_on_hand', '>', 0)
            ->pluck('quantity_on_hand', 'stock_location_id')
            ->map(fn ($quantity): int => (int) $quantity)
            ->all();
    }

    /**
     * Move stock between two locations of the same facility.
     *
     * The debit and the credit are the same row of work in one transaction, so
     * a failure cannot leave a transfer that removed stock and never added it.
     * This is the specific defect in Phermex's transfer handling.
     */
    public function moveBetweenLocations(
        int $batchId,
        int $fromLocationId,
        int $toLocationId,
        int $quantity,
        ?int $userId = null,
        ?string $referenceNumber = null,
    ): void {
        if ($fromLocationId === $toLocationId) {
            throw new StockNotFound('A transfer needs two different locations.');
        }

        DB::transaction(function () use ($batchId, $fromLocationId, $toLocationId, $quantity, $userId, $referenceNumber): void {
            $batch = $this->lockBatch($batchId);

            $heldHere = (int) $this->balanceAt($batch->id, $fromLocationId);

            if ($heldHere < $quantity) {
                throw new InsufficientStock(sprintf(
                    'Only %d of batch %s is held at the source location.',
                    $heldHere,
                    $batch->batch_number,
                ));
            }

            $this->adjustLocationBalance($batch, $fromLocationId, -$quantity);
            $this->adjustLocationBalance($batch, $toLocationId, $quantity);

            // The batch total is deliberately left alone. It is the sum of the
            // batch's location balances, and a transfer moves a quantity from
            // one to the other rather than creating or destroying any, so the
            // total is unchanged. This is the Phermex defect in one line: there,
            // shipping decremented the single medicine quantity and credited
            // nothing, so stock simply disappeared.

            $this->journal(
                medicineId: $batch->medicine_id,
                batchId: $batch->id,
                movementType: MedicineMovement::TRANSFER_OUT,
                quantity: -$quantity,
                unitCost: $batch->cost_price,
                performedBy: $userId,
                referenceType: 'stock_transfer',
                referenceNumber: $referenceNumber,
            );

            $this->journal(
                medicineId: $batch->medicine_id,
                batchId: $batch->id,
                movementType: MedicineMovement::TRANSFER_IN,
                quantity: $quantity,
                unitCost: $batch->cost_price,
                performedBy: $userId,
                referenceType: 'stock_transfer',
                referenceNumber: $referenceNumber,
            );
        });
    }

    /**
     * The ledger balance for a batch. Every writer above must leave this equal
     * to quantity_available, and tests assert that after each operation.
     */
    public function ledgerBalanceFor(int $batchId): int
    {
        return (int) MedicineMovement::query()
            ->where('batch_id', $batchId)
            ->sum('quantity');
    }

    /**
     * The batch's own total, recomputed from the location balances rather than
     * read off the row, so a drift between the three sources of truth shows up
     * as a failing number instead of quiet inaccuracy.
     */
    public function batchTotalAcrossLocations(int $batchId): int
    {
        return (int) MedicineBatchStock::query()
            ->where('medicine_batch_id', $batchId)
            ->sum('quantity_on_hand');
    }

    /**
     * The three records of the same fact, for asserting they agree.
     *
     * @return array{batch_total: int, location_total: int, ledger_total: int}
     */
    public function reconcile(int $batchId): array
    {
        return [
            'batch_total' => (int) MedicineBatch::query()->whereKey($batchId)->value('quantity_available'),
            'location_total' => $this->batchTotalAcrossLocations($batchId),
            'ledger_total' => $this->ledgerBalanceFor($batchId),
        ];
    }

    public function availableAt(int $medicineId, ?int $locationId = null, bool $includeExpired = false): int
    {
        // Asked about one location, answer with the balances held there. A
        // batch can be split across stores, so summing the batch's own total
        // would answer a different question and hand out stock this location
        // does not have.
        $sellable = fn (Builder $query): Builder => $includeExpired
            ? $query
            : $query->whereDate('expiry_date', '>=', now()->toDateString());

        if ($locationId !== null) {
            return (int) MedicineBatchStock::query()
                ->whereHas('batch', fn ($q) => $sellable(
                    $q->where('medicine_id', $medicineId),
                ))
                ->where('stock_location_id', $locationId)
                ->sum('quantity_on_hand');
        }

        return (int) $sellable(
            MedicineBatch::query()->where('medicine_id', $medicineId),
        )->sum('quantity_available');
    }

    public function isUnderRecall(int $batchId): bool
    {
        return MedicineRecall::query()
            ->open()
            ->where('batch_id', $batchId)
            ->exists();
    }

    public function assertNotRecalled(int $batchId): void
    {
        if ($this->isUnderRecall($batchId)) {
            throw new StockNotFound('This batch is under an open recall and cannot be dispensed.');
        }
    }

    public function defaultLocationId(): int
    {
        $location = StockLocation::query()->where('kind', 'store')->orderBy('id')->first()
            ?? StockLocation::query()->orderBy('id')->first();

        if (! $location) {
            throw new StockNotFound('This facility has no stock locations. Create one before receiving stock.');
        }

        return (int) $location->id;
    }

    /**
     * Resolve a batch inside the bound facility, or fail.
     *
     * Public because callers name batches by id - a transfer line, a return
     * line - and every one of them has to go through the same tenant check
     * rather than reaching for the model directly.
     */
    public function findBatch(int $batchId): MedicineBatch
    {
        return $this->lockBatch($batchId);
    }

    private function lockBatch(int $batchId): MedicineBatch
    {
        try {
            return MedicineBatch::query()->whereKey($batchId)->lockForUpdate()->firstOrFail();
        } catch (ModelNotFoundException) {
            throw new StockNotFound("Batch {$batchId} was not found in this facility.");
        }
    }

    private function balanceAt(int $batchId, int $locationId): int
    {
        return (int) MedicineBatchStock::query()
            ->where('medicine_batch_id', $batchId)
            ->where('stock_location_id', $locationId)
            ->value('quantity_on_hand');
    }

    private function adjustLocationBalance(MedicineBatch $batch, int $locationId, int $delta): void
    {
        $stock = MedicineBatchStock::query()
            ->where('medicine_batch_id', $batch->id)
            ->where('stock_location_id', $locationId)
            ->lockForUpdate()
            ->first();

        if (! $stock) {
            if ($delta < 0) {
                throw new InsufficientStock("There is no stock of batch {$batch->batch_number} at location {$locationId}.");
            }

            MedicineBatchStock::create([
                'medicine_batch_id' => $batch->id,
                'stock_location_id' => $locationId,
                'quantity_on_hand' => $delta,
            ]);

            return;
        }

        if ($stock->quantity_on_hand + $delta < 0) {
            throw new InsufficientStock("That would take batch {$batch->batch_number} below zero.");
        }

        $stock->update(['quantity_on_hand' => $stock->quantity_on_hand + $delta]);
    }

    private function decrementBatch(MedicineBatch $batch, int $quantity, int $locationId): void
    {
        $this->adjustLocationBalance($batch, $locationId, -$quantity);

        $batch->update([
            'quantity_available' => $batch->quantity_available - $quantity,
        ]);
    }

    private function journal(
        int $medicineId,
        int $batchId,
        string $movementType,
        int $quantity,
        int $unitCost = 0,
        ?int $performedBy = null,
        ?string $referenceType = null,
        ?string $referenceNumber = null,
    ): void {
        MedicineMovement::create([
            'medicine_id' => $medicineId,
            'batch_id' => $batchId,
            'movement_type' => $movementType,
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'performed_by' => $performedBy ?? auth()->id(),
            'reference_type' => $referenceType,
            'reference_number' => $referenceNumber,
        ]);
    }
}
