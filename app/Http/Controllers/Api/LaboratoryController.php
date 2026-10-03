<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLabOrderRequest;
use App\Http\Requests\StoreLabResultRequest;
use App\Http\Resources\LabOrderResource;
use App\Http\Resources\LabTestResource;
use App\Models\Encounter;
use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabTest;
use App\Services\LaboratoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class LaboratoryController extends Controller
{
    public function __construct(private readonly LaboratoryService $laboratory) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $tests = LabTest::query()
            ->when($request->filled('search'), function ($query) use ($request): void {
                $term = $request->string('search')->toString();
                $query->where(function ($q) use ($term): void {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('code', 'like', "%{$term}%");
                });
            })
            ->orderBy('category')
            ->orderBy('name')
            ->paginate(100)
            ->withQueryString();

        return LabTestResource::collection($tests);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:40'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:80'],
            'unit' => ['nullable', 'string', 'max:40'],
            'unit_price' => ['required', 'integer', 'min:0', 'max:100000000'],
            'turnaround_hours' => ['nullable', 'integer', 'min:1', 'max:720'],
        ]);

        $test = LabTest::create($validated);

        return response()->json(['data' => $test], JsonResponse::HTTP_CREATED);
    }

    /**
     * The technician's queue: outstanding orders, stat first.
     */
    public function worklist(Request $request): AnonymousResourceCollection
    {
        $orders = $this->laboratory->worklist(
            $request->filled('status') ? $request->string('status')->toString() : null,
        );

        return LabOrderResource::collection($orders);
    }

    public function order(StoreLabOrderRequest $request, Encounter $encounter): JsonResponse
    {
        try {
            $order = $this->laboratory->orderTests(
                $encounter,
                $request->validated('lab_test_ids'),
                $request->user()->id,
                $request->string('priority')->toString() ?: 'routine',
                $request->string('clinical_notes')->toString() ?: null,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return (new LabOrderResource($order->load('items.labTest')))
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function show(LabOrder $order): LabOrderResource
    {
        return new LabOrderResource($order->load(['items.labTest', 'encounter.patient']));
    }

    public function result(StoreLabResultRequest $request, LabOrderItem $item): JsonResponse
    {
        try {
            $item = $this->laboratory->recordResult(
                $item,
                $request->input('result_value') === null ? null : (float) $request->input('result_value'),
                $request->string('result_text')->toString() ?: null,
                $request->string('result_flag')->toString() ?: null,
                $request->string('result_notes')->toString() ?: null,
                $request->user()->id,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'data' => [
                'id' => $item->id,
                'status' => $item->status,
                'result_value' => $item->result_value,
                'result_flag' => $item->result_flag,
                'order_status' => $item->labOrder->status,
            ],
        ]);
    }
}
