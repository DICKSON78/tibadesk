<?php

namespace Tests\Feature\Pharmacy;

use App\Enums\Edition;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\Medicine;
use App\Models\User;
use App\Pharmacy\Models\PharmacySupplier;
use App\Pharmacy\Services\StockLedger;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The pharmacist's browser screens. These cover the parts a user can get wrong
 * that an API test cannot see: that a page renders, that the module gate holds
 * on a web route, and that a facility never sees another facility's stock.
 */
class PharmacyScreenTest extends TestCase
{
    use RefreshDatabase;

    private Facility $facility;

    private User $pharmacist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->facility = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $this->pharmacist = User::factory()->forFacility($this->facility)->role(Role::Pharmacist)->create();

        // Seeding stock calls the ledger outside a request, so the facility has
        // to be bound here too; a real request binds it from the session.
        app(CurrentFacility::class)->set($this->facility);
    }

    public function test_the_overview_lists_expiring_recalled_and_recent_movements(): void
    {
        $ledger = app(StockLedger::class);
        $medicine = Medicine::factory()->create(['facility_id' => $this->facility->id]);
        $location = $ledger->defaultLocationId();

        // One batch expiring inside the warning window, one far away, so the
        // screen has to filter rather than dump the whole ledger.
        $ledger->receive($medicine->id, [
            'batch_number' => 'SOON',
            'expiry_date' => now()->addDays(10)->toDateString(),
            'quantity' => 20,
            'cost_price' => 100,
            'location_id' => $location,
        ], $this->pharmacist->id);

        // The recall is raised against a different batch on purpose: a recall
        // empties its batch, and an empty batch is no longer "expiring soon",
        // so testing both lists off one batch would assert the wrong thing.
        $recalled = $ledger->receive($medicine->id, [
            'batch_number' => 'RECALLED',
            'expiry_date' => now()->addYears(3)->toDateString(),
            'quantity' => 30,
            'cost_price' => 100,
            'location_id' => $location,
        ], $this->pharmacist->id);

        $this->actingAs($this->pharmacist, 'sanctum')
            ->postJson('/api/pharmacy/recalls', [
                'medicine_batch_id' => $recalled->id,
                'recall_reason' => 'contamination',
                'severity' => 'class_i',
            ])
            ->assertCreated();

        $response = $this->actingAs($this->pharmacist)->get('/tibadesk/pharmacy');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Pharmacy/Index')
            ->where('alerts.expiring_soon.0.batch_number', 'SOON')
            ->where('alerts.recalled.0.batch_number', 'RECALLED')
            ->where('alerts.recalled.0.quantity_available', 0)
            ->where('counts.recalled', 1)
            ->where('recentMovements.0.movement_type', 'recall')
            ->has('recentMovements', 3),
        );
    }

    public function test_a_batch_pulled_by_a_recall_stays_listed_even_with_nothing_left_on_the_shelf(): void
    {
        $ledger = app(StockLedger::class);
        $medicine = Medicine::factory()->create(['facility_id' => $this->facility->id]);
        $batch = $ledger->receive($medicine->id, [
            'batch_number' => 'PULLED',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 10,
            'cost_price' => 50,
        ], $this->pharmacist->id);

        // Raising the recall is what empties the shelf. Hiding the batch
        // afterwards would be the exact opposite of what the pharmacist needs.
        $this->actingAs($this->pharmacist, 'sanctum')
            ->postJson('/api/pharmacy/recalls', [
                'medicine_batch_id' => $batch->id,
                'recall_reason' => 'contamination',
                'severity' => 'class_i',
            ])
            ->assertCreated();

        $this->assertSame(0, $batch->fresh()->quantity_available);

        $this->actingAs($this->pharmacist)
            ->get('/tibadesk/pharmacy/stock?recalled=1')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Pharmacy/Stock')
                ->where('batches.data.0.batch_number', 'PULLED')
                ->where('batches.data.0.quantity_available', 0)
                ->where('batches.data.0.is_recalled', true),
            );
    }

    public function test_the_movements_ledger_reports_a_whole_number_of_days_and_a_signed_change(): void
    {
        $ledger = app(StockLedger::class);
        $medicine = Medicine::factory()->create(['facility_id' => $this->facility->id]);

        $ledger->receive($medicine->id, [
            'batch_number' => 'DAYS',
            'expiry_date' => now()->addDays(20)->toDateString(),
            'quantity' => 5,
            'cost_price' => 10,
        ], $this->pharmacist->id);

        $this->actingAs($this->pharmacist)
            ->get('/tibadesk/pharmacy/movements')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Pharmacy/Movements')
                ->where('movements.data.0.direction', 'in')
                ->where('movements.data.0.quantity', 5)
                ->where('movements.data.0.value', 50),
            );

        $this->actingAs($this->pharmacist)
            ->get('/tibadesk/pharmacy/stock?in_stock=1')
            ->assertInertia(fn (AssertableInertia $page) => $page
                // A whole number, not the -364.77 a raw diffInDays produced, and
                // counted forward rather than as days since the expiry lapsed.
                ->where('batches.data.0.days_to_expiry', 20),
            );
    }

    public function test_a_recalled_batch_can_still_be_written_off(): void
    {
        $ledger = app(StockLedger::class);
        $medicine = Medicine::factory()->create(['facility_id' => $this->facility->id]);
        $batch = $ledger->receive($medicine->id, [
            'batch_number' => 'DISPOSE',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 12,
            'cost_price' => 80,
        ], $this->pharmacist->id);

        $this->actingAs($this->pharmacist, 'sanctum')
            ->postJson('/api/pharmacy/write-offs', [
                'medicine_batch_id' => $batch->id,
                'location_id' => $ledger->defaultLocationId(),
                'quantity' => 12,
                'reason' => 'recalled',
                'notes' => 'Destroyed under quarantine.',
            ])
            ->assertCreated();

        // A write-off is the only lawful way recalled goods leave the building,
        // so the recall guard must not apply to it.
        $this->assertSame(0, $batch->fresh()->quantity_available);
        $this->actingAs($this->pharmacist)
            ->get('/tibadesk/pharmacy/movements?movement_type=writeoff')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('movements.data.0.movement_type', 'writeoff')
                ->where('movements.meta.total', 1),
            );
    }

    public function test_another_facilitys_stock_is_invisible_on_every_pharmacy_screen(): void
    {
        $other = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $otherMed = Medicine::factory()->create([
            'facility_id' => $other->id,
            'name' => 'Foreign Formulation',
        ]);

        // Bind the other facility while seeding, so the stock is genuinely
        // recorded against it, then come back to ours before reading the
        // screens. A pharmacist must not be able to see this by any filter.
        app(CurrentFacility::class)->set($other);

        app(StockLedger::class)->receive($otherMed->id, [
            'batch_number' => 'FOREIGN',
            'expiry_date' => now()->addYear()->toDateString(),
            'quantity' => 100,
            'cost_price' => 999,
        ]);

        app(CurrentFacility::class)->set($this->facility);

        foreach (['/tibadesk/pharmacy/stock', '/tibadesk/pharmacy/movements', '/tibadesk/pharmacy/suppliers'] as $screen) {
            $this->actingAs($this->pharmacist)
                ->get($screen)
                ->assertOk()
                ->assertDontSee('FOREIGN')
                ->assertDontSee('Foreign Formulation');
        }
    }

    public function test_a_facility_without_the_pharmacy_module_is_refused_the_screens(): void
    {
        // Not provisioned, so no module rows exist for it at all. Every edition
        // sold today includes pharmacy, which is exactly why the gate has to
        // hold for a facility that simply has not been granted anything yet.
        $clinic = Facility::factory()->create();
        $staff = User::factory()->forFacility($clinic)->role(Role::Pharmacist)->create();

        $this->actingAs($staff)->get('/tibadesk/pharmacy')->assertForbidden();
    }

    public function test_a_role_without_pharmacy_capability_is_refused(): void
    {
        // Billing staff can see patients but have no business reading the
        // pharmacy ledger, and the capability gate is what stops them.
        $billing = User::factory()->forFacility($this->facility)->role(Role::Cashier)->create();

        $this->actingAs($billing)->get('/tibadesk/pharmacy')->assertForbidden();
    }

    public function test_the_supplier_list_reports_what_each_supplier_has_been_paid(): void
    {
        $supplier = PharmacySupplier::create([
            'facility_id' => $this->facility->id,
            'name' => 'Nairobi Medical Distributors',
            'city' => 'Nairobi',
            'is_active' => true,
        ]);

        $this->actingAs($this->pharmacist)
            ->get('/tibadesk/pharmacy/suppliers?search=Nairobi')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Pharmacy/Suppliers')
                ->where('suppliers.data.0.name', 'Nairobi Medical Distributors')
                ->where('suppliers.data.0.total_purchased', 0)
                ->where('suppliers.meta.total', 1),
            );
    }
}
