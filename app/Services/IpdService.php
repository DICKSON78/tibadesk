<?php

namespace App\Services;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\Encounter;
use App\Models\Ward;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Beds and inpatient stays.
 */
class IpdService
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * Admit a patient to a bed.
     *
     * The bed is claimed in the same statement that checks it, so two admissions
     * racing for the last bed cannot both be told it is theirs.
     */
    public function admit(
        Encounter $encounter,
        ?int $bedId,
        int $userId,
        ?string $diagnosis = null,
    ): Admission {
        return DB::transaction(function () use ($encounter, $bedId, $userId, $diagnosis): Admission {
            $open = Admission::query()
                ->where('encounter_id', $encounter->getKey())
                ->where('status', 'admitted')
                ->first();

            if ($open !== null) {
                throw new RuntimeException('This patient is already admitted under this visit.');
            }

            $bed = null;

            if ($bedId !== null) {
                $bed = Bed::query()->find($bedId);

                if ($bed === null) {
                    throw new RuntimeException("Bed #{$bedId} does not exist.");
                }

                $claimed = Bed::query()
                    ->whereKey($bed->getKey())
                    ->where('status', 'available')
                    ->update(['status' => 'occupied']);

                if ($claimed !== 1) {
                    throw new RuntimeException("Bed {$bed->bed_number} is no longer free.");
                }
            }

            return Admission::create([
                'facility_id' => $this->current->idOrFail(),
                'encounter_id' => $encounter->getKey(),
                'patient_id' => $encounter->patient_id,
                'bed_id' => $bed?->getKey(),
                'status' => 'admitted',
                'admission_diagnosis' => $diagnosis,
                'admitted_by' => $userId,
                'admitted_at' => now(),
            ]);
        });
    }

    /**
     * Discharge, freeing the bed.
     */
    public function discharge(Admission $admission, int $userId, ?string $summary = null): Admission
    {
        return DB::transaction(function () use ($admission, $userId, $summary): Admission {
            $admission->refresh();

            if (! $admission->isAdmitted()) {
                throw new RuntimeException('This admission is already closed.');
            }

            if ($admission->bed_id !== null) {
                Bed::query()
                    ->whereKey($admission->bed_id)
                    ->update(['status' => 'available']);
            }

            $admission->forceFill([
                'status' => 'discharged',
                'discharged_by' => $userId,
                'discharged_at' => now(),
                'discharge_summary' => $summary,
            ])->save();

            return $admission;
        });
    }

    /**
     * Occupancy per ward, for the front desk to see at a glance.
     *
     * @return list<array<string, mixed>>
     */
    public function occupancy(): array
    {
        return Ward::query()
            ->withCount([
                'beds',
                'beds as available_beds_count' => fn ($q) => $q->where('status', 'available'),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn ($ward): array => [
                'id' => $ward->id,
                'name' => $ward->name,
                'total_beds' => $ward->beds_count,
                'available_beds' => $ward->available_beds_count,
                'occupied_beds' => $ward->beds_count - $ward->available_beds_count,
            ])
            ->all();
    }
}
