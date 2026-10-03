<?php

namespace Tests\Feature\Pharmacy;

use App\Enums\Edition;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\Medicine;
use App\Models\User;
use App\Pharmacy\Models\MedicineBatch;
use App\Pharmacy\Models\MedicineMovement;
use App\Pharmacy\Models\MedicineRecall;
use App\Pharmacy\Models\PharmacySupplier;
use App\Pharmacy\Models\PurchaseOrder;
use App\Pharmacy\Models\StockLocation;
use App\Pharmacy\Models\StockTransfer;
use App\Pharmacy\Services\StockLedger;
use App\Support\Tenancy\CurrentFacility;
use Database\Factories\MedicineFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The pharmacy supply chain over HTTP: what a pharmacist can see, what they
 * can change, and what the gates refuse.
 */
class PharmacyApiTest extends TestCase
{
    use RefreshDatabase;

    private Facility $facility;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->facility = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $this->admin = User::factory()->forFacility($this->facility)->role(Role::FacilityAdmin)->create();

        app(CurrentFacility::class)->set($this->facility);
    }

    private function as_(Role $role): self
    {
        $this->actingAs(
            User::factory()->forFacility($this->facility)->role($role)->create(),
            'sanctum',
        );

        return $this;
    }

    public function test_a_pharmacist_sees_the_stock_journal(): void
    {
        $this->as_(Role::Pharmacist)
            ->getJson('/api/pharmacy/stock/movements')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_a_role_without_the_pharmacy_capability_is_refused(): void
    {
        // A clinician can see the dispensary queue; a cashier cannot.
        $this->as_(Role::Cashier)
            ->getJson('/api/pharmacy/stock/movements')
            ->assertForbidden();
    }

    public function test_receiving_a_delivery_creates_a_batch_and_journals_it(): void
    {
        $supplier = PharmacySupplier::factory()->forFacility($this->facility)->create();
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $response = $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/purchase-orders', [
                'supplier_id' => $supplier->id,
                'receive_now' => true,
                'items' => [
                    [
                        'medicine_id' => $medicine->id,
                        'quantity' => 24,
                        'unit_cost' => 125,
                        'batch_number' => 'API-1',
                        'expiry_date' => now()->addYear()->toDateString(),
                    ],
                ],
            ]);

        $response->assertCreated()->assertJsonPath('data.status', PurchaseOrder::RECEIVED);

        $batch = MedicineBatch::query()->where('medicine_id', $medicine->id)->sole();
        $this->assertSame(24, $batch->quantity_available);
        $this->assertSame(24, (int) MedicineMovement::query()->where('batch_id', $batch->id)->sum('quantity'));
    }

    public function test_a_delivery_cannot_be_received_with_an_expired_batch(): void
    {
        $supplier = PharmacySupplier::factory()->forFacility($this->facility)->create();
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/purchase-orders', [
                'supplier_id' => $supplier->id,
                'receive_now' => true,
                'items' => [[
                    'medicine_id' => $medicine->id,
                    'quantity' => 5,
                    'unit_cost' => 100,
                    'batch_number' => 'DEAD',
                    'expiry_date' => now()->subDay()->toDateString(),
                ]],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('items.0.expiry_date');
    }

    public function test_a_transfer_ships_from_one_store_and_lands_in_another(): void
    {
        $main = StockLocation::query()->where('code', 'MAIN')->sole();
        $branch = StockLocation::factory()->forFacility($this->facility)->create();

        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $batch = app(StockLedger::class)->receive($medicine->id, [
            'batch_number' => 'XFER',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 40,
            'cost_price' => 100,
            'location_id' => $main->id,
        ], $this->admin->id);

        $transfer = $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/transfers', [
                'from_location' => $main->id,
                'to_location' => $branch->id,
                'items' => [['medicine_batch_id' => $batch->id, 'quantity' => 15]],
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', StockTransfer::PENDING)
            ->json('data');

        $this->as_(Role::Pharmacist)
            ->postJson("/api/pharmacy/transfers/{$transfer['id']}/ship")
            ->assertOk()
            ->assertJsonPath('data.status', StockTransfer::IN_TRANSIT);

        // In transit: gone from the source shelf, not yet in the branch. The
        // source has stopped counting it, so it cannot dispense what a van
        // is carrying.
        $ledger = app(StockLedger::class);
        $transit = StockLocation::query()->where('code', 'TRANSIT')->value('id');
        $this->assertSame(25, $ledger->availableAt($medicine->id, $main->id));
        $this->assertSame(0, $ledger->availableAt($medicine->id, $branch->id));
        $this->assertSame(15, $ledger->availableAt($medicine->id, $transit));

        $this->as_(Role::Pharmacist)
            ->postJson("/api/pharmacy/transfers/{$transfer['id']}/receive")
            ->assertOk()
            ->assertJsonPath('data.status', StockTransfer::COMPLETED);

        $this->assertSame(25, $ledger->availableAt($medicine->id, $main->id));
        $this->assertSame(15, $ledger->availableAt($medicine->id, $branch->id));
        $this->assertSame(0, $ledger->availableAt($medicine->id, $transit));
        $this->assertSame(40, $batch->refresh()->quantity_available, 'A transfer must not change the total.');
    }

    public function test_a_short_delivery_credits_only_what_arrived(): void
    {
        $main = StockLocation::query()->where('code', 'MAIN')->sole();
        $branch = StockLocation::factory()->forFacility($this->facility)->create();

        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $batch = app(StockLedger::class)->receive($medicine->id, [
            'batch_number' => 'SHORT',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 30,
            'cost_price' => 100,
            'location_id' => $main->id,
        ], $this->admin->id);

        $transfer = $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/transfers', [
                'from_location' => $main->id,
                'to_location' => $branch->id,
                'items' => [['medicine_batch_id' => $batch->id, 'quantity' => 20]],
            ])
            ->json('data');

        $this->as_(Role::Pharmacist)->postJson("/api/pharmacy/transfers/{$transfer['id']}/ship")->assertOk();

        $itemId = $transfer['items'][0]['id'];

        $this->as_(Role::Pharmacist)
            ->postJson("/api/pharmacy/transfers/{$transfer['id']}/receive", [
                'items' => [(string) $itemId => 12],
            ])
            ->assertOk();

        $ledger = app(StockLedger::class);
        $transit = StockLocation::query()->where('code', 'TRANSIT')->value('id');

        // 30 received, 20 sent (10 left the source), 12 arrived, 8 never made
        // it. The 8 are written off rather than conjured at the destination or
        // left sitting in transit forever.
        $this->assertSame(10, $ledger->availableAt($medicine->id, $main->id));
        $this->assertSame(12, $ledger->availableAt($medicine->id, $branch->id));
        $this->assertSame(0, $ledger->availableAt($medicine->id, $transit));
        $this->assertSame(22, $batch->refresh()->quantity_available);

        $this->as_(Role::Pharmacist)
            ->getJson('/api/pharmacy/stock/movements?movement_type=writeoff')
            ->assertOk()
            ->assertJsonPath('data.0.quantity', -8);
    }

    public function test_raising_a_recall_pulls_the_batch_out_of_stock_and_blocks_it(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $batch = app(StockLedger::class)->receive($medicine->id, [
            'batch_number' => 'RECALL-ME',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 18,
            'cost_price' => 200,
        ], $this->admin->id);

        $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/recalls', [
                'medicine_batch_id' => $batch->id,
                'recall_reason' => 'contamination',
                'severity' => 'class_i',
            ])
            ->assertCreated()
            ->assertJsonPath('data.affected_quantity', 18);

        // Stock came off the shelf the moment the recall was raised.
        $this->assertSame(0, $batch->refresh()->quantity_available);
        $this->assertSame(0, app(StockLedger::class)->availableAt($medicine->id));
        $this->assertTrue(MedicineRecall::query()->open()->where('batch_id', $batch->id)->exists());

        $this->as_(Role::Pharmacist)
            ->getJson('/api/pharmacy/stock/alerts')
            ->assertOk()
            ->assertJsonPath('data.recalled.0.batch_number', 'RECALL-ME');
    }

    public function test_writing_stock_off_reduces_it_and_records_the_loss(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        $batch = app(StockLedger::class)->receive($medicine->id, [
            'batch_number' => 'DAMAGED',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 50,
            'cost_price' => 40,
        ], $this->admin->id);

        $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/write-offs', [
                'medicine_batch_id' => $batch->id,
                'location_id' => StockLocation::query()->where('code', 'MAIN')->value('id'),
                'quantity' => 7,
                'reason' => 'damaged',
            ])
            ->assertCreated()
            ->assertJsonPath('data.quantity', 7)
            ->assertJsonPath('data.total_loss', 280);

        $this->assertSame(43, app(StockLedger::class)->availableAt($medicine->id));

        $this->as_(Role::Pharmacist)
            ->getJson('/api/pharmacy/stock/movements?movement_type=writeoff')
            ->assertOk()
            ->assertJsonPath('data.0.quantity', -7);
    }

    public function test_stock_alerts_flag_what_is_expiring(): void
    {
        $medicine = MedicineFactory::new()->create(['facility_id' => $this->facility->id]);

        app(StockLedger::class)->receive($medicine->id, [
            'batch_number' => 'SOON',
            'expiry_date' => now()->addDays(20)->toDateString(),
            'quantity' => 10,
            'cost_price' => 100,
        ], $this->admin->id);

        $this->as_(Role::Pharmacist)
            ->getJson('/api/pharmacy/stock/alerts')
            ->assertOk()
            ->assertJsonPath('data.expiring_soon.0.batch_number', 'SOON')
            ->assertJsonPath('data.expiring_soon.0.days_to_expiry', 20);
    }

    /**
     * Another facility's purchase order must be invisible, not merely hidden
     * from a list.
     */
    public function test_another_facilitys_purchase_order_cannot_be_received(): void
    {
        $theirs = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $theirAdmin = User::factory()->forFacility($theirs)->role(Role::FacilityAdmin)->create();
        $theirSupplier = PharmacySupplier::factory()->forFacility($theirs)->create();
        $theirMedicine = Medicine::factory()->create(['facility_id' => $theirs->id]);

        $theirOrder = PurchaseOrder::create([
            'facility_id' => $theirs->id,
            'supplier_id' => $theirSupplier->id,
            'order_number' => 'PO-THEIRS',
            'status' => PurchaseOrder::ORDERED,
            'total_value' => 100,
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/pharmacy/purchase-orders/{$theirOrder->id}/receive")
            ->assertNotFound();
    }
}
