<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Enums\Module;
use App\Enums\Role;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\DentalChart;
use App\Models\Encounter;
use App\Models\EncounterReferral;
use App\Models\Facility;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LeaveRequest;
use App\Models\Medicine;
use App\Models\MedicineStock;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\ServicePrice;
use App\Models\User;
use App\Models\Ward;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Every module has to work, not just exist.
 *
 * Each edition is sold as a working system, so this walks the actual work each
 * module exists to do - dispense, result, charge, admit, refer, chart, examine,
 * book leave - and checks the two gates that make it safe to sell: the facility
 * must hold the module, and the caller must hold the capability.
 */
class ModuleSystemsTest extends TestCase
{
    use RefreshDatabase;

    private Facility $facility;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // A hospital: the edition holding the most modules, so one facility
        // exercises every code path the catalogue can produce.
        $this->facility = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        $this->admin = User::factory()->forFacility($this->facility)->role(Role::FacilityAdmin)->create();
    }

    /**
     * Re-point the test at a facility running a different edition, so a dental
     * test runs on a dental clinic instead of quietly granting dental to a
     * hospital the catalogue says should not have it.
     */
    private function useEdition(Edition $edition): self
    {
        $this->facility = Facility::factory()->edition($edition)->provisioned()->create();
        $this->admin = User::factory()->forFacility($this->facility)->role(Role::FacilityAdmin)->create();

        return $this;
    }

    private function as_(Role $role): self
    {
        $this->actingAs(
            User::factory()->forFacility($this->facility)->role($role)->create(),
            'sanctum',
        );

        return $this;
    }

    /**
     * Put stock on a shelf, which the API deliberately has no route for: a
     * count is a physical job, not a data entry one.
     */
    private function putStock(int $medicineId, int $quantity): void
    {
        $medicine = Medicine::findOrFail($medicineId);

        $medicine->stock()->updateOrCreate(
            ['facility_id' => $this->facility->id, 'medicine_id' => $medicineId],
            ['quantity_on_hand' => $quantity, 'reorder_level' => 10],
        );
    }

    private function startedEncounter(): Encounter
    {
        $patient = Patient::factory()->forFacility($this->facility)->create();

        $this->actingAs(User::factory()->forFacility($this->facility)->role(Role::Receptionist)->create(), 'sanctum')
            ->postJson('/api/encounters', [
                'patient_id' => $patient->id,
                'reason_for_visit' => 'General complaint',
            ])->assertCreated();

        $encounter = Encounter::query()->latest('id')->firstOrFail();

        $this->actingAs(User::factory()->forFacility($this->facility)->role(Role::Receptionist)->create(), 'sanctum')
            ->postJson("/api/encounters/{$encounter->id}/start")->assertOk();

        return $encounter->fresh();
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function moduleEndpoints(): array
    {
        return [
            'pharmacy' => ['/api/pharmacy/medicines', Edition::Hospital, false],
            'laboratory' => ['/api/laboratory/tests', Edition::Hospital, false],
            'billing' => ['/api/billing/invoices', Edition::Hospital, false],
            'dental' => ['/api/dental/encounters/{encounter}/chart', Edition::DentalClinic, true],
            'eye' => ['/api/eye/encounters/{encounter}/exams', Edition::EyeClinic, true],
            'polyclinic' => ['/api/polyclinic/departments', Edition::Hospital, false],
            'ipd' => ['/api/ipd/wards', Edition::Hospital, false],
            'hr' => ['/api/hr/staff', Edition::Hospital, false],
            'reporting' => ['/api/reports/summary', Edition::Hospital, false],
        ];
    }

    // ------------------------------------------------------------------ pharmacy

    #[Test]
    public function a_pharmacist_can_dispense_a_prescription_and_the_shelf_goes_down(): void
    {
        $encounter = $this->startedEncounter();

        $this->as_(Role::Clinician)
            ->postJson("/api/encounters/{$encounter->id}/consultation", [
                'chief_complaint' => 'Fever',
                'prescriptions' => [
                    ['medicine' => 'Paracetamol', 'quantity' => 10],
                ],
            ])->assertCreated();

        $medicine = $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/medicines', [
                'code' => 'MED-1',
                'name' => 'Paracetamol',
                'unit_price' => 500,
            ])->assertCreated()->json('data.id');

        $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/medicines', ['code' => 'X', 'name' => 'y', 'unit_price' => 1])
            ->assertCreated();

        // Put stock on the shelf.
        $this->putStock($medicine, 50);

        $this->as_(Role::Pharmacist)
            ->postJson("/api/pharmacy/encounters/{$encounter->id}/dispense", ['prescription' => true])
            ->assertCreated()
            ->assertJsonPath('data.total', 5000);

        $this->assertSame(40, (int) Medicine::find($medicine)->quantityOnHand());
        $this->assertSame('dispensed', Prescription::query()->latest('id')->value('status'));
    }

    #[Test]
    public function a_prescription_is_refused_rather_than_partly_dispensed_when_stock_is_short(): void
    {
        $encounter = $this->startedEncounter();

        $this->as_(Role::Clinician)->postJson("/api/encounters/{$encounter->id}/consultation", [
            'prescriptions' => [['medicine' => 'Paracetamol', 'quantity' => 30]],
        ])->assertCreated();

        $medicine = $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/medicines', ['code' => 'P', 'name' => 'Paracetamol', 'unit_price' => 100])
            ->assertCreated()->json('data.id');

        $this->putStock($medicine, 5);

        $this->as_(Role::Pharmacist)
            ->postJson("/api/pharmacy/encounters/{$encounter->id}/dispense", ['prescription' => true])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Only 5 of Paracetamol left; 30 were requested.');

        // Nothing was handed over and the prescription is still waiting.
        $this->assertSame('pending', Prescription::query()->latest('id')->value('status'));
        $this->assertSame(5, (int) Medicine::find($medicine)->quantityOnHand());
    }

    #[Test]
    public function the_shelf_cannot_be_driven_negative(): void
    {
        $encounter = $this->startedEncounter();

        $medicine = $this->as_(Role::Pharmacist)
            ->postJson('/api/pharmacy/medicines', ['code' => 'N', 'name' => 'Neg', 'unit_price' => 100])
            ->assertCreated()->json('data.id');

        $this->putStock($medicine, 2);

        // The last two units are still sellable.
        $this->as_(Role::Pharmacist)
            ->postJson("/api/pharmacy/encounters/{$encounter->id}/dispense", [
                'items' => [['medicine_id' => $medicine, 'quantity' => 2]],
            ])->assertCreated();

        $stock = MedicineStock::withoutGlobalScopes()
            ->where('medicine_id', $medicine)->firstOrFail();
        $this->assertSame(0, $stock->quantity_on_hand);

        // One more is not, and the refusal must not have gone negative.
        $this->as_(Role::Pharmacist)
            ->postJson("/api/pharmacy/encounters/{$encounter->id}/dispense", [
                'items' => [['medicine_id' => $medicine, 'quantity' => 1]],
            ])->assertStatus(422);

        $this->assertSame(0, $stock->fresh()->quantity_on_hand);
    }

    // ----------------------------------------------------------------- laboratory

    #[Test]
    public function a_technician_records_a_result_and_the_order_closes(): void
    {
        $encounter = $this->startedEncounter();

        $test = $this->as_(Role::LabTechnician)
            ->postJson('/api/laboratory/tests', [
                'code' => 'FBC',
                'name' => 'Full blood count',
                'unit' => 'g/dL',
                'unit_price' => 15000,
            ])->assertCreated()->json('data.id');

        $order = $this->as_(Role::Clinician)
            ->postJson("/api/laboratory/encounters/{$encounter->id}/orders", ['lab_test_ids' => [$test]])
            ->assertCreated()
            ->json('data.id');

        $this->assertSame('ordered', $order ? LabOrder::find($order)->status : null);

        $item = LabOrderItem::query()->latest('id')->firstOrFail();

        $this->as_(Role::LabTechnician)
            ->postJson("/api/laboratory/items/{$item->id}/result", [
                'result_value' => 12.4,
                'result_flag' => 'normal',
            ])->assertOk()
            ->assertJsonPath('data.order_status', 'resulted');
    }

    #[Test]
    public function an_order_stays_open_until_every_test_on_it_is_resulted(): void
    {
        $encounter = $this->startedEncounter();

        $first = $this->as_(Role::LabTechnician)
            ->postJson('/api/laboratory/tests', ['code' => 'A', 'name' => 'Test A', 'unit_price' => 100])
            ->assertCreated()->json('data.id');

        $second = $this->as_(Role::LabTechnician)
            ->postJson('/api/laboratory/tests', ['code' => 'B', 'name' => 'Test B', 'unit_price' => 100])
            ->assertCreated()->json('data.id');

        $order = $this->as_(Role::Clinician)
            ->postJson("/api/laboratory/encounters/{$encounter->id}/orders", ['lab_test_ids' => [$first, $second]])
            ->assertCreated()->json('data.id');

        $items = LabOrderItem::query()->where('lab_order_id', $order)->get();

        $this->as_(Role::LabTechnician)
            ->postJson("/api/laboratory/items/{$items[0]->id}/result", ['result_value' => 1])
            ->assertOk()
            ->assertJsonPath('data.order_status', 'ordered');

        $this->as_(Role::LabTechnician)
            ->postJson("/api/laboratory/items/{$items[1]->id}/result", ['result_value' => 2])
            ->assertOk()
            ->assertJsonPath('data.order_status', 'resulted');
    }

    #[Test]
    public function a_result_with_no_value_at_all_is_refused(): void
    {
        $encounter = $this->startedEncounter();

        $test = $this->as_(Role::LabTechnician)
            ->postJson('/api/laboratory/tests', ['code' => 'C', 'name' => 'Test C', 'unit_price' => 100])
            ->assertCreated()->json('data.id');

        $this->as_(Role::Clinician)
            ->postJson("/api/laboratory/encounters/{$encounter->id}/orders", ['lab_test_ids' => [$test]])
            ->assertCreated();

        $item = LabOrderItem::query()->latest('id')->firstOrFail();

        $this->as_(Role::LabTechnician)
            ->postJson("/api/laboratory/items/{$item->id}/result", [])
            ->assertStatus(422);
    }

    // ------------------------------------------------------------------- billing

    #[Test]
    public function a_cashier_charges_and_takes_payment_and_the_invoice_settles(): void
    {
        $encounter = $this->startedEncounter();

        // The first request creates the invoice, so the answer is 201.
        $invoice = $this->as_(Role::Cashier)
            ->getJson("/api/billing/encounters/{$encounter->id}/invoice")
            ->assertCreated()
            ->json('data.id');

        // Asking again returns that same invoice rather than minting another.
        $this->as_(Role::Cashier)
            ->getJson("/api/billing/encounters/{$encounter->id}/invoice")
            ->assertOk()
            ->assertJsonPath('data.id', $invoice);

        $this->as_(Role::Cashier)
            ->postJson('/api/billing/price-list', [
                'code' => 'DRS',
                'name' => 'Dressing',
                'module' => 'consultation',
                'price' => 5000,
            ])->assertCreated();

        $price = ServicePrice::query()->where('code', 'DRS')->value('id');

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$invoice}/items", ['service_price_ids' => [$price]])
            ->assertOk()
            ->assertJsonPath('data.subtotal', 5000);

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$invoice}/payments", [
                'amount' => 3000,
                'method' => 'cash',
            ])->assertOk()
            ->assertJsonPath('data.status', 'part_paid')
            ->assertJsonPath('data.balance', 2000);

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$invoice}/payments", [
                'amount' => 2000,
                'method' => 'mobile_money',
                'reference' => 'MPN123',
            ])->assertOk()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.balance', 0);
    }

    #[Test]
    public function taking_more_money_than_the_balance_is_refused(): void
    {
        $encounter = $this->startedEncounter();

        $invoice = $this->as_(Role::Cashier)
            ->getJson("/api/billing/encounters/{$encounter->id}/invoice")
            ->json('data.id');

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$invoice}/items", [
                'description' => 'Consultation',
                'unit_price' => 2000,
            ])->assertOk();

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$invoice}/payments", ['amount' => 5000, 'method' => 'cash'])
            ->assertStatus(422);

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$invoice}/payments", ['amount' => 2000, 'method' => 'cash'])
            ->assertOk();
    }

    #[Test]
    public function a_settled_invoice_cannot_be_changed(): void
    {
        $encounter = $this->startedEncounter();

        $invoice = $this->as_(Role::Cashier)
            ->getJson("/api/billing/encounters/{$encounter->id}/invoice")
            ->assertCreated();
        $id = $invoice->json('data.id');

        // Give it a real charge first, otherwise there is nothing to settle.
        $charged = $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$id}/items", [
                'description' => 'Dressing',
                'unit_price' => 2500,
            ])->assertOk();
        $total = (int) $charged->json('data.total');

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$id}/payments", ['amount' => $total, 'method' => 'cash'])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        // Now that it is settled, adding to it is refused.
        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$id}/items", [
                'description' => 'Late extra charge',
                'unit_price' => 1000,
            ])->assertStatus(422);

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$id}/payments", ['amount' => 100, 'method' => 'cash'])
            ->assertStatus(422);
    }

    #[Test]
    public function a_clinic_cannot_charge_for_a_module_it_has_not_bought(): void
    {
        // Stale price row for a module this facility does not hold: a hospital
        // has no IPD... but it does. Take dental, which no hospital edition sells.
        $this->useEdition(Edition::Hospital);

        $stale = $this->app->make(CurrentFacility::class)->runUsing(
            $this->facility,
            fn (): ServicePrice => ServicePrice::create([
                'code' => 'IMPL',
                'name' => 'Implant',
                'module' => 'dental',
                'price' => 900000,
            ]),
        );

        $encounter = $this->startedEncounter();

        $invoice = $this->as_(Role::Cashier)
            ->getJson("/api/billing/encounters/{$encounter->id}/invoice")
            ->json('data.id');

        $this->as_(Role::Cashier)
            ->postJson("/api/billing/invoices/{$invoice}/items", ['service_price_ids' => [$stale->id]])
            ->assertStatus(422);
    }

    // -------------------------------------------------------------------- dental

    #[Test]
    public function a_dentist_charts_teeth_and_plans_procedures(): void
    {
        $this->useEdition(Edition::DentalClinic);
        $encounter = $this->startedEncounter();

        $this->as_(Role::Dentist)
            ->postJson("/api/dental/encounters/{$encounter->id}/chart", [
                'teeth' => [
                    ['tooth_number' => 16, 'surfaces' => ['m', 'o'], 'condition' => 'caries'],
                    ['tooth_number' => 36, 'condition' => 'healthy'],
                ],
            ])->assertCreated()->assertJsonCount(2, 'data');

        $this->as_(Role::Dentist)
            ->postJson("/api/dental/encounters/{$encounter->id}/procedures", [
                'procedures' => [
                    ['code' => 'FILL', 'name' => 'Amalgam filling', 'tooth_number' => 16, 'quoted_price' => 45000],
                ],
            ])->assertCreated()->assertJsonPath('data.0.status', 'planned');

        $this->as_(Role::Dentist)
            ->getJson("/api/dental/encounters/{$encounter->id}/chart")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function charting_the_same_tooth_twice_replaces_it_rather_than_duplicating(): void
    {
        $this->useEdition(Edition::DentalClinic);
        $encounter = $this->startedEncounter();

        $this->as_(Role::Dentist)->postJson("/api/dental/encounters/{$encounter->id}/chart", [
            'teeth' => [['tooth_number' => 16, 'condition' => 'caries']],
        ])->assertCreated();

        $this->as_(Role::Dentist)->postJson("/api/dental/encounters/{$encounter->id}/chart", [
            'teeth' => [['tooth_number' => 16, 'condition' => 'filling']],
        ])->assertCreated();

        $this->assertSame(1, DentalChart::query()->count());
        $this->assertSame('filling', DentalChart::query()->value('condition'));
    }

    #[Test]
    public function a_tooth_number_that_is_not_a_tooth_is_refused(): void
    {
        $this->useEdition(Edition::DentalClinic);
        $encounter = $this->startedEncounter();

        $this->as_(Role::Dentist)
            ->postJson("/api/dental/encounters/{$encounter->id}/chart", [
                'teeth' => [['tooth_number' => 99]],
            ])->assertStatus(422);
    }

    // ----------------------------------------------------------------------- eye

    #[Test]
    public function an_ophthalmologist_records_a_refraction_for_both_eyes(): void
    {
        $this->useEdition(Edition::EyeClinic);
        $encounter = $this->startedEncounter();

        $this->as_(Role::Ophthalmologist)
            ->postJson("/api/eye/encounters/{$encounter->id}/exams", [
                'od_visual_acuity' => '6/6',
                'os_visual_acuity' => '6/12',
                'od_sphere' => -1.25,
                'od_cylinder' => -0.5,
                'od_axis' => 180,
                'os_sphere' => -2.0,
                'os_cylinder' => -0.75,
                'os_axis' => 175,
                'diagnosis' => 'Myopia',
            ])->assertCreated()
            ->assertJsonPath('data.right_eye.sphere', -1.25)
            ->assertJsonPath('data.left_eye.axis', 175);
    }

    #[Test]
    public function a_refraction_for_only_one_eye_is_refused(): void
    {
        $this->useEdition(Edition::EyeClinic);
        $encounter = $this->startedEncounter();

        $this->as_(Role::Ophthalmologist)
            ->postJson("/api/eye/encounters/{$encounter->id}/exams", [
                'od_sphere' => -1.25,
            ])->assertStatus(422);
    }

    // --------------------------------------------------------------- polyclinic

    #[Test]
    public function a_clinician_refers_a_visit_to_another_department(): void
    {
        $encounter = $this->startedEncounter();

        $general = $this->as_(Role::Clinician)
            ->postJson('/api/polyclinic/departments', ['code' => 'GEN', 'name' => 'General Medicine'])
            ->assertCreated()->json('data.id');

        $surgery = $this->as_(Role::Clinician)
            ->postJson('/api/polyclinic/departments', ['code' => 'SUR', 'name' => 'Surgery'])
            ->assertCreated()->json('data.id');

        $this->as_(Role::Clinician)
            ->postJson("/api/polyclinic/encounters/{$encounter->id}/referrals", [
                'from_department_id' => $general,
                'to_department_id' => $surgery,
                'reason' => 'Suspected acute abdomen.',
            ])->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $referral = EncounterReferral::query()->latest('id')->firstOrFail();

        $this->as_(Role::Clinician)
            ->postJson("/api/polyclinic/referrals/{$referral->id}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'accepted');
    }

    #[Test]
    public function a_visit_cannot_be_referred_to_its_own_department(): void
    {
        $encounter = $this->startedEncounter();

        $general = $this->as_(Role::Clinician)
            ->postJson('/api/polyclinic/departments', ['code' => 'GEN', 'name' => 'General Medicine'])
            ->json('data.id');

        $this->as_(Role::Clinician)
            ->postJson("/api/polyclinic/encounters/{$encounter->id}/referrals", [
                'from_department_id' => $general,
                'to_department_id' => $general,
                'reason' => 'Nowhere to go.',
            ])->assertStatus(422);
    }

    #[Test]
    public function a_referral_cannot_be_actioned_twice(): void
    {
        $encounter = $this->startedEncounter();

        $from = $this->as_(Role::Clinician)
            ->postJson('/api/polyclinic/departments', ['code' => 'A', 'name' => 'Alpha'])->json('data.id');
        $to = $this->as_(Role::Clinician)
            ->postJson('/api/polyclinic/departments', ['code' => 'B', 'name' => 'Beta'])->json('data.id');

        $this->as_(Role::Clinician)->postJson("/api/polyclinic/encounters/{$encounter->id}/referrals", [
            'from_department_id' => $from,
            'to_department_id' => $to,
            'reason' => 'Reason.',
        ])->assertCreated();

        $referral = EncounterReferral::query()->latest('id')->firstOrFail();

        $this->as_(Role::Clinician)->postJson("/api/polyclinic/referrals/{$referral->id}/accept")->assertOk();
        $this->as_(Role::Clinician)->postJson("/api/polyclinic/referrals/{$referral->id}/accept")->assertStatus(409);
    }

    // ----------------------------------------------------------------------- ipd

    #[Test]
    public function a_nurse_admits_a_patient_to_a_bed_and_discharges_them(): void
    {
        $encounter = $this->startedEncounter();

        $ward = $this->as_(Role::Nurse)
            ->postJson('/api/ipd/wards', [
                'code' => 'GW',
                'name' => 'General Ward',
                'beds' => [['bed_number' => '1', 'daily_rate' => 50000]],
            ])->assertCreated();

        $bed = Bed::query()->latest('id')->firstOrFail();
        $this->assertSame('available', $bed->status);

        $admission = $this->as_(Role::Nurse)
            ->postJson("/api/ipd/encounters/{$encounter->id}/admissions", [
                'bed_id' => $bed->id,
                'admission_diagnosis' => 'Typhoid fever.',
            ])->assertCreated()
            ->assertJsonPath('data.status', 'admitted');

        $this->assertSame('occupied', $bed->fresh()->status);

        $id = Admission::query()->latest('id')->value('id');

        $this->as_(Role::Nurse)
            ->postJson("/api/ipd/admissions/{$id}/discharge", ['discharge_summary' => 'Recovered.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'discharged');

        $this->assertSame('available', $bed->fresh()->status);
    }

    #[Test]
    public function two_patients_cannot_be_given_the_same_bed(): void
    {
        $first = $this->startedEncounter();
        $second = $this->startedEncounter();

        $this->as_(Role::Nurse)->postJson('/api/ipd/wards', [
            'code' => 'GW', 'name' => 'General Ward', 'beds' => [['bed_number' => '1']],
        ])->assertCreated();

        $bed = Bed::query()->latest('id')->firstOrFail();

        $this->as_(Role::Nurse)
            ->postJson("/api/ipd/encounters/{$first->id}/admissions", ['bed_id' => $bed->id])
            ->assertCreated();

        $this->as_(Role::Nurse)
            ->postJson("/api/ipd/encounters/{$second->id}/admissions", ['bed_id' => $bed->id])
            ->assertStatus(422);
    }

    #[Test]
    public function a_ward_created_with_beds_reports_its_occupancy(): void
    {
        $this->as_(Role::Nurse)->postJson('/api/ipd/wards', [
            'code' => 'PW', 'name' => 'Private Ward',
            'beds' => [['bed_number' => '1'], ['bed_number' => '2'], ['bed_number' => '3']],
        ])->assertCreated();

        $this->as_(Role::Nurse)
            ->getJson('/api/ipd/overview')
            ->assertOk()
            ->assertJsonPath('data.wards.0.total_beds', 3)
            ->assertJsonPath('data.wards.0.available_beds', 3);
    }

    // ----------------------------------------------------------------------- hr

    #[Test]
    public function an_hr_officer_records_staff_and_reviews_leave(): void
    {
        $staff = $this->as_(Role::HrOfficer)
            ->postJson('/api/hr/staff', [
                'staff_number' => 'EMP-1',
                'full_name' => 'Neema Peter',
                'department' => 'Nursing',
                'designation' => 'Nurse',
            ])->assertCreated()
            ->json('data.id');

        $this->as_(Role::HrOfficer)
            ->postJson("/api/hr/staff/{$staff}/leave", [
                'leave_type' => 'annual',
                'from_date' => now()->addWeek()->toDateString(),
                'to_date' => now()->addWeek()->addDays(2)->toDateString(),
                'reason' => 'Family.',
            ])->assertCreated()
            // Monday to Wednesday is three days of cover, not two.
            ->assertJsonPath('data.days', 3)
            ->assertJsonPath('data.status', 'pending');

        $leave = LeaveRequest::query()->latest('id')->firstOrFail();

        $this->as_(Role::HrOfficer)
            ->postJson("/api/hr/leave/{$leave->id}/review", ['approve' => true])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    #[Test]
    public function leave_that_overlaps_an_existing_request_is_refused(): void
    {
        $staff = $this->as_(Role::HrOfficer)
            ->postJson('/api/hr/staff', ['staff_number' => 'EMP-2', 'full_name' => 'Jane Doe'])
            ->json('data.id');

        $this->as_(Role::HrOfficer)->postJson("/api/hr/staff/{$staff}/leave", [
            'leave_type' => 'annual',
            'from_date' => now()->addWeek()->toDateString(),
            'to_date' => now()->addWeek()->addDays(3)->toDateString(),
        ])->assertCreated();

        $this->as_(Role::HrOfficer)->postJson("/api/hr/staff/{$staff}/leave", [
            'leave_type' => 'sick',
            'from_date' => now()->addWeek()->addDay()->toDateString(),
            'to_date' => now()->addWeek()->addDays(5)->toDateString(),
        ])->assertStatus(422);
    }

    #[Test]
    public function leave_cannot_be_reviewed_twice(): void
    {
        $staff = $this->as_(Role::HrOfficer)
            ->postJson('/api/hr/staff', ['staff_number' => 'EMP-3', 'full_name' => 'Sam Lee'])
            ->json('data.id');

        $this->as_(Role::HrOfficer)->postJson("/api/hr/staff/{$staff}/leave", [
            'leave_type' => 'sick',
            'from_date' => now()->addDay()->toDateString(),
            'to_date' => now()->addDay()->toDateString(),
        ])->assertCreated();

        $leave = LeaveRequest::query()->latest('id')->firstOrFail();

        $this->as_(Role::HrOfficer)->postJson("/api/hr/leave/{$leave->id}/review", ['approve' => true])->assertOk();
        $this->as_(Role::HrOfficer)->postJson("/api/hr/leave/{$leave->id}/review", ['approve' => true])
            ->assertStatus(422);
    }

    // ------------------------------------------------------- reporting/licensing

    #[Test]
    public function a_report_counts_only_this_facility(): void
    {
        $encounter = $this->startedEncounter();

        $this->as_(Role::Cashier)
            ->getJson("/api/billing/encounters/{$encounter->id}/invoice")->assertCreated();

        $other = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();
        Patient::factory()->forFacility($other)->create();

        $this->as_(Role::Cashier)
            ->getJson('/api/reports/summary')
            ->assertOk()
            ->assertJsonPath('data.patients.total', 1)
            ->assertJsonPath('data.facility.id', $this->facility->id);
    }

    #[Test]
    public function a_report_returns_nothing_rather_than_a_misleading_zero(): void
    {
        $this->as_(Role::Cashier)
            ->getJson('/api/reports/summary')
            ->assertOk()
            ->assertJsonPath('data.encounters.average_wait_minutes', null);
    }

    #[Test]
    public function the_licence_shows_what_is_held_and_what_is_missing(): void
    {
        $this->facility->ownModuleGrants()
            ->where('module', Module::Ipd->value)
            ->update(['revoked_at' => now()]);

        $this->as_(Role::Receptionist)
            ->getJson('/api/licence')
            ->assertOk()
            ->assertJsonPath('data.edition.value', 'hospital')
            ->assertJsonPath('data.modules.missing', [Module::Ipd->value]);
    }

    #[Test]
    public function a_lapsed_licence_is_reported_as_expired(): void
    {
        $this->facility->update(['licence_expires_at' => now()->subDay()]);

        $this->as_(Role::Receptionist)
            ->getJson('/api/licence')
            ->assertOk()
            ->assertJsonPath('data.licence.is_expired', true)
            ->assertJsonPath('data.licence.expires_soon', false);
    }

    // ---------------------------------------------------------------- the gates

    /**
     * Each edition must only expose the modules it actually sold.
     *
     * @param  array<string, mixed>  $payload
     */
    #[Test]
    #[DataProvider('moduleEndpoints')]
    public function a_facility_without_the_module_cannot_reach_it(string $endpoint, Edition $edition, bool $needsEncounter): void
    {
        $this->useEdition($edition);
        $path = $this->resolve($endpoint, $needsEncounter);

        // Take every module away.
        $this->facility->ownModuleGrants()->update(['revoked_at' => now()]);

        $this->as_(Role::FacilityAdmin)->getJson($path)->assertForbidden();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    #[Test]
    #[DataProvider('moduleEndpoints')]
    public function a_role_without_the_capability_cannot_reach_it(string $endpoint, Edition $edition, bool $needsEncounter): void
    {
        $this->useEdition($edition);
        $path = $this->resolve($endpoint, $needsEncounter);

        // Every module held, but signed in as the weakest role there is.
        $this->as_(Role::Receptionist)->getJson($path)->assertForbidden();
    }

    /**
     * Substitute a real encounter id, so a 403 from the module gate is not
     * masked by a 404 from route model binding.
     */
    private function resolve(string $endpoint, bool $needsEncounter): string
    {
        if (! $needsEncounter) {
            return $endpoint;
        }

        return str_replace('{encounter}', (string) $this->startedEncounter()->id, $endpoint);
    }

    #[Test]
    public function a_dentist_has_nothing_to_do_in_a_clinic_without_the_dental_module(): void
    {
        $this->useEdition(Edition::DentalClinic);
        $encounter = $this->startedEncounter();

        $this->facility->ownModuleGrants()
            ->where('module', Module::Dental->value)
            ->update(['revoked_at' => now()]);

        $this->as_(Role::Dentist)
            ->getJson("/api/dental/encounters/{$encounter->id}/chart")
            ->assertForbidden();
    }

    #[Test]
    public function another_facility_rows_are_invisible_to_every_module(): void
    {
        $theirFacility = Facility::factory()->edition(Edition::Hospital)->provisioned()->create();

        $theirWard = Ward::withoutEvents(fn () => Ward::create([
            'facility_id' => $theirFacility->id,
            'code' => 'X',
            'name' => 'Their Ward',
        ]));

        $this->as_(Role::Nurse)->getJson('/api/ipd/wards')->assertOk()->assertJsonCount(0, 'data');

        $this->as_(Role::Nurse)
            ->getJson('/api/ipd/beds')
            ->assertOk()
            ->assertJsonMissing(['ward' => 'Their Ward']);
    }
}
