<?php

namespace App\Pharmacy\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\MedicineResource;
use App\Models\Medicine;
use App\Pharmacy\Http\Requests\StoreWriteoffRequest;
use App\Pharmacy\Http\Resources\BatchResource;
use App\Pharmacy\Http\Resources\MovementResource;
use App\Pharmacy\Http\Resources\StockLocationResource;
use App\Pharmacy\Models\MedicineBatch;
use App\Pharmacy\Models\MedicineMovement;
use App\Pharmacy\Models\MedicineWriteoff;
use App\Pharmacy\Models\StockLocation;
use App\Pharmacy\Services\StockLedger;
use App\Services\DocumentNumberGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Reading the shelves: what is on hand, what is about to expire, what has
 * been recalled, and the journal explaining how it got that way.
 */
class StockController extends Controller
{
    public function __construct(private readonly StockLedger $ledger) {}

    /**
     * @return AnonymousResourceCollection<MedicineBatch, BatchResource>
     */
    public function batches(Request $request): AnonymousResourceCollection
    {
        $batches = MedicineBatch::query()
            ->with(['medicine', 'recalls'])
            ->when($request->filled('medicine_id'), fn ($query) => $query->where('medicine_id', $request->integer('medicine_id')))
            ->when($request->boolean('in_stock'), fn ($query) => $query->where('quantity_available', '>', 0))
            ->when($request->boolean('expired'), fn ($query) => $query->whereDate('expiry_date', '<', now()->toDateString()))
            ->when($request->boolean('expiring_soon'), fn ($query) => $query->expiringWithin(90)->where('quantity_available', '>', 0))
            ->when($request->boolean('recalled'), fn ($query) => $query->whereHas('recalls', fn ($q) => $q->open()))
            ->orderBy('expiry_date')
            ->orderBy('id')
            ->paginate(50)
            ->withQueryString();

        return BatchResource::collection($batches);
    }

    /**
     * The stock journal, newest first, filtered to one medicine if asked.
     *
     * @return AnonymousResourceCollection<MedicineMovement, MovementResource>
     */
    public function movements(Request $request): AnonymousResourceCollection
    {
        return MovementResource::collection(
            MedicineMovement::query()
                ->with(['medicine', 'batch', 'performer'])
                ->when($request->filled('medicine_id'), fn ($query) => $query->where('medicine_id', $request->integer('medicine_id')))
                ->when($request->filled('movement_type'), fn ($query) => $query->where('movement_type', $request->string('movement_type')))
                ->when($request->filled('reference_number'), fn ($query) => $query->where('reference_number', $request->string('reference_number')))
                ->orderByDesc('id')
                ->paginate(75)
                ->withQueryString(),
        );
    }

    /**
     * Everything a dispensary needs to act on before it runs out: what is
     * below its reorder level, what is expiring, what has been recalled.
     */
    public function alerts(Request $request): JsonResponse
    {
        $ledger = $this->ledger;

        $expiring = MedicineBatch::query()
            ->with('medicine')
            ->where('quantity_available', '>', 0)
            ->expiringWithin(90)
            ->orderBy('expiry_date')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => [
                'expiring_soon' => BatchResource::collection($expiring)->resolve($request),
                'recalled' => BatchResource::collection(
                    MedicineBatch::query()
                        ->with(['medicine', 'recalls'])
                        ->whereHas('recalls', fn ($q) => $q->open())
                        ->orderByDesc('id')
                        ->paginate(50),
                )->resolve($request),
                'below_reorder' => $this->belowReorder($request, $ledger),
            ],
        ]);
    }

    /**
     * @return AnonymousResourceCollection<Medicine, MedicineResource>
     */
    public function belowReorder(Request $request, StockLedger $ledger): AnonymousResourceCollection
    {
        return MedicineResource::collection(
            Medicine::query()
                ->where('is_active', true)
                ->whereHas('stock', fn ($q) => $q->whereColumn('quantity_on_hand', '<=', 'reorder_level'))
                ->orderBy('name')
                ->limit(100)
                ->get(),
        );
    }

    /**
     * Write stock off: expired, damaged, stolen or mislaid.
     *
     * The whole write-off is one transaction. Phermex runs three statements
     * with no transaction, so a failure can leave the quantity changed with no
     * record, or a record with the quantity untouched.
     */
    public function storeWriteoff(StoreWriteoffRequest $request): JsonResponse
    {
        $ledger = $this->ledger;

        try {
            $writeoff = DB::transaction(function () use ($request, $ledger): MedicineWriteoff {
                $batch = $ledger->findBatch((int) $request->validated('medicine_batch_id'));

                $quantity = (int) $request->validated('quantity');
                $unitCost = $batch->cost_price;

                $writeoff = MedicineWriteoff::create([
                    'medicine_id' => $batch->medicine_id,
                    'batch_id' => $batch->id,
                    'reference_number' => app(DocumentNumberGenerator::class)
                        ->nextForCurrent(DocumentNumberGenerator::WRITEOFF),
                    'reason' => $request->validated('reason'),
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'total_loss' => $quantity * $unitCost,
                    'disposal_method' => $request->validated('disposal_method') ?? MedicineWriteoff::DEFAULT_DISPOSAL_METHOD,
                    'written_off_on' => now()->toDateString(),
                    'notes' => $request->validated('notes'),
                    'reported_by' => $request->user()->id,
                ]);

                $ledger->issue(
                    medicineId: $batch->medicine_id,
                    quantity: $quantity,
                    movementType: $writeoff->reason === MedicineWriteoff::EXPIRED
                        ? MedicineMovement::EXPIRY
                        : MedicineMovement::WRITEOFF,
                    userId: $request->user()->id,
                    locationId: (int) $request->validated('location_id'),
                    referenceType: 'medicine_writeoff',
                    referenceNumber: $writeoff->reference_number,
                    // The write-off is booked against this exact batch, so the
                    // ledger must take from this batch and not from whichever
                    // sibling happens to expire first. Expired stock is
                    // included because writing off dead stock is the point.
                    pinBatchId: $batch->id,
                    includeExpired: true,
                );

                return $writeoff;
            });
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json([
            'data' => [
                'id' => $writeoff->id,
                'reference_number' => $writeoff->reference_number,
                'quantity' => $writeoff->quantity,
                'total_loss' => $writeoff->total_loss,
            ],
        ], 201);
    }

    /**
     * @return AnonymousResourceCollection<StockLocation, JsonResource>
     */
    public function locations(): AnonymousResourceCollection
    {
        return StockLocationResource::collection(
            StockLocation::query()->where('is_active', true)->orderBy('name')->get(),
        );
    }
}
