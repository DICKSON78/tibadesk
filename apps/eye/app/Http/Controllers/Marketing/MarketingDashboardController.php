<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\CommunicationLog;
use App\Models\Marketing\DailyActivity;
use App\Models\Marketing\Event;
use App\Models\Marketing\Idea;
use App\Models\Marketing\InformationSource;
use App\Models\Marketing\MarketingStrategy;
use App\Models\Marketing\ResearchPlan;
use App\Models\Patient;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class MarketingDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $today = Carbon::today()->format('Y-m-d');

        if ($user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Default to current week if no dates provided
        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');

        $data = [
            'summary' => [
                'total_marketing_activities' => 0,
                'total_ideas' => 0,
                'total_outreach_programmes' => 0,
                'total_communication_logs' => 0,
                'total_patients_registered' => 0,
                'total_marketing_strategies' => 0,
                'total_research_plans' => 0,
            ],
            'statistics' => [
                'daily_activities' => [],
                'ideas' => [],
                'outreach_programmes' => [],
                'communication_logs' => [],
                'information_sources' => [],
                'yearly' => [],
                'marketing_strategies' => [],
                'research_plans' => [],
            ],
            'lists' => [
                'daily_activities' => [],
                'recent_ideas' => [],
                'upcoming_events' => [],
                'recent_communications' => [],
            ],
        ];

        if ($clinic_id) {
            // Daily Activities Statistics
            $data['statistics']['daily_activities'] = DB::select('
                select da.status, count(da.id) as activities 
                from daily_activities as da 
                inner join users as u on da.created_by = u.id 
                where u.clinic_id = ? and (da.activity_date between ? and ?) 
                group by da.status
            ', [$clinic_id, $start_date, $end_date]);

            // Ideas Statistics
            $data['statistics']['ideas'] = DB::select('
                select id.status, count(id.id) as ideas 
                from ideas as id 
                inner join users as u on id.created_by = u.id 
                where u.clinic_id = ? and (date(id.created_at) between ? and ?) 
                group by id.status
            ', [$clinic_id, $start_date, $end_date]);

            // Outreach Programmes Statistics
            $data['statistics']['outreach_programmes'] = DB::select('
                select ev.status, count(ev.id) as programmes 
                from events as ev 
                inner join users as u on ev.created_by = u.id 
                where u.clinic_id = ? and ev.event_type = ? and (ev.event_date between ? and ?) 
                group by ev.status
            ', [$clinic_id, 'Outreach Programme', $start_date, $end_date]);

            // Communication Logs Statistics
            $data['statistics']['communication_logs'] = DB::select('
                select cl.communication_type, count(cl.id) as logs 
                from communication_logs as cl 
                inner join users as u on cl.created_by = u.id 
                where u.clinic_id = ? and (date(cl.created_at) between ? and ?) 
                group by cl.communication_type
            ', [$clinic_id, $start_date, $end_date]);

            // Marketing Strategies Statistics
            $data['statistics']['marketing_strategies'] = DB::select('
                select ms.status, count(ms.id) as strategies 
                from marketing_strategies as ms 
                inner join users as u on ms.created_by = u.id 
                where u.clinic_id = ? and (date(ms.created_at) between ? and ?) 
                group by ms.status
            ', [$clinic_id, $start_date, $end_date]);

            // Research Plans Statistics
            $data['statistics']['research_plans'] = DB::select('
                select rp.status, count(rp.id) as plans 
                from research_plans as rp 
                inner join users as u on rp.created_by = u.id 
                where u.clinic_id = ? and (date(rp.created_at) between ? and ?) 
                group by rp.status
            ', [$clinic_id, $start_date, $end_date]);
            
            // Get information source statistics for patients registered in this clinic
            $data['statistics']['information_sources'] = DB::select('
                select 
                    COALESCE(infos.name, "Unknown") as source_name,
                    count(p.id) as patient_count
                from patients as p
                inner join patient_check_ins as pci on p.id = pci.patient_id
                inner join users as u on pci.created_by = u.id
                left join information_sources as infos on p.info_source_id = infos.id
                where u.clinic_id = ? 
                and (date(pci.created_at) between ? and ?)
                group by p.info_source_id, infos.name
                order by patient_count desc
            ', [$clinic_id, $start_date, $end_date]);

            // Recent lists
            $data['lists']['daily_activities'] = DailyActivity::with('creator')
                ->whereHas('creator', function($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->whereBetween('activity_date', [$start_date, $end_date])
                ->orderBy('activity_date', 'desc')
                ->limit(5)
                ->get();

            $data['lists']['recent_ideas'] = Idea::with('creator')
                ->whereHas('creator', function($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->whereBetween(DB::raw('date(created_at)'), [$start_date, $end_date])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            $data['lists']['upcoming_events'] = Event::with('creator')
                ->whereHas('creator', function($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->where('event_type', 'Outreach Programme')
                ->where('event_date', '>=', $today)
                ->orderBy('event_date', 'asc')
                ->limit(5)
                ->get();

            $data['lists']['recent_communications'] = CommunicationLog::with('creator')
                ->whereHas('creator', function($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                })
                ->whereBetween(DB::raw('date(created_at)'), [$start_date, $end_date])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

        } else {
            // For admin users without clinic filter
            $data['statistics']['daily_activities'] = DB::select('
                select status, count(id) as activities 
                from daily_activities 
                where (activity_date between ? and ?) 
                group by status
            ', [$start_date, $end_date]);

            $data['statistics']['ideas'] = DB::select('
                select status, count(id) as ideas 
                from ideas 
                where (date(created_at) between ? and ?) 
                group by status
            ', [$start_date, $end_date]);

            $data['statistics']['outreach_programmes'] = DB::select('
                select status, count(id) as programmes 
                from events 
                where event_type = ? and (event_date between ? and ?) 
                group by status
            ', ['Outreach Programme', $start_date, $end_date]);

            $data['statistics']['communication_logs'] = DB::select('
                select communication_type, count(id) as logs 
                from communication_logs 
                where (date(created_at) between ? and ?) 
                group by communication_type
            ', [$start_date, $end_date]);

            $data['statistics']['marketing_strategies'] = DB::select('
                select status, count(id) as strategies 
                from marketing_strategies 
                where (date(created_at) between ? and ?) 
                group by status
            ', [$start_date, $end_date]);

            $data['statistics']['research_plans'] = DB::select('
                select status, count(id) as plans 
                from research_plans 
                where (date(created_at) between ? and ?) 
                group by status
            ', [$start_date, $end_date]);
            
            // Get information source statistics for all patients
            $data['statistics']['information_sources'] = DB::select('
                select 
                    COALESCE(infos.name, "Unknown") as source_name,
                    count(p.id) as patient_count
                from patients as p
                inner join patient_check_ins as pci on p.id = pci.patient_id
                left join information_sources as infos on p.info_source_id = infos.id
                where (date(pci.created_at) between ? and ?)
                group by p.info_source_id, infos.name
                order by patient_count desc
            ', [$start_date, $end_date]);

            // Recent lists for admin
            $data['lists']['daily_activities'] = DailyActivity::with('creator')
                ->whereBetween('activity_date', [$start_date, $end_date])
                ->orderBy('activity_date', 'desc')
                ->limit(5)
                ->get();

            $data['lists']['recent_ideas'] = Idea::with('creator')
                ->whereBetween(DB::raw('date(created_at)'), [$start_date, $end_date])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            $data['lists']['upcoming_events'] = Event::with('creator')
                ->where('event_type', 'Outreach Programme')
                ->where('event_date', '>=', $today)
                ->orderBy('event_date', 'asc')
                ->limit(5)
                ->get();

            $data['lists']['recent_communications'] = CommunicationLog::with('creator')
                ->whereBetween(DB::raw('date(created_at)'), [$start_date, $end_date])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        }

        // Calculate summary totals
        $data['summary']['total_marketing_activities'] = collect($data['statistics']['daily_activities'])->sum('activities');
        $data['summary']['total_ideas'] = collect($data['statistics']['ideas'])->sum('ideas');
        $data['summary']['total_outreach_programmes'] = collect($data['statistics']['outreach_programmes'])->sum('programmes');
        $data['summary']['total_communication_logs'] = collect($data['statistics']['communication_logs'])->sum('logs');
        $data['summary']['total_patients_registered'] = collect($data['statistics']['information_sources'])->sum('patient_count');
        $data['summary']['total_marketing_strategies'] = collect($data['statistics']['marketing_strategies'])->sum('strategies');
        $data['summary']['total_research_plans'] = collect($data['statistics']['research_plans'])->sum('plans');

        // Generate yearly statistics for the last 12 months
        $date = Carbon::today()->subMonths(11);

        for ($i = 0; $i < 12; $i++) {
            $month_start = $date->copy()->startOfMonth()->format('Y-m-d');
            $month_end = $date->copy()->endOfMonth()->format('Y-m-d');

            $data['statistics']['yearly'][] = [
                'month' => $date->format('M'),
                'statistics' => [
                    [
                        'name' => 'marketing_activities',
                        'amount' => $this->getMonthlyCount('daily_activities', 'activity_date', $month_start, $month_end, $clinic_id),
                    ],
                    [
                        'name' => 'ideas_generated',
                        'amount' => $this->getMonthlyCount('ideas', 'created_at', $month_start, $month_end, $clinic_id),
                    ],
                    [
                        'name' => 'outreach_programmes',
                        'amount' => $this->getMonthlyCount('events', 'event_date', $month_start, $month_end, $clinic_id, ['event_type' => 'Outreach Programme']),
                    ],
                    [
                        'name' => 'communication_logs',
                        'amount' => $this->getMonthlyCount('communication_logs', 'created_at', $month_start, $month_end, $clinic_id),
                    ],
                    [
                        'name' => 'marketing_strategies',
                        'amount' => $this->getMonthlyCount('marketing_strategies', 'created_at', $month_start, $month_end, $clinic_id),
                    ],
                    [
                        'name' => 'research_plans',
                        'amount' => $this->getMonthlyCount('research_plans', 'created_at', $month_start, $month_end, $clinic_id),
                    ]
                ],
            ];

            $date->addMonthNoOverflow();
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    private function getMonthlyCount($table, $date_column, $start_date, $end_date, $clinic_id = null, $additional_conditions = [])
    {
        $query = DB::table($table);
        
        if ($clinic_id) {
            $query->join('users', $table . '.created_by', '=', 'users.id')
                  ->where('users.clinic_id', $clinic_id);
        }
        
        $query->whereDate($date_column, '>=', $start_date)
              ->whereDate($date_column, '<=', $end_date);
        
        foreach ($additional_conditions as $column => $value) {
            $query->where($column, $value);
        }
        
        return $query->count();
    }
}
