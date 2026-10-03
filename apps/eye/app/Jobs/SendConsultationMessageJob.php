<?php

namespace App\Jobs;

use App\Http\Services\SmsService;
use App\Models\Preference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendConsultationMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $consultation;

    /**
     * Create a new job instance.
     * @param $consultation
     */
    public function __construct($consultation)
    {
        $this->consultation = $consultation;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $clinic = $this->consultation->creator?->clinic;

        if ($clinic) {
            $send_messages = Preference::where('clinic_id', $clinic->id)
                ->where('key', 'SEND_MESSAGES')
                ->first();

            if ($send_messages?->value == 'Yes') {
                $message = Preference::where('clinic_id', $clinic->id)
                    ->where('key', 'CONSULTATION_MESSAGE')
                    ->first();

                if ($message) {
                    $patient = $this->consultation->payment_cache_item->payment_cache->check_in->patient;
                    $message = $message->value;
                    $message = str_replace('{name}', $patient->first_name, $message);
                    $sms_service = new SmsService();
                    $sms_service->sendMessage($patient->id, $message);
                }
            }
        }
    }
}
