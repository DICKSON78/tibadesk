<?php

namespace App\Http\Controllers\Api;

use App\Enums\Edition;
use App\Enums\Module;
use App\Http\Controllers\Controller;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;

/**
 * What this facility is licensed to run, and until when.
 *
 * Read-only on purpose. Entitlements come from the contract the customer
 * bought, so letting a facility add a module to itself would make the
 * commercial side meaningless.
 */
class LicensingController extends Controller
{
    public function __construct(private readonly CurrentFacility $current) {}

    public function show(): JsonResponse
    {
        $facility = $this->current->get();

        if ($facility === null) {
            return response()->json(['message' => 'No facility is bound to this request.'], 422);
        }

        $expires = $facility->licence_expires_at;
        $daysRemaining = $expires === null
            ? null
            : (int) now()->startOfDay()->diffInDays($expires->startOfDay(), false);

        $held = $facility->enabledModuleValues();

        // Edition::modules() yields Module cases, so they are compared by value
        // like everywhere else rather than as objects.
        $expected = array_map(
            static fn (Module $module): string => $module->value,
            $facility->edition->modules(),
        );

        return response()->json([
            'data' => [
                'facility' => [
                    'id' => $facility->id,
                    'name' => $facility->name,
                    'status' => $facility->status->value,
                    'status_label' => $facility->status->label(),
                ],
                'edition' => [
                    'value' => $facility->edition->value,
                    'label' => $facility->edition->label(),
                ],
                'licence' => [
                    'starts_at' => $facility->licence_starts_at?->toDateString(),
                    'expires_at' => $expires?->toDateString(),
                    'days_remaining' => $daysRemaining,
                    'is_expired' => $daysRemaining !== null && $daysRemaining < 0,
                    // A week out is when somebody needs to be told, not when
                    // the licence actually lapses.
                    'expires_soon' => $daysRemaining !== null && $daysRemaining >= 0 && $daysRemaining <= 7,
                ],
                'modules' => [
                    'held' => $held,
                    'expected' => $expected,
                    // A module the edition includes but this facility has lost,
                    // e.g. after a support downgrade. Worth surfacing.
                    'missing' => array_values(array_diff($expected, $held)),
                    'details' => collect(Module::cases())
                        ->filter(fn (Module $module): bool => in_array($module->value, $expected, true))
                        ->map(fn (Module $module): array => [
                            'value' => $module->value,
                            'name' => $module->label(),
                            'held' => in_array($module->value, $held, true),
                            'is_core' => in_array($module, Module::core(), true),
                        ])
                        ->values(),
                ],
            ],
        ]);
    }

    /**
     * The catalogue, for a salesperson comparing editions.
     */
    public function catalogue(): JsonResponse
    {
        return response()->json([
            'data' => collect(Edition::cases())->map(fn (Edition $edition): array => [
                'value' => $edition->value,
                'label' => $edition->label(),
                'modules' => collect($edition->modules())
                    ->map(fn (Module $module): string => $module->value)
                    ->all(),
                'module_names' => collect($edition->modules())
                    ->map(fn (Module $module): string => $module->label())
                    ->all(),
            ])->values(),
        ]);
    }
}
