<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Models\ConsultationDiagnosis;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Models\LabOrderItem;
use App\Models\Patient;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only figures for the facility that is asking.
 *
 * Every query is tenant-scoped by the model global scope, so there is no filter
 * here to forget. A mistake in a report is a patient from another clinic
 * appearing in someone's revenue report, so nothing here is writable.
 */
class ReportingController extends Controller
{
    public function __construct(private readonly CurrentFacility $current) {}

    /**
     * The daily headline the front desk sees on arrival.
     */
    public function summary(Request $request): JsonResponse
    {
        $facility = $this->current->get();
        $from = $request->date('from') ?? now()->startOfMonth();
        $to = $request->date('to') ?? now()->endOfMonth();

        return response()->json([
            'data' => [
                'period' => [
                    'from' => $from->toDateString(),
                    'to' => $to->toDateString(),
                ],
                'facility' => [
                    'id' => $facility?->id,
                    'name' => $facility?->name,
                    'edition' => $facility?->edition->label(),
                ],
                'patients' => [
                    'total' => Patient::query()->count(),
                    'new_in_period' => Patient::query()
                        ->whereBetween('created_at', [$from, $to])
                        ->count(),
                    'deceased' => Patient::query()->where('is_deceased', true)->count(),
                ],
                'encounters' => [
                    'total_in_period' => Encounter::query()
                        ->whereBetween('registered_at', [$from, $to])
                        ->count(),
                    'by_status' => Encounter::query()
                        ->selectRaw('status, COUNT(*) as aggregate')
                        ->groupBy('status')
                        ->pluck('aggregate', 'status'),
                    'average_wait_minutes' => $this->averageWaitMinutes(),
                ],
                'revenue' => [
                    'invoiced' => (int) Invoice::query()
                        ->whereBetween('created_at', [$from, $to])
                        ->sum('total'),
                    'collected' => (int) Invoice::query()
                        ->whereBetween('created_at', [$from, $to])
                        ->sum('amount_paid'),
                    'outstanding' => (int) Invoice::query()
                        ->where('status', '!=', 'paid')
                        ->selectRaw('COALESCE(SUM(total - amount_paid), 0) as aggregate')
                        ->value('aggregate'),
                ],
                'inpatients' => [
                    'currently_admitted' => Admission::query()->where('status', 'admitted')->count(),
                ],
                'laboratory' => [
                    'outstanding_results' => LabOrderItem::query()
                        ->where('status', 'pending')
                        ->count(),
                    'critical_results' => LabOrderItem::query()
                        ->where('result_flag', 'critical')
                        ->count(),
                ],
            ],
        ]);
    }

    /**
     * What the clinic is actually treating, for planning drugs and rotas.
     */
    public function topDiagnoses(Request $request): JsonResponse
    {
        $limit = min((int) $request->integer('limit', 20), 100);
        $from = $request->date('from') ?? now()->subMonths(6);
        $to = $request->date('to') ?? now();

        $rows = ConsultationDiagnosis::query()
            ->whereBetween('consultation_diagnoses.created_at', [$from, $to])
            ->selectRaw('LOWER(description) as diagnosis, COUNT(*) as occurrences')
            ->groupBy('diagnosis')
            ->orderByDesc('occurrences')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $rows->map(fn ($row): array => [
                'diagnosis' => $row->diagnosis,
                'occurrences' => (int) $row->occurrences,
            ]),
        ]);
    }

    /**
     * Revenue by day, for the till reconciliation.
     */
    public function revenueByDay(Request $request): JsonResponse
    {
        $from = $request->date('from') ?? now()->startOfMonth();
        $to = $request->date('to') ?? now();

        $rows = Invoice::query()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as day, SUM(total) as invoiced, SUM(amount_paid) as collected')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return response()->json([
            'data' => $rows->map(fn ($row): array => [
                'day' => $row->day,
                'invoiced' => (int) $row->invoiced,
                'collected' => (int) $row->collected,
            ]),
        ]);
    }

    /**
     * Minutes from registration to the clinician starting the visit.
     *
     * Returned as an integer or null, because a handful of visits in a month
     * should not silently move the average to suggest a queue problem that is
     * not there.
     */
    private function averageWaitMinutes(): ?int
    {
        $started = Encounter::query()
            ->whereNotNull('started_at')
            ->whereBetween('registered_at', [now()->subDays(30), now()])
            ->get(['registered_at', 'started_at']);

        if ($started->isEmpty()) {
            return null;
        }

        $total = $started->sum(
            fn (Encounter $encounter): int => max(
                0,
                $encounter->registered_at->diffInMinutes($encounter->started_at),
            )
        );

        return intdiv($total, $started->count());
    }
}
