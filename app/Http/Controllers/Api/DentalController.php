<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDentalChartRequest;
use App\Http\Requests\StoreDentalProcedureRequest;
use App\Http\Resources\DentalChartResource;
use App\Http\Resources\DentalProcedureResource;
use App\Models\DentalChart;
use App\Models\DentalProcedure;
use App\Models\Encounter;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class DentalController extends Controller
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * The chart for this visit, one row per tooth.
     */
    public function chart(Encounter $encounter): AnonymousResourceCollection
    {
        return DentalChartResource::collection(
            DentalChart::query()
                ->where('encounter_id', $encounter->getKey())
                ->orderBy('tooth_number')
                ->get()
        );
    }

    public function storeChart(StoreDentalChartRequest $request, Encounter $encounter): JsonResponse
    {
        $rows = DB::transaction(function () use ($request, $encounter): array {
            $saved = [];

            foreach ($request->validated('teeth') as $tooth) {
                $chart = DentalChart::updateOrCreate(
                    [
                        'facility_id' => $this->current->idOrFail(),
                        'encounter_id' => $encounter->getKey(),
                        'tooth_number' => $tooth['tooth_number'],
                    ],
                    [
                        'patient_id' => $encounter->patient_id,
                        'surfaces' => $tooth['surfaces'] ?? null,
                        'condition' => $tooth['condition'] ?? 'healthy',
                        'notes' => $tooth['notes'] ?? null,
                        'recorded_by' => $request->user()->id,
                        'recorded_at' => now(),
                    ]
                );

                $saved[] = $chart;
            }

            return $saved;
        });

        return DentalChartResource::collection($rows)
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }

    public function procedures(Encounter $encounter): AnonymousResourceCollection
    {
        return DentalProcedureResource::collection(
            DentalProcedure::query()
                ->where('encounter_id', $encounter->getKey())
                ->orderByDesc('id')
                ->get()
        );
    }

    public function storeProcedures(StoreDentalProcedureRequest $request, Encounter $encounter): JsonResponse
    {
        $rows = DB::transaction(function () use ($request, $encounter): array {
            $saved = [];

            foreach ($request->validated('procedures') as $procedure) {
                $saved[] = DentalProcedure::create([
                    'facility_id' => $this->current->idOrFail(),
                    'encounter_id' => $encounter->getKey(),
                    'patient_id' => $encounter->patient_id,
                    'consultation_id' => $encounter->consultation?->getKey(),
                    'code' => $procedure['code'] ?? null,
                    'name' => $procedure['name'],
                    'tooth_number' => $procedure['tooth_number'] ?? null,
                    'surfaces' => $procedure['surfaces'] ?? null,
                    'status' => 'planned',
                    'quoted_price' => $procedure['quoted_price'] ?? 0,
                    'notes' => $procedure['notes'] ?? null,
                    'recorded_by' => $request->user()->id,
                    'recorded_at' => now(),
                ]);
            }

            return $saved;
        });

        return DentalProcedureResource::collection($rows)
            ->response()
            ->setStatusCode(JsonResponse::HTTP_CREATED);
    }
}
