<?php

namespace App\Pharmacy\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Pharmacy\Http\Resources\TransferResource;
use App\Pharmacy\Models\StockTransfer;
use App\Pharmacy\Services\TransferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use RuntimeException;

class TransferController extends Controller
{
    public function __construct(private readonly TransferService $transfers) {}

    /**
     * @return AnonymousResourceCollection<StockTransfer, TransferResource>
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return TransferResource::collection(
            StockTransfer::query()
                ->with(['origin', 'destination', 'items.medicine'])
                ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
                ->orderByDesc('id')
                ->paginate(50)
                ->withQueryString(),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_location' => ['required', 'integer'],
            'to_location' => ['required', 'integer', 'different:from_location'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_batch_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
        ]);

        try {
            $transfer = $this->transfers->request($validated, $request->user()->id);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return TransferResource::make($transfer->load(['origin', 'destination', 'items.medicine']))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Approve and ship in one step: the stock leaves the source store.
     */
    public function ship(StockTransfer $stockTransfer): JsonResponse
    {
        try {
            $transfer = $this->transfers->ship($stockTransfer, request()->user()->id);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return TransferResource::make($transfer->load(['origin', 'destination', 'items.medicine']))->response();
    }

    /**
     * Take delivery. A short delivery credits only what arrived, so the
     * difference never appears as stock at the destination.
     */
    public function receive(Request $request, StockTransfer $stockTransfer): JsonResponse
    {
        $received = $request->validate([
            'items' => ['nullable', 'array'],
            'items.*' => ['integer', 'min:0'],
        ])['items'] ?? null;

        try {
            $transfer = $this->transfers->receive($stockTransfer, $received, $request->user()->id);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return TransferResource::make($transfer->load(['origin', 'destination', 'items.medicine']))->response();
    }
}
