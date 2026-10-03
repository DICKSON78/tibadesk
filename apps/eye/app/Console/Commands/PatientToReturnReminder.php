<?php

namespace App\Console\Commands;

use App\Http\Services\SmsService;
use App\Models\Consultation;
use App\Models\Preference;
use Carbon\Carbon;
use Illuminate\Console\Command;

class PatientToReturnReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sms:patient_to_return_reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command to check patients to return and send reminder message';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $today = Carbon::today();
        $records = Consultation::where('status', 'Consulted')
            ->where('patient_direction', 'Direct to Doctor')
            ->where('patient_to_return', 'Yes')
            ->whereNotNull('to_return_date')
            ->where('to_return_date', '>=', $today)
            ->get();

        if (count($records)) {
            $sms_service = new SmsService();

            foreach ($records as &$record) {
                $days = Carbon::parse($record->to_return_date)->diffInDays($today);

                if ($days == 1) {
                    $clinic = $record->creator?->clinic;

                    if ($clinic) {
                        $send_messages = Preference::where('clinic_id', $clinic->id)
                            ->where('key', 'SEND_MESSAGES')
                            ->first();

                        if ($send_messages?->value == 'Yes') {
                            $message = Preference::where('clinic_id', $clinic->id)
                                ->where('key', 'PATIENT_TO_RETURN_REMINDER_MESSAGE')
                                ->first();

                            if ($message) {
                                $patient = $record->payment_cache_item->payment_cache->check_in->patient;
                                $message = $message->value;
                                $message = str_replace('{name}', $patient->first_name, $message);

                                $date = Carbon::parse($record->to_return_date);
                                $date = $date->format('M d, Y');

                                $message = str_replace('{date}', $date, $message);
                                $sms_service->sendMessage($patient->id, $message);
                            }
                        }
                    }
                }
            }
        }

        return 0;
    }
}
