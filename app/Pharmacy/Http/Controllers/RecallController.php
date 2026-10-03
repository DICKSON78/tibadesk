<?php

namespace App\Pharmacy\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Pharmacy\Http\Resources\RecallResource;
use App\Pharmacy\Models\MedicineMovement;
use App\Pharmacy\Models\MedicineRecall;
use App\Pharmacy\Models\MedicineRecallDisposition;
use App\Pharmacy\Services\StockLedger;
use App\Services\DocumentNumberGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use RuntimeException;

/**
 * Manufacturer and regulator recalls.
 *
 * Phermex stores recalls and nothing reads them, so a recalled batch keeps
 * dispensing to patients indefinitely. A recall raised here immediately blocks
 * the batch in the ledger, and the stock is pulled back through the same
 * journal as every other movement.
 */
class RecallController extends Controller
{
    public function __construct(private readonly StockLedger $ledger) {}

    /**
     * @return AnonymousResourceCollection<MedicineRecall, RecallResource>
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return RecallResource::collection(
            MedicineRecall::query()
                ->with(['medicine', 'batch'])
                ->when($request->boolean('open'), fn ($query) => $query->open())
                ->orderByDesc('id')
                ->paginate(50)
                ->withQueryString(),
        );
    }

    /**
     * Raise a recall. The batch is pulled out of available stock in the same
     * transaction, so it stops being dispensable the moment this returns.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medicine_batch_id' => ['required', 'integer'],
            'recall_reason' => ['required', 'string', 'max:30'],
            'severity' => ['required', 'string', 'max:20'],
            'manufacturer' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            $recall = DB::transaction(function () use ($request, $validated): MedicineRecall {
                $batch = $this->ledger->findBatch((int) $validated['medicine_batch_id']);
                $affected = $batch->quantity_available;

                $recall = MedicineRecall::create([
                    'medicine_id' => $batch->medicine_id,
                    'batch_id' => $batch->id,
                    'reference_number' => app(DocumentNumberGenerator::class)
                        ->nextForCurrent(DocumentNumberGenerator::RECALL),
                    'recall_reason' => $validated['recall_reason'],
                    'severity' => $validated['severity'],
                    'manufacturer' => $validated['manufacturer'] ?? null,
                    'issued_on' => now()->toDateString(),
                    'status' => MedicineRecall::IN_PROGRESS,
                    'affected_quantity' => $affected,
                    'notes' => $validated['notes'] ?? null,
                    'reported_by' => $request->user()->id,
                ]);

                if ($affected > 0) {
                    // A recall is about the batch, not one shelf, so the whole
                    // batch comes off wherever it is held.
                    $this->ledger->withdrawBatch(
                        batch: $batch,
                        movementType: MedicineMovement::RECALL,
                        userId: $request->user()->id,
                        referenceType: 'medicine_recall',
                        referenceNumber: $recall->reference_number,
                    );
                }

                return $recall;
            });
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return RecallResource::make($recall->load(['medicine', 'batch']))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Record what happened to the recalled stock, and close the recall once it
     * is all accounted for.
     */
    public function dispose(Request $request, MedicineRecall $recall): JsonResponse
    {
        $validated = $request->validate([
            'disposition' => ['required', 'string', Rule::in(array_keys(self::dispositions()))],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $recall = DB::transaction(function () use ($recall, $validated): MedicineRecall {
            if (! $recall->isOpen()) {
                throw new RuntimeException('This recall is already closed.');
            }

            $returned = $recall->returned_quantity + (int) $validated['quantity'];

            if ($returned > $recall->affected_quantity) {
                throw new RuntimeException('That is more recalled stock than is outstanding.');
            }

            MedicineRecallDisposition::create([
                'medicine_recall_id' => $recall->id,
                'disposition' => $validated['disposition'],
                'quantity' => (int) $validated['quantity'],
                'unit_cost' => $recall->batch?->cost_price ?? 0,
                'disposed_at' => now(),
            ]);

            $recall->update([
                'returned_quantity' => $returned,
                'status' => $recall->quantityOutstanding() === 0
                    ? MedicineRecall::CLOSED
                    : MedicineRecall::IN_PROGRESS,
            ]);

            return $recall;
        });

        return RecallResource::make($recall->load(['medicine', 'batch']))->response();
    }

    /**
     * @return array<string, string>
     */
    public static function dispositions(): array
    {
        return [
            'returned_to_supplier' => 'Returned to supplier',
            'destroyed' => 'Destroyed on site',
            'held' => 'Held pending instruction',
            'released_for_use' => 'Released for use',
        ];
    }
}
