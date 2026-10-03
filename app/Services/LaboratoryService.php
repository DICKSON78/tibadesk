<?php

namespace App\Services;

use App\Models\Encounter;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabTest;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Ordering tests and writing their results.
 */
class LaboratoryService
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * @param  list<int>  $labTestIds
     */
    public function orderTests(
        Encounter $encounter,
        array $labTestIds,
        ?int $userId = null,
        string $priority = 'routine',
        ?string $notes = null,
    ): LabOrder {
        if ($labTestIds === []) {
            throw new RuntimeException('Select at least one test to request.');
        }

        // One order per request keeps a stat test from sitting behind a routine
        // one in the same queue.
        return DB::transaction(function () use ($encounter, $labTestIds, $userId, $priority, $notes): LabOrder {
            $order = LabOrder::create([
                'facility_id' => $this->current->idOrFail(),
                'encounter_id' => $encounter->getKey(),
                'patient_id' => $encounter->patient_id,
                'status' => 'ordered',
                'priority' => $priority,
                'clinical_notes' => $notes,
                'ordered_by' => $userId,
                'ordered_at' => now(),
            ]);

            foreach (array_unique($labTestIds) as $testId) {
                $test = LabTest::query()->where('is_active', true)->find($testId);

                if ($test === null) {
                    throw new RuntimeException("Laboratory test #{$testId} is not available.");
                }

                LabOrderItem::create([
                    'facility_id' => $this->current->idOrFail(),
                    'lab_order_id' => $order->getKey(),
                    'lab_test_id' => $test->getKey(),
                    'status' => 'pending',
                ]);
            }

            return $order;
        });
    }

    /**
     * Record one result. The header is recomputed from its lines, so a result
     * entered here is what decides whether the order reads as outstanding.
     */
    public function recordResult(
        LabOrderItem $item,
        ?float $value,
        ?string $text,
        ?string $flag,
        ?string $notes,
        int $userId,
    ): LabOrderItem {
        if ($value === null && ($text === null || trim($text) === '')) {
            throw new RuntimeException('A result needs a value or a written description.');
        }

        DB::transaction(function () use ($item, $value, $text, $flag, $notes, $userId): void {
            $item->forceFill([
                'status' => 'resulted',
                'result_value' => $value,
                'result_text' => $text,
                'result_flag' => $flag,
                'result_notes' => $notes,
                'resulted_by' => $userId,
                'resulted_at' => now(),
            ])->save();

            $item->labOrder->refreshStatus();
        });

        return $item;
    }

    /**
     * The technician's worklist: outstanding tests, most urgent first.
     */
    public function worklist(?string $status = null)
    {
        return LabOrder::query()
            ->with(['items.labTest', 'encounter.patient'])
            ->when($status !== null, fn ($query) => $query->where('status', $status))
            ->when(
                $status === null,
                // Only what is still outstanding, urgent first.
                fn ($query) => $query->whereHas('items', fn ($q) => $q->where('status', 'pending')),
            )
            ->orderByRaw(
                "CASE priority WHEN 'stat' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END, ordered_at"
            )
            ->paginate(50);
    }
}
