<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDispenseRequest;
use App\Http\Requests\StoreMedicineRequest;
use App\Http\Resources\DispenseResource;
use App\Http\Resources\MedicineResource;
use App\Models\Dispense;
use App\Models\Encounter;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Services\PharmacyService;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PharmacyController extends Controller
{
    public function __construct(
        private readonly PharmacyService $pharmacy,
        private readonly CurrentFacility $current,
    ) {}

    /**
     * The catalogue, with what is on the shelf beside each entry.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $medicines = Medicine::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $term = $request->string('search')->toString();
                $query->where(function ($q) use ($term): void {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('generic_name', 'like', "%{$term}%")
                        ->orWhere('code', 'like', "%{$term}%");
                });
            })
            ->when($request->boolean('low_stock'), fn ($query) => $query->whereHas(
                'stock',
                fn ($q) => $q->whereColumn('quantity_on_hand', '<=', 'reorder_level'),
            ))
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        return MedicineResource::collection($medicines);
    }

    public function store(StoreMedicineRequest $request): JsonResponse
    {
        $medicine = DB::transaction(function () use ($request): Medicine {
            $medicine = Medicine::create([
                'facility_id' => $this->current->idOrFail(),
                ...$request->safe()->all(),
            ]);

            // Every catalogue entry starts with a shelf row, so dispensing
            // never has to cope with a medicine that has never been counted.
            $medicine->stock()->create([
                'facility_id' => $this->current->idOrFail(),
                'medicine_id' => $medicine->getKey(),
                'quantity_on_hand' => 0,
                'reorder_level' => 10,
            ]);

            return $medicine;
        });

        return (new MedicineResource($medicine))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    /**
     * Prescriptions waiting to be filled.
     */
    public function queue(): AnonymousResourceCollection
    {
        return Prescription::resource()
            ->where('status', 'pending')
            ->whereHas('consultation.encounter', fn ($q) => $q->whereNotIn('status', ['cancelled', 'completed']))
            ->with(['prescribedBy', 'consultation.encounter.patient'])
            ->latest()
            ->paginate(50);
    }

    public function dispense(StoreDispenseRequest $request, Encounter $encounter): JsonResponse
    {
        try {
            $dispense = $request->boolean('prescription')
                ? $this->pharmacy->dispensePrescription(
                    $encounter,
                    $request->user()->id,
                    $request->string('notes')->toString() ?: null,
                )
                : $this->pharmacy->dispenseItems(
                    $encounter,
                    $request->validated('items'),
                    $request->user()->id,
                    $request->string('notes')->toString() ?: null,
                );
        } catch (RuntimeException $e) {
            // Stock and matching failures are the pharmacist's problem to fix,
            // not a server fault.
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new DispenseResource($dispense->load('items.medicine')))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function dispenses(): AnonymousResourceCollection
    {
        return DispenseResource::collection(
            Dispense::query()
                ->with(['items.medicine', 'dispensedBy'])
                ->latest('dispensed_at')
                ->paginate(50)
        );
    }
}
