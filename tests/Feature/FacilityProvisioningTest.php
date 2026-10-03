<?php

namespace Tests\Feature;

use App\Data\ProvisionFacility;
use App\Enums\Edition;
use App\Enums\FacilityStatus;
use App\Enums\Module;
use App\Enums\Role;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\User;
use App\Services\FacilityProvisioningService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use RuntimeException;
use Tests\TestCase;

/**
 * The moment a customer pays and a facility has to exist.
 *
 * If this produces a facility without a working administrator, or without the
 * modules that were sold, everything afterwards is a dead end for that
 * customer, so the assertions here are about the whole shape of the result
 * rather than any single column.
 */
class FacilityProvisioningTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'test-activation-secret';

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.tibadesk.activation_key' => self::SECRET]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function registration(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Mkwakwa Hospital',
            'edition' => Edition::Polyclinic->value,
            'owner_name' => 'Neema Peter',
            'owner_email' => 'neema@mkwakwa.test',
            'owner_password' => 'correct-horse-battery',
            'licence_months' => 12,
            'registration_reference' => 'TBR-ABCD1234',
        ], $overrides);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function activate(array $payload = [], ?string $secret = null)
    {
        return $this->postJson('/api/activations', $payload, [
            'X-TibaDesk-Activation-Key' => $secret ?? self::SECRET,
        ]);
    }

    #[Test]
    public function an_activation_creates_a_working_facility_with_its_modules(): void
    {
        $this->activate($this->registration())
            ->assertCreated()
            ->assertJsonPath('facility.name', 'Mkwakwa Hospital')
            ->assertJsonPath('facility.status', FacilityStatus::Active->value)
            ->assertJsonPath('facility.registration_reference', 'TBR-ABCD1234');

        $facility = Facility::query()->where('registration_reference', 'TBR-ABCD1234')->firstOrFail();

        $this->assertSame(Edition::Polyclinic, $facility->edition);
        $this->assertEqualsCanonicalizing(
            config('tibadesk.editions.'.Edition::Polyclinic->value.'.modules'),
            $facility->enabledModuleValues(),
        );

        $owner = $facility->users()->firstOrFail();

        $this->assertSame(Role::FacilityAdmin, $owner->role);
        $this->assertTrue($owner->is_active);
        $this->assertTrue($owner->canPerform('users.manage'));
    }

    #[Test]
    public function the_administrator_can_immediately_sign_in(): void
    {
        $this->activate($this->registration())->assertCreated();

        $this->postJson('/api/auth/login', [
            'email' => 'neema@mkwakwa.test',
            'password' => 'correct-horse-battery',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', Role::FacilityAdmin->value)
            ->assertJsonPath('user.facility.edition', Edition::Polyclinic->value);
    }

    #[Test]
    public function the_administrator_password_is_stored_hashed(): void
    {
        $this->activate($this->registration())->assertCreated();

        $owner = User::query()->where('email', 'neema@mkwakwa.test')->firstOrFail();

        $this->assertNotSame('correct-horse-battery', $owner->password);
        $this->assertTrue(Hash::check('correct-horse-battery', $owner->password));
    }

    #[Test]
    public function the_response_never_echoes_the_password(): void
    {
        $content = $this->activate($this->registration())
            ->assertCreated()
            ->getContent();

        $this->assertIsString($content);
        $this->assertStringNotContainsString('correct-horse-battery', $content);
    }

    #[Test]
    public function a_wrong_activation_key_is_refused(): void
    {
        $this->activate($this->registration(), 'not-the-secret')
            ->assertForbidden();

        $this->assertSame(0, Facility::query()->count());
    }

    #[Test]
    public function a_missing_activation_key_is_refused(): void
    {
        $this->postJson('/api/activations', $this->registration())
            ->assertForbidden();

        $this->assertSame(0, Facility::query()->count());
    }

    #[Test]
    public function an_unconfigured_server_refuses_activation_entirely(): void
    {
        // Leaving the secret unset must close the door, not open it.
        config(['services.tibadesk.activation_key' => null]);

        $this->activate($this->registration())
            ->assertForbidden();

        $this->assertSame(0, Facility::query()->count());
    }

    #[Test]
    public function retrying_an_activation_does_not_create_a_second_facility(): void
    {
        $this->activate($this->registration())->assertCreated();

        $this->activate($this->registration())
            ->assertOk()
            ->assertJsonPath('message', 'This registration was already activated.');

        $this->assertSame(1, Facility::query()->count());
        $this->assertSame(1, User::query()->count());
    }

    #[Test]
    public function a_weak_administrator_password_is_refused(): void
    {
        $this->activate($this->registration(['owner_password' => 'short']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('owner_password');

        $this->assertSame(0, Facility::query()->count());
    }

    #[Test]
    public function an_unknown_edition_is_refused(): void
    {
        $this->activate($this->registration(['edition' => 'psychiatry-clinic']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('edition');
    }

    #[Test]
    public function a_reference_already_used_by_another_facility_is_refused(): void
    {
        $this->activate($this->registration())->assertCreated();

        $this->activate($this->registration(['name' => 'Different Clinic']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('registration_reference');
    }

    #[Test]
    public function two_facilities_with_the_same_name_get_different_slugs(): void
    {
        $this->activate($this->registration())->assertCreated();

        $this->activate($this->registration([
            'name' => 'Mkwakwa Hospital',
            'owner_email' => 'other@mkwakwa.test',
            'registration_reference' => 'TBR-ZZZZ9999',
        ]))->assertCreated();

        $this->assertSame(
            ['mkwakwa-hospital', 'mkwakwa-hospital-2'],
            Facility::query()->orderBy('id')->pluck('slug')->all(),
        );
    }

    #[Test]
    public function the_administrator_email_is_normalised(): void
    {
        $this->activate($this->registration(['owner_email' => '  Neema@MKwakwa.Test  ']))
            ->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'neema@mkwakwa.test']);
    }

    #[Test]
    public function provisioning_refuses_an_email_already_in_use(): void
    {
        $this->activate($this->registration())->assertCreated();

        $this->expectException(RuntimeException::class);

        app(FacilityProvisioningService::class)->provision(ProvisionFacility::fromArray([
            'name' => 'Another Clinic',
            'edition' => Edition::DentalClinic->value,
            'ownerName' => 'Someone Else',
            'ownerEmail' => 'neema@mkwakwa.test',
            'ownerPassword' => 'another-password',
        ]));
    }

    #[Test]
    public function a_new_facilitys_data_is_invisible_to_its_own_administrator_until_they_sign_in(): void
    {
        $this->activate($this->registration())->assertCreated();

        // Facilities are not tenant-scoped, but patients are: nothing is bound
        // yet, so a write with no facility on it is refused outright.
        $this->expectException(RuntimeException::class);

        Patient::factory()->create(['first_name' => 'Orphan']);
    }

    #[Test]
    public function the_administrator_sees_only_their_own_facilitys_patients_after_signing_in(): void
    {
        $this->activate($this->registration())->assertCreated();

        $token = $this->postJson('/api/auth/login', [
            'email' => 'neema@mkwakwa.test',
            'password' => 'correct-horse-battery',
        ])->json('token');

        $this->withToken($token)
            ->postJson('/api/patients', ['first_name' => 'First'])
            ->assertCreated();

        $this->withToken($token)
            ->getJson('/api/patients')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    #[Test]
    public function reprovisioning_an_upgrade_adds_modules_and_keeps_the_password(): void
    {
        $this->activate($this->registration(['edition' => Edition::Polyclinic->value]))
            ->assertCreated();

        $facility = Facility::query()->firstOrFail();

        $this->assertFalse($facility->hasModule(Module::Ipd));

        $result = app(FacilityProvisioningService::class)->reprovision(
            $facility,
            ProvisionFacility::fromArray([
                'name' => 'Mkwakwa Hospital',
                'edition' => Edition::Hospital->value,
                'ownerName' => 'Neema Peter',
                'ownerEmail' => 'neema@mkwakwa.test',
                'ownerPassword' => 'a-completely-different-password',
            ]),
        );

        $this->assertTrue($result['facility']->hasModule(Module::Ipd));
        $this->assertCount(
            count(config('tibadesk.editions.'.Edition::Hospital->value.'.modules')),
            $result['facility']->enabledModuleValues(),
        );

        // The customer may already have changed the password after signing in,
        // so an upgrade must never reset it back to the registration value.
        $this->assertTrue(
            Hash::check('correct-horse-battery', $result['owner']->password),
            'Reprovisioning reset the administrator password.',
        );
    }

    #[Test]
    public function a_pending_facility_cannot_sign_in_or_see_anything(): void
    {
        app(FacilityProvisioningService::class)->provision(
            ProvisionFacility::fromArray([
                'name' => 'Unpaid Clinic',
                'edition' => Edition::Polyclinic->value,
                'ownerName' => 'Neema Peter',
                'ownerEmail' => 'unpaid@clinic.test',
                'ownerPassword' => 'correct-horse-battery',
                'registrationReference' => 'TBR-ABCD1234',
            ]),
            activate: false,
        );

        $facility = Facility::query()->where('name', 'Unpaid Clinic')->firstOrFail();

        $this->assertSame(FacilityStatus::Pending, $facility->status);
        $this->assertSame([], $facility->enabledModuleValues());

        $this->postJson('/api/auth/login', [
            'email' => 'unpaid@clinic.test',
            'password' => 'correct-horse-battery',
        ])->assertUnprocessable();
    }

    #[Test]
    public function the_command_activates_a_registration(): void
    {
        $this->artisan('tibadesk:activate-facility', [
            '--name' => 'Bweru Clinic',
            '--edition' => 'dental-clinic',
            '--owner-name' => 'Grace Nali',
            '--owner-email' => 'grace@bweru.test',
            '--reference' => 'TBR-CMD00001',
            '--licence-months' => '6',
        ])
            ->assertSuccessful();

        $facility = Facility::query()->where('registration_reference', 'TBR-CMD00001')->firstOrFail();

        $this->assertSame(Edition::DentalClinic, $facility->edition);
        $this->assertTrue($facility->hasModule(Module::Dental));
        $this->assertDatabaseHas('users', [
            'facility_id' => $facility->id,
            'email' => 'grace@bweru.test',
            'role' => Role::FacilityAdmin->value,
        ]);
    }

    #[Test]
    public function the_command_refuses_an_incomplete_registration(): void
    {
        $this->artisan('tibadesk:activate-facility', ['--name' => 'No Edition'])
            ->assertFailed();

        $this->assertSame(0, Facility::query()->count());
    }
}
