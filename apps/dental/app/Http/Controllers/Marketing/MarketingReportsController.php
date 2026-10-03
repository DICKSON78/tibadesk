<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\CommunicationLog;
use App\Models\Marketing\Event;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MarketingReportsController extends Controller
{
    use ApiResponse;

    public function campaignPerformance(Request $request)
    {
        $data = [
            'summary' => [
                'total_campaigns' => 0,
                'active_campaigns' => 0,
                'total_views' => 0,
                'total_clicks' => 0,
                'total_conversions' => 0,
                'average_ctr' => 0,
            ],
            'campaigns' => [],
        ];

        $events = Event::orderBy('event_date', 'desc')->get();

        foreach ($events as $event) {
            if ($event->status === 'Active' && !$event->cancelled_at) {
                $data['summary']['active_campaigns']++;
            }

            $data['campaigns'][] = [
                'name' => $event->title ?: ($event->event_type ?: 'Campaign'),
                'description' => $event->description ?: 'No description available',
                'status' => $event->status,
                'views' => 0,
                'clicks' => 0,
                'ctr' => 0,
            ];
        }

        $data['summary']['total_campaigns'] = count($data['campaigns']);
        $data['summary']['total_views'] = collect($data['campaigns'])->sum('views');
        $data['summary']['total_clicks'] = collect($data['campaigns'])->sum('clicks');
        $data['summary']['average_ctr'] = $data['summary']['total_views'] > 0
            ? $data['summary']['total_clicks'] / $data['summary']['total_views']
            : 0;

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function communicationAnalytics(Request $request)
    {
        $logs = CommunicationLog::all();

        $by_type = $logs->groupBy('communication_type')->map(function ($group) use ($logs) {
            return [
                'type' => $group->first()->communication_type ?: 'Unknown',
                'count' => $group->count(),
                'percentage' => $logs->count() > 0 ? $group->count() / $logs->count() : 0,
            ];
        })->values()->all();

        $by_status = $logs->groupBy('communication_direction')->map(function ($group) use ($logs) {
            return [
                'status' => $group->first()->communication_direction ?: 'Unknown',
                'count' => $group->count(),
                'percentage' => $logs->count() > 0 ? $group->count() / $logs->count() : 0,
            ];
        })->values()->all();

        $data = [
            'summary' => [
                'total_communications' => $logs->count(),
                'successful_communications' => $logs->count(),
                'failed_communications' => 0,
                'response_rate' => $logs->count() > 0 ? 1 : 0,
                'average_response_time' => 0,
            ],
            'communications_by_type' => $by_type,
            'communications_by_status' => $by_status,
            'response_times' => [],
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function leadGeneration(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $patients = Patient::query()
            ->when($clinic_id, function ($q) use ($clinic_id) {
                $q->whereHas('check_ins', function ($q2) use ($clinic_id) {
                    $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                        $q3->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->with('information_source')
            ->get();

        $by_source = $patients->groupBy(function ($p) {
            return $p->information_source?->name ?: 'Unknown';
        })->map(function ($group) use ($patients) {
            return [
                'source' => $group->first()->information_source?->name ?: 'Unknown',
                'count' => $group->count(),
                'percentage' => $patients->count() > 0 ? $group->count() / $patients->count() : 0,
            ];
        })->values()->all();

        $by_status = $patients->groupBy(function ($p) {
            return $p->is_vip === 'Yes' ? 'VIP' : 'Regular';
        })->map(function ($group) use ($patients) {
            return [
                'status' => $group->first()->is_vip === 'Yes' ? 'VIP' : 'Regular',
                'count' => $group->count(),
                'percentage' => $patients->count() > 0 ? $group->count() / $patients->count() : 0,
            ];
        })->values()->all();

        $new_leads = $patients->filter(function ($p) {
            return $p->created_at && $p->created_at->gte(Carbon::now()->subDays(30));
        })->count();

        $data = [
            'summary' => [
                'total_leads' => $patients->count(),
                'new_leads' => $new_leads,
                'qualified_leads' => $patients->count(),
                'conversion_rate' => $patients->count() > 0 ? 1 : 0,
                'average_lead_quality' => 0,
            ],
            'leads_by_source' => $by_source,
            'leads_by_status' => $by_status,
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
