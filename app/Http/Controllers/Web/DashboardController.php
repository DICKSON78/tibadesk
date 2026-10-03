<?php

namespace App\Http\Controllers\Web;

use App\Enums\Module;
use App\Http\Controllers\Controller;
use App\Models\Encounter;
use App\Models\Patient;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, CurrentFacility $current): Response
    {
        $facility = $current->get();
        $user = $request->user();

        $stats = [
            'patients' => Patient::query()->whereDate('created_at', today())->count(),
            'encounters' => Encounter::query()->whereDate('registered_at', today())->count(),
            'waiting' => Encounter::query()->where('status', 'registered')->count(),
            'in_consultation' => Encounter::query()->where('status', 'in_progress')->count(),
        ];

        $recent = Encounter::query()
            ->with('patient')
            ->latest('registered_at')
            ->limit(8)
            ->get()
            ->map(fn (Encounter $encounter): array => [
                'id' => $encounter->id,
                'encounter_number' => $encounter->encounter_number,
                'patient_name' => $encounter->patient->fullName(),
                'patient_number' => $encounter->patient->patient_number,
                'status' => $encounter->status,
                'reason' => $encounter->reason_for_visit,
                'registered_at' => $encounter->registered_at?->format('H:i'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentEncounters' => $recent,
            'can' => [
                'registerPatient' => $user?->canPerform('patients.register', Module::Registration) ?? false,
                'consult' => $user?->canPerform('consultations.create', Module::Consultation) ?? false,
            ],
            'licence' => [
                'edition' => $facility?->edition->label(),
                'expires_at' => $facility?->licence_expires_at?->toDateString(),
                'days_remaining' => $facility?->licence_expires_at === null
                    ? null
                    : (int) now()->startOfDay()->diffInDays($facility->licence_expires_at->startOfDay(), false),
            ],
        ]);
    }
}
