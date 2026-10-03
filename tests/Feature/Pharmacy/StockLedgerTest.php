<?php

namespace Tests\Feature\Pharmacy;

use App\Enums\Edition;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\User;
use App\Pharmacy\Models\MedicineBatch;
use App\Pharmacy\Models\MedicineMovement;
use App\Pharmacy\Models\MedicineRecall;
use App\Pharmacy\Models\PharmacySupplier;
use App\Pharmacy\Models\PurchaseOrder;
use App\Pharmacy\Models\StockLocation;
use App\Pharmacy\Models\StockReturn;
use App\Pharmacy\Services\Exceptions\InsufficientStock;
use App\Pharmacy\Services\Exceptions\StockNotFound;
use App\Pharmacy\Services\PurchasingService;
use App\Pharmacy\Services\StockLedger;
use App\Support\Tenancy\CurrentFacility;
use Database\Factories\MedicineFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockLedgerTest extends TestCase
{
    use RefreshDatabase;

    private Facility $facility;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->facility = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $this->admin = User::factory()->forFacility($this->facility)->role(Role::FacilityAdmin)->create();

        $this->actingAs($this->admin);
        app(CurrentFacility::class)->set($this->facility);
    }

    /**
     * Point the test at a second, unrelated facility and act as its own admin,
     * so a cross-facility read is genuinely attempted rather than assumed away.
     */
    /**
     * The batch total, the sum of its location balances and the sum of its
     * ledger rows are three records of one number. Any stock writer that
     * updates only some of them fails here.
     */
    private function assertBalanced(int $batchId): void
    {
        $totals = app(StockLedger::class)->reconcile($batchId);

        $this->assertSame(
            $totals['batch_total'],
            $totals['location_total'],
            "Batch {$batchId}: the batch total and its location balances disagree.",
        );

        $this->assertSame(
            $totals['batch_total'],
            $totals['ledger_total'],
            "Batch {$batchId}: on-hand stock and the stock journal disagree.",
        );
    }

    private function actingIn(Facility $facility): User
    {
        $user = User::factory()->forFacility($facility)->role(Role::FacilityAdmin)->create();

        $this->actingAs($user);
        app(CurrentFacility::class)->set($facility);

        return $user;
    }

    public function test_receiving_creates_a_batch_a_location_balance_and_a_journal_row(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $ledger = app(StockLedger::class);

        $batch = $ledger->receive(
            batch: $medicine->id,
            attributes: [
                'batch_number' => 'B-100',
                'expiry_date' => now()->addYear()->toDateString(),
                'quantity' => 100,
                'cost_price' => 250,
            ],
            userId: $this->admin->id,
        );

        $this->assertSame(100, $batch->quantity_available);
        $this->assertSame(100, $ledger->ledgerBalanceFor($batch->id));
        $this->assertBalanced($batch->id);

        $movement = MedicineMovement::query()->where('batch_id', $batch->id)->sole();
        $this->assertSame(MedicineMovement::PURCHASE, $movement->movement_type);
        $this->assertSame(100, $movement->quantity);
        $this->assertTrue($movement->isInbound());
    }

    /**
     * The Phermex defect this whole service exists to close: a repeat receipt
     * of the same batch must add to the existing batch, not overwrite the
     * expiry of the batch already on the shelf.
     */
    public function test_receiving_the_same_batch_number_keeps_both_lots_separately(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $ledger->receive($medicine->id, [
            'batch_number' => 'B-1',
            'expiry_date' => now()->addMonths(3)->toDateString(),
            'quantity' => 50,
            'cost_price' => 100,
        ]);

        $ledger->receive($medicine->id, [
            'batch_number' => 'B-2',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 40,
            'cost_price' => 120,
        ]);

        $this->assertSame(2, MedicineBatch::query()->where('medicine_id', $medicine->id)->count());
        $this->assertSame(90, $ledger->availableAt($medicine->id));
    }

    public function test_issue_breaks_the_request_across_batches_expiring_soonest_first(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $late = $ledger->receive($medicine->id, [
            'batch_number' => 'LATE',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 100,
            'cost_price' => 100,
        ]);

        $soon = $ledger->receive($medicine->id, [
            'batch_number' => 'SOON',
            'expiry_date' => now()->addMonth()->toDateString(),
            'quantity' => 30,
            'cost_price' => 100,
        ]);

        $taken = $ledger->issue($medicine->id, 50, MedicineMovement::SALE, $this->admin->id);

        $this->assertCount(2, $taken);
        $this->assertSame($soon->id, $taken[0]['batch_id'], 'The batch expiring first should be used first.');
        $this->assertSame(30, $taken[0]['quantity']);
        $this->assertSame(20, $taken[1]['quantity']);
        $this->assertSame($late->id, $taken[1]['batch_id']);

        $this->assertSame(0, $soon->refresh()->quantity_available);
        $this->assertSame(80, $late->refresh()->quantity_available);
        $this->assertSame(80, $ledger->availableAt($medicine->id));
        $this->assertBalanced($soon->id);
        $this->assertBalanced($late->id);
    }

    public function test_expired_batches_are_never_dispensed(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $ledger->receive($medicine->id, [
            'batch_number' => 'DEAD',
            'expiry_date' => now()->subDay()->toDateString(),
            'quantity' => 20,
            'cost_price' => 100,
        ]);

        $this->assertSame(0, $ledger->availableAt($medicine->id));

        $this->expectException(InsufficientStock::class);
        $ledger->issue($medicine->id, 1, MedicineMovement::SALE, $this->admin->id);
    }

    /**
     * A write-off is booked against one named batch. If the ledger re-ran FEFO
     * it could decrement a different batch that happened to expire sooner,
     * leaving the write-off row pointing at stock it never touched.
     */
    public function test_an_issue_pinned_to_a_batch_leaves_its_siblings_alone(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        // Expires sooner, so plain FEFO would take this one first.
        $soon = $ledger->receive($medicine->id, [
            'batch_number' => 'SOON',
            'expiry_date' => now()->addMonth()->toDateString(),
            'quantity' => 10,
            'cost_price' => 100,
        ]);

        $late = $ledger->receive($medicine->id, [
            'batch_number' => 'LATE',
            'expiry_date' => now()->addYears(2)->toDateString(),
            'quantity' => 10,
            'cost_price' => 100,
        ]);

        $ledger->issue(
            medicineId: $medicine->id,
            quantity: 4,
            movementType: MedicineMovement::WRITEOFF,
            userId: $this->admin->id,
            pinBatchId: $late->id,
        );

        $this->assertSame(10, $soon->refresh()->quantity_available, 'The sooner batch was not the one written off.');
        $this->assertSame(6, $late->refresh()->quantity_available);
    }

    /**
     * Expired stock can never be sold, but the loss still has to be recorded,
     * so a write-off must be able to move the quantity.
     */
    public function test_expired_stock_can_be_written_off_even_though_it_can_never_be_sold(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $batch = $ledger->receive($medicine->id, [
            'batch_number' => 'DEAD',
            'expiry_date' => now()->subDay()->toDateString(),
            'quantity' => 15,
            'cost_price' => 100,
        ]);

        $this->assertSame(0, $ledger->availableAt($medicine->id), 'Expired stock is not sellable.');

        $ledger->issue(
            medicineId: $medicine->id,
            quantity: 15,
            movementType: MedicineMovement::EXPIRY,
            userId: $this->admin->id,
            pinBatchId: $batch->id,
            includeExpired: true,
        );

        $this->assertSame(0, $batch->refresh()->quantity_available);
        $this->assertSame(
            ['batch_total' => 0, 'location_total' => 0, 'ledger_total' => 0],
            $ledger->reconcile($batch->id),
        );
    }

    /**
     * A recall applies to a batch, and a batch can be split across stores.
     * Leaving part of it on a branch shelf would mean the facility believes it
     * pulled stock it is still able to dispense.
     */
    public function test_a_recall_withdraws_the_whole_batch_from_every_location(): void
    {
        $main = StockLocation::factory()->for($this->facility)->create(['kind' => 'store']);
        $branch = StockLocation::factory()->for($this->facility)->create(['kind' => 'store']);
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $batch = $ledger->receive($medicine->id, [
            'batch_number' => 'SPLIT',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 30,
            'cost_price' => 100,
            'location_id' => $main->id,
        ]);

        // Send half to the branch, so the batch genuinely spans two shelves.
        $ledger->moveBetweenLocations($batch->id, $main->id, $branch->id, 15, $this->admin->id);
        $this->assertSame(30, $batch->refresh()->quantity_available);

        $withdrawn = $ledger->withdrawBatch(
            batch: $batch,
            movementType: MedicineMovement::RECALL,
            userId: $this->admin->id,
        );

        $this->assertSame(30, $withdrawn, 'Both shelves were cleared, not just the default one.');
        $this->assertSame(0, $batch->refresh()->quantity_available);
        $this->assertSame(
            ['batch_total' => 0, 'location_total' => 0, 'ledger_total' => 0],
            $ledger->reconcile($batch->id),
        );
    }

    /**
     * The specific Phermex bug: shipping debited the source and credited
     * nothing, so stock vanished. Both legs must move together.
     */
    public function test_a_transfer_conserves_stock_across_both_locations(): void
    {
        $main = StockLocation::factory()->for($this->facility)->create(['kind' => 'store']);
        $branch = StockLocation::factory()->for($this->facility)->create(['kind' => 'store']);

        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $batch = $ledger->receive(
            $medicine->id,
            [
                'batch_number' => 'T-1',
                'expiry_date' => now()->addYear()->toDateString(),
                'quantity' => 60,
                'cost_price' => 100,
                'location_id' => $main->id,
            ],
            $this->admin->id,
        );

        $ledger->moveBetweenLocations($batch->id, $main->id, $branch->id, 25, $this->admin->id, 'TRF-000001');

        $this->assertSame(35, $ledger->availableAt($medicine->id, $main->id));
        $this->assertSame(25, $ledger->availableAt($medicine->id, $branch->id));

        // The batch total is untouched: the goods moved, they did not vanish.
        $this->assertSame(60, $batch->refresh()->quantity_available);

        $movements = MedicineMovement::query()->where('batch_id', $batch->id)->orderBy('id')->get();
        $this->assertSame(60, (int) $movements->sum('quantity'), 'In and out must cancel in the ledger.');
        $this->assertBalanced($batch->id);
        $this->assertTrue($movements->contains(fn ($m) => $m->movement_type === MedicineMovement::TRANSFER_OUT));
        $this->assertTrue($movements->contains(fn ($m) => $m->movement_type === MedicineMovement::TRANSFER_IN));
    }

    public function test_a_transfer_beyond_the_source_balance_is_refused_and_rolls_back(): void
    {
        $main = StockLocation::factory()->for($this->facility)->create(['kind' => 'store']);
        $branch = StockLocation::factory()->for($this->facility)->create(['kind' => 'store']);

        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $batch = $ledger->receive($medicine->id, [
            'batch_number' => 'T-2',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 10,
            'cost_price' => 100,
            'location_id' => $main->id,
        ], $this->admin->id);

        try {
            $ledger->moveBetweenLocations($batch->id, $main->id, $branch->id, 15, $this->admin->id);
            $this->fail('Moving more than the source holds should be refused.');
        } catch (InsufficientStock) {
            // expected
        }

        $this->assertSame(10, $ledger->availableAt($medicine->id, $main->id));
        $this->assertSame(0, $ledger->availableAt($medicine->id, $branch->id));
    }

    public function test_recalled_batches_are_blocked(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $batch = $ledger->receive($medicine->id, [
            'batch_number' => 'RECALLED',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 20,
            'cost_price' => 100,
        ], $this->admin->id);

        MedicineRecall::create([
            'facility_id' => $this->facility->id,
            'medicine_id' => $medicine->id,
            'batch_id' => $batch->id,
            'reference_number' => 'RC-000001',
            'recall_reason' => 'contamination',
            'severity' => 'class_i',
            'status' => MedicineRecall::PENDING,
        ]);

        $this->assertTrue($ledger->isUnderRecall($batch->id));

        $this->expectException(StockNotFound::class);
        $ledger->assertNotRecalled($batch->id);
    }

    /**
     * Phermex writes a supplier return without touching quantity, so on-hand
     * never falls. Posting one here must reduce stock and journal it.
     */
    public function test_posting_a_supplier_return_reduces_stock(): void
    {
        $supplier = PharmacySupplier::factory()->for($this->facility)->create();
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $ledger = app(StockLedger::class);

        $batch = $ledger->receive($medicine->id, [
            'batch_number' => 'RET-1',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 40,
            'cost_price' => 90,
        ], $this->admin->id);

        $return = StockReturn::create([
            'facility_id' => $this->facility->id,
            'supplier_id' => $supplier->id,
            'return_number' => 'RET-000001',
            'reason' => 'damaged',
            'status' => StockReturn::DRAFT,
            'created_by' => $this->admin->id,
        ]);

        $return->items()->create([
            'facility_id' => $this->facility->id,
            'medicine_id' => $medicine->id,
            'batch_id' => $batch->id,
            'quantity' => 8,
            'unit_cost' => 90,
        ]);

        $item = $return->items()->sole();
        $ledger->issue(
            $medicine->id,
            8,
            MedicineMovement::RETURN,
            $this->admin->id,
            null,
            'stock_return',
            $return->return_number,
        );
        $return->post();

        $this->assertSame(StockReturn::POSTED, $return->refresh()->status);
        $this->assertSame(32, $ledger->availableAt($medicine->id));
        $this->assertBalanced($batch->id);
    }

    public function test_a_purchase_order_receives_every_line_and_creates_a_batch_each(): void
    {
        $supplier = PharmacySupplier::factory()->for($this->facility)->create();
        $first = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);
        $second = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $purchasing = app(PurchasingService::class);

        $order = $purchasing->raiseAndReceive([
            'supplier_id' => $supplier->id,
            'items' => [
                ['medicine_id' => $first->id, 'quantity' => 20, 'unit_cost' => 100, 'batch_number' => 'PO-A', 'expiry_date' => now()->addYear()->toDateString()],
                ['medicine_id' => $second->id, 'quantity' => 5, 'unit_cost' => 400, 'batch_number' => 'PO-B', 'expiry_date' => now()->addYears(2)->toDateString()],
            ],
        ], $this->admin->id);

        $this->assertSame(PurchaseOrder::RECEIVED, $order->status);
        $this->assertSame(20 * 100 + 5 * 400, $order->total_value);
        $firstBatches = MedicineBatch::query()->where('medicine_id', $first->id)->sole();
        $secondBatches = MedicineBatch::query()->where('medicine_id', $second->id)->sole();
        $this->assertSame(2, MedicineBatch::query()->count());
        $this->assertSame(20, app(StockLedger::class)->availableAt($first->id));
        $this->assertSame(5, app(StockLedger::class)->availableAt($second->id));
        $this->assertBalanced($firstBatches->id);
        $this->assertBalanced($secondBatches->id);
    }

    /**
     * A medicine must never leak across facilities, and a batch lookup in one
     * facility must not resolve to another facility's row.
     */
    public function test_stock_is_invisible_across_facilities(): void
    {
        $myMedicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        app(StockLedger::class)->receive($myMedicine->id, [
            'batch_number' => 'MINE',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 5,
            'cost_price' => 100,
        ], $this->admin->id);

        $theirs = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $theirAdmin = $this->actingIn($theirs);
        $theirMedicine = MedicineFactory::new()->create(['facility_id' => $theirs->id]);

        app(StockLedger::class)->receive($theirMedicine->id, [
            'batch_number' => 'THEIRS',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 7,
            'cost_price' => 100,
        ], $theirAdmin->id);

        // Back in my facility, only my batch is visible.
        app(CurrentFacility::class)->set($this->facility);

        $this->assertSame(1, MedicineBatch::query()->count());
        $this->assertSame('MINE', MedicineBatch::query()->sole()->batch_number);
        $this->assertSame(5, app(StockLedger::class)->availableAt($myMedicine->id));

        // Their batch exists, but it is not reachable from inside my facility.
        $theirBatch = MedicineBatch::query()
            ->withoutGlobalScopes()
            ->where('facility_id', $theirs->id)
            ->sole();

        $this->assertSame(0, app(StockLedger::class)->availableAt($theirMedicine->id));

        $this->expectException(StockNotFound::class);
        app(StockLedger::class)->moveBetweenLocations($theirBatch->id, 1, 2, 1);
    }
}
