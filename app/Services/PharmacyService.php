<?php

namespace App\Services;

use App\Models\Dispense;
use App\Models\DispenseItem;
use App\Models\Encounter;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Turning a prescription into medicine actually handed over.
 *
 * Stock is decremented in the same statement that checks it, so two dispensers
 * selling the last tablet cannot both succeed.
 */
class PharmacyService
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * Dispense the whole prescription for an encounter.
     *
     * Refuses up front if anything is short, rather than handing over part of a
     * course and recording the rest as done: a patient who leaves with two of
     * three days of antibiotics has not been treated.
     *
     * @throws RuntimeException when the encounter has no prescription to fill
     */
    public function dispensePrescription(Encounter $encounter, ?int $userId = null, ?string $notes = null): Dispense
    {
        $prescriptions = $encounter->consultation?->prescriptions()
            ->where('status', 'pending')
            ->with('prescribedBy')
            ->get() ?? collect();

        if ($prescriptions->isEmpty()) {
            throw new RuntimeException('This encounter has no prescription waiting to be dispensed.');
        }

        return DB::transaction(function () use ($encounter, $prescriptions, $userId, $notes): Dispense {
            $dispense = Dispense::create([
                'facility_id' => $this->current->idOrFail(),
                'encounter_id' => $encounter->getKey(),
                'patient_id' => $encounter->patient_id,
                'status' => 'completed',
                'notes' => $notes,
                'dispensed_by' => $userId,
                'dispensed_at' => now(),
            ]);

            foreach ($prescriptions as $prescription) {
                $medicine = $this->matchToCatalogue($prescription);

                if ($medicine === null) {
                    throw new RuntimeException(
                        "{$prescription->medicine} is not in the pharmacy catalogue and cannot be dispensed."
                    );
                }

                $this->takeFromShelf($medicine, $prescription->quantity, $medicine->unit_price);

                DispenseItem::create([
                    'facility_id' => $this->current->idOrFail(),
                    'dispense_id' => $dispense->getKey(),
                    'medicine_id' => $medicine->getKey(),
                    'prescription_id' => $prescription->getKey(),
                    'quantity' => $prescription->quantity,
                    'unit_price' => $medicine->unit_price,
                    'line_total' => $medicine->unit_price * $prescription->quantity,
                ]);

                $prescription->forceFill([
                    'status' => 'dispensed',
                    'dispensed_by' => $userId,
                    'dispensed_at' => now(),
                ])->save();
            }

            return $dispense;
        });
    }

    /**
     * Ad-hoc issue, for walk-ins and for medicines prescribed before the
     * pharmacy module was switched on.
     *
     * @param  list<array{medicine_id: int, quantity: int}>  $lines
     */
    public function dispenseItems(Encounter $encounter, array $lines, ?int $userId = null, ?string $notes = null): Dispense
    {
        if ($lines === []) {
            throw new RuntimeException('Nothing was selected to dispense.');
        }

        return DB::transaction(function () use ($encounter, $lines, $userId, $notes): Dispense {
            $dispense = Dispense::create([
                'facility_id' => $this->current->idOrFail(),
                'encounter_id' => $encounter->getKey(),
                'patient_id' => $encounter->patient_id,
                'status' => 'completed',
                'notes' => $notes,
                'dispensed_by' => $userId,
                'dispensed_at' => now(),
            ]);

            foreach ($lines as $line) {
                $medicine = Medicine::query()->findOrFail($line['medicine_id']);
                $quantity = max(1, (int) $line['quantity']);

                $this->takeFromShelf($medicine, $quantity, $medicine->unit_price);

                DispenseItem::create([
                    'facility_id' => $this->current->idOrFail(),
                    'dispense_id' => $dispense->getKey(),
                    'medicine_id' => $medicine->getKey(),
                    'quantity' => $quantity,
                    'unit_price' => $medicine->unit_price,
                    'line_total' => $medicine->unit_price * $quantity,
                ]);
            }

            return $dispense;
        });
    }

    /**
     * Find the catalogue entry a free-text generic refers to.
     *
     * Prescriptions are written as a human reads them, so the match is on the
     * name a clinician typed rather than on a code they had to look up.
     */
    private function matchToCatalogue(Prescription $prescription): ?Medicine
    {
        $needle = mb_strtolower(trim($prescription->medicine));

        return Medicine::query()
            ->where('is_active', true)
            ->where(function ($query) use ($needle): void {
                $query->whereRaw('LOWER(name) = ?', [$needle])
                    ->orWhereRaw('LOWER(name) LIKE ?', [$needle.'%'])
                    ->orWhereRaw('LOWER(generic_name) = ?', [$needle]);
            })
            ->first();
    }

    /**
     * @throws RuntimeException when the shelf does not hold enough
     */
    private function takeFromShelf(Medicine $medicine, int $quantity, int $unitPrice): void
    {
        $stock = $medicine->stock()->firstOrFail();

        if (! $stock->adjustBy(-$quantity)) {
            throw new RuntimeException(
                "Only {$stock->quantity_on_hand} of {$medicine->name} left; {$quantity} were requested."
            );
        }
    }
}
