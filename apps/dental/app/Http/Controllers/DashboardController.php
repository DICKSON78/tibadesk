<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\ExpensePayment;
use App\Models\Patient;
use App\Models\PatientCheckIn;
use App\Models\PatientItemBill;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
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

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Default to current week if no dates provided
        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');

        $data = [
            'summary' => [
                'total_sales' => 0,
                'discount' => 0,
                'expenses' => 0,
                'new_patients' => 0,
                'patient_visits' => 0,
                'consulted_patients' => 0,
                'dental_lab' => 0,
                'pharmacy' => 0,
                'procedure' => 0,
                'others' => 0,
                'consultation' => 0,
                'sms_balance' => 0,
            ],
            'statistics' => [
                'expenses_by_category' => [],
                'payments_by_channel' => [],
                'consultations_by_item' => [],
                'top_diagnosis' => [],
                'yearly' => [],
            ],
        ];

        // Total sales: revenue is recognized when a bill is cleared.
        // Every sale (cash or credit) is finalized through a Cleared PatientItemBill
        // (a cash sale creates both a PatientItemPayment and a Cleared bill for the
        // same amount), so summing cleared bills once counts each sale exactly once
        // and avoids double-counting.
        $totalBills = PatientItemBill::where('status', 'Cleared')
            ->whereHas('items', fn($q) => $q->where(function($qq) {
                $qq->where('is_partner_item', '!=', true)->orWhereNull('is_partner_item');
            }))
            ->whereDate('cleared_at', '>=', $start_date)
            ->whereDate('cleared_at', '<=', $end_date)
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('clearer', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->sum(DB::raw('amount - discount'));

        $data['summary']['total_sales'] = $totalBills;

        $data['summary']['discount'] = PatientItemPayment::query()
            ->whereHas('items', fn($q) => $q->where(function($qq) {
                $qq->where('is_partner_item', '!=', true)->orWhereNull('is_partner_item');
            }))
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('discount');

        $data['summary']['expenses'] = ExpensePayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('amount');

        $data['summary']['new_patients'] = Patient::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['summary']['patient_visits'] = PatientCheckIn::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->groupBy('patient_id', DB::raw('date(created_at)'));

        $data['summary']['patient_visits'] = DB::selectOne(sprintf('select count(id) as visits from (%s) as patient_check_ins', $data['summary']['patient_visits']->toSql()), $data['summary']['patient_visits']->getBindings());

        if ($data['summary']['patient_visits']) {
            $data['summary']['patient_visits'] = $data['summary']['patient_visits']->visits;
        } else {
            $data['summary']['patient_visits'] = 0;
        }

        $data['summary']['consulted_patients'] = Consultation::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('payment_cache_item', function ($query) use ($start_date, $end_date) {
                $query->whereIn('status', ['Paid', 'Billed', 'Served']);
                $query->whereDate('created_at', '>=', $start_date);
                $query->whereDate('created_at', '<=', $end_date);
            })
            ->where('patient_direction', 'Direct to Doctor')
            ->where('status', 'Consulted')
            ->count();

        $categoryRevenue = function ($name) use ($clinic_id, $start_date, $end_date) {
            return PatientPaymentCacheItem::query()
                ->where(function ($q) {
                    $q->where('is_partner_item', '!=', true)->orWhereNull('is_partner_item');
                })
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('consultation_type', function ($query) use ($name) {
                    $query->where('name', $name);
                })
                ->whereHas('bill', function ($query) use ($start_date, $end_date) {
                    $query->where('status', 'Cleared')
                        ->whereDate('cleared_at', '>=', $start_date)
                        ->whereDate('cleared_at', '<=', $end_date);
                })
                ->sum(DB::raw('unit_price * quantity'));
        };

        $data['summary']['dental_lab'] = $categoryRevenue('Dental Lab');

        $data['summary']['pharmacy'] = $categoryRevenue('Pharmacy');
        $data['summary']['procedure'] = $categoryRevenue('Procedure');
        $data['summary']['others'] = $categoryRevenue('Others');

        // Consultation = the remainder of cleared-bill revenue not attributed to an
        // explicit department category. This keeps the five category slices summing
        // exactly to total_sales without double-counting (consultation charges are
        // recorded under a consultation_type such as 'Others').
        $data['summary']['consultation'] = max(0,
            $data['summary']['total_sales']
            - $data['summary']['dental_lab']
            - $data['summary']['pharmacy']
            - $data['summary']['procedure']
            - $data['summary']['others']
        );

        $data['summary']['sms_balance'] = $user->clinic?->sms_balance;

        if ($clinic_id) {
            $data['statistics']['expenses_by_category'] = DB::select('select exp.category_id, cat.name, sum(expp.amount) as amount from expense_payments as expp inner join expenses as exp on expp.expense_id = exp.id inner join expense_categories as cat on exp.category_id = cat.id inner join users as u on expp.created_by = u.id where u.clinic_id = ? and (date(expp.created_at) between ? and ?) group by exp.category_id', [$clinic_id, $start_date, $end_date]);
            $data['statistics']['payments_by_channel'] = DB::select('select channel_id, name, sum(amount) as amount from ((select pmt.channel_id, pc.name, sum(pmt.amount - pmt.discount) as amount from patient_item_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id inner join users as u on pmt.created_by = u.id where u.clinic_id = ? and (date(pmt.created_at) between ? and ?) group by pmt.channel_id) union (select pibp.channel_id, pc.name, sum(pib.amount - pib.discount) as amount from patient_item_bills as pib inner join patient_item_bill_payments as pibp on pibp.bill_id = pib.id inner join payment_channels as pc on pibp.channel_id = pc.id inner join users as u on pib.cleared_by = u.id where pib.status = \'Cleared\' and u.clinic_id = ? and (date(pib.cleared_at) between ? and ?) group by pibp.channel_id)) as payments group by name', [$clinic_id, $start_date, $end_date, $clinic_id, $start_date, $end_date]);
            $data['statistics']['consultations_by_item'] = DB::select('select it.id, it.name, count(ct.id) as consultations from items as it inner join patient_payment_cache_items as ppci on ppci.item_id = it.id inner join consultations as ct on ct.payment_cache_item_id = ppci.id inner join users as u on ct.created_by = u.id where u.clinic_id = ? and ppci.status IN ("Paid", "Billed", "Served") and (date(ppci.created_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by ppci.item_id order by consultations desc', [$clinic_id, $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
            $data['statistics']['top_diagnosis'] = DB::select('select ds.id, ds.name, ds.code, count(cd.id) as consultations from diseases as ds inner join consultation_diagnoses as cd on cd.disease_id = ds.id inner join consultations as ct on cd.consultation_id = ct.id inner join patient_payment_cache_items as ppci on ct.payment_cache_item_id = ppci.id inner join users as u on ct.created_by = u.id where u.clinic_id = ? and ppci.status IN ("Paid", "Billed", "Served") and (date(ppci.created_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by cd.disease_id order by consultations desc limit 10', [$clinic_id, $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
        } else {
            $data['statistics']['expenses_by_category'] = DB::select('select exp.category_id, cat.name, sum(expp.amount) as amount from expense_payments as expp inner join expenses as exp on expp.expense_id = exp.id inner join expense_categories as cat on exp.category_id = cat.id where (date(expp.created_at) between ? and ?) group by exp.category_id', [$start_date, $end_date]);
            $data['statistics']['payments_by_channel'] = DB::select('select channel_id, name, sum(amount) as amount from ((select pmt.channel_id, pc.name, sum(pmt.amount - pmt.discount) as amount from patient_item_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id where (date(pmt.created_at) between ? and ?) group by pmt.channel_id) union (select pibp.channel_id, pc.name, sum(pib.amount - pib.discount) as amount from patient_item_bills as pib inner join patient_item_bill_payments as pibp on pibp.bill_id = pib.id inner join payment_channels as pc on pibp.channel_id = pc.id where pib.status = \'Cleared\' and (date(pib.cleared_at) between ? and ?) group by pibp.channel_id)) as payments group by name', [$start_date, $end_date, $start_date, $end_date]);
            $data['statistics']['consultations_by_item'] = DB::select('select it.id, it.name, count(ct.id) as consultations from items as it inner join patient_payment_cache_items as ppci on ppci.item_id = it.id inner join consultations as ct on ct.payment_cache_item_id = ppci.id where ppci.status IN ("Paid", "Billed", "Served") and (date(ppci.created_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by ppci.item_id order by consultations desc', [$start_date, $end_date, 'Direct to Doctor', 'Consulted']);
            $data['statistics']['top_diagnosis'] = DB::select('select ds.id, ds.name, ds.code, count(cd.id) as consultations from diseases as ds inner join consultation_diagnoses as cd on cd.disease_id = ds.id inner join consultations as ct on cd.consultation_id = ct.id inner join patient_payment_cache_items as ppci on ct.payment_cache_item_id = ppci.id where ppci.status IN ("Paid", "Billed", "Served") and (date(ppci.created_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by cd.disease_id order by consultations desc limit 10', [$start_date, $end_date, 'Direct to Doctor', 'Consulted']);
        }

        $date = Carbon::today()->subMonths(11);

        for ($i = 0; $i < 12; $i++) {
            $start_date = $date->copy()->startOfMonth()->format('Y-m-d');
            $end_date = $date->copy()->endOfMonth()->format('Y-m-d');

            $data['statistics']['yearly'][] = [
                'month' => $date->format('M'),
                'statistics' => [
                    [
                        'name' => 'total_sales',
                        'amount' => PatientItemPayment::query()
                            ->whereHas('items', fn($q) => $q->where(function($qq) {
                                $qq->where('is_partner_item', '!=', true)->orWhereNull('is_partner_item');
                            }))
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->sum(DB::raw('amount - discount')) + PatientItemBill::where('status', 'Cleared')
                            ->whereHas('items', fn($q) => $q->where(function($qq) {
                                $qq->where('is_partner_item', '!=', true)->orWhereNull('is_partner_item');
                            }))
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('clearer', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->whereDate('cleared_at', '>=', $start_date)
                            ->whereDate('cleared_at', '<=', $end_date)
                            ->sum(DB::raw('amount - discount')),
                    ],
                    [
                        'name' => 'discount',
                        'amount' => PatientItemPayment::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->sum('discount')
                    ],
                    [
                        'name' => 'expenses',
                        'amount' => ExpensePayment::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->sum('amount'),
                    ],
                    [
                        'name' => 'new_patients_male',
                        'amount' => Patient::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->where('gender', 'Male')
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->count(),
                    ],
                    [
                        'name' => 'new_patients_female',
                        'amount' => Patient::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->where('gender', 'Female')
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->count(),
                    ]
                ],
            ];

            $date->addMonthNoOverflow();
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
