<?php

namespace Tests\Feature;

use App\Enums\Edition;
use App\Enums\Module;
use App\Models\Facility;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * The commercial promise. If the catalogue and the runtime disagree, a
 * customer has either been sold a module they cannot use or refused one they
 * paid for, so the two are asserted against each other here.
 */
class CatalogueTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function every_module_case_is_in_the_catalogue(): void
    {
        $catalogue = config('tibadesk.modules');

        $this->assertNotEmpty($catalogue);

        foreach (Module::cases() as $module) {
            $this->assertArrayHasKey($module->value, $catalogue, "Module [{$module->value}] is missing from config/tibadesk.php.");
            $this->assertNotEmpty(
                $catalogue[$module->value]['name'] ?? null,
                "Module [{$module->value}] has no display name.",
            );
        }

        $this->assertCount(
            count(Module::cases()),
            $catalogue,
            'config/tibadesk.php lists a module the Module enum does not know about.',
        );
    }

    #[Test]
    public function every_edition_case_is_in_the_catalogue(): void
    {
        $editions = config('tibadesk.editions');

        $this->assertNotEmpty($editions);

        foreach (Edition::cases() as $edition) {
            $this->assertArrayHasKey($edition->value, $editions, "Edition [{$edition->value}] is missing from the catalogue.");
            $this->assertNotEmpty($editions[$edition->value]['name'] ?? null);
        }

        $this->assertCount(count(Edition::cases()), $editions);
    }

    #[Test]
    public function every_module_an_edition_grants_is_a_real_module(): void
    {
        foreach (Edition::cases() as $edition) {
            $modules = config("tibadesk.editions.{$edition->value}.modules");

            $this->assertNotEmpty($modules, "Edition [{$edition->value}] grants no modules.");

            foreach ($modules as $key => $module) {
                $this->assertContains(
                    $module,
                    array_column(Module::cases(), 'value'),
                    "Edition [{$edition->value}] grants unknown module [{$key}].",
                );
            }
        }
    }

    /**
     * The shared clinical core every edition is entitled to.
     *
     * @return list<array{string, list<string>}>
     */
    public static function sharedCoreProvider(): array
    {
        return array_map(
            static fn (Edition $edition): array => [$edition->value, [
                Module::Registration->value,
                Module::Consultation->value,
            ]],
            array_map(static fn (Edition $case): Edition => $case, Edition::cases()),
        );
    }

    #[Test]
    #[DataProvider('sharedCoreProvider')]
    public function every_edition_includes_the_shared_clinical_core(string $edition, array $expected): void
    {
        $granted = config("tibadesk.editions.{$edition}.modules");

        foreach ($expected as $module) {
            $this->assertContains(
                $module,
                $granted,
                "Edition [{$edition}] is missing shared module [{$module}].",
            );
        }
    }

    #[Test]
    public function the_specialist_module_belongs_only_to_its_own_edition(): void
    {
        $this->assertSame([Module::Dental], Edition::DentalClinic->specialistModules());
        $this->assertSame([Module::Eye], Edition::EyeClinic->specialistModules());

        foreach (Edition::cases() as $edition) {
            if (in_array($edition, [Edition::DentalClinic, Edition::EyeClinic], true)) {
                continue;
            }

            $this->assertSame(
                [],
                $edition->specialistModules(),
                "Edition [{$edition->value}] must not claim a specialist module.",
            );
        }
    }

    #[Test]
    public function a_specialist_edition_does_not_carry_the_other_specialists_module(): void
    {
        $dental = config('tibadesk.editions.'.Edition::DentalClinic->value.'.modules');

        $this->assertContains(Module::Dental->value, $dental);
        $this->assertNotContains(Module::Eye->value, $dental);
    }

    #[Test]
    public function the_hospital_is_the_only_edition_with_inpatient_and_hr(): void
    {
        $withIpd = array_values(array_filter(
            Edition::cases(),
            static fn (Edition $edition): bool => in_array(Module::Ipd->value, config("tibadesk.editions.{$edition->value}.modules"), true),
        ));

        $this->assertSame([Edition::Hospital], $withIpd);
    }

    #[Test]
    public function provisioning_a_facility_grants_exactly_its_edition(): void
    {
        foreach (Edition::cases() as $edition) {
            $facility = Facility::factory()->edition($edition)->provisioned()->create();

            $this->assertEqualsCanonicalizing(
                config("tibadesk.editions.{$edition->value}.modules"),
                $facility->enabledModuleValues(),
                "A {$edition->value} facility was granted the wrong modules.",
            );
        }
    }

    #[Test]
    public function upgrading_a_facility_adds_modules_without_revoking_any(): void
    {
        $facility = Facility::factory()->edition(Edition::Polyclinic)->provisioned()->create();

        $facility->update(['edition' => Edition::Hospital]);
        $facility->grantEditionModules();

        $this->assertTrue($facility->hasModule(Module::Ipd));
        $this->assertTrue($facility->hasModule(Module::Hr));
        $this->assertTrue($facility->hasModule(Module::Registration));

        $this->assertEqualsCanonicalizing(
            config('tibadesk.editions.'.Edition::Hospital->value.'.modules'),
            $facility->enabledModuleValues(),
        );

        $this->assertSame(
            count(config('tibadesk.editions.'.Edition::Hospital->value.'.modules')),
            $facility->ownModuleGrants()->count(),
            'Re-provisioning after an upgrade created duplicate grants.',
        );
    }

    #[Test]
    public function revoking_a_module_stops_it_immediately(): void
    {
        $facility = Facility::factory()->edition(Edition::DentalClinic)->provisioned()->create();

        $this->assertTrue($facility->hasModule(Module::Dental));

        $facility->ownModuleGrants()
            ->where('module', Module::Dental->value)
            ->update(['revoked_at' => now()]);

        $this->assertFalse($facility->hasModule(Module::Dental));
    }
}
