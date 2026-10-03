<?php

namespace App\Http\Services;

use App\Models\Message;
use App\Models\Patient;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class SmsService
{

    private $sendMessageUrl = 'http://157.230.98.141:8010/sms/send';
    private $deliveryReportUrl = 'http://157.230.98.141:8010/sms/delivery-report';
    private $clientUrl = 'http://157.230.98.141:8010/sms/client';

    /**
     * Send message to patient.
     *
     * @param $patient_id
     * @param string $message
     * @return null|string String representation of response body
     */
    public function sendMessage($patient_id, $message)
    {
        if (!$patient_id) {
            return null;
        }

        $recipients = [];
        $patient = Patient::find($patient_id);
        $clinic = $patient->creator?->clinic;
        $phone = $patient->phone;

        if ($phone && str_starts_with($phone, '0') && strlen($phone) == 10) {
            $recipients[] = '255' . substr($phone, 1);
        }

        if (!count($recipients)) {
            return null;
        }

        $sender_name = $clinic?->sms_sender_name ?? 'INFO';
        $body = [
            'senderName' => $sender_name,
            'message' => $message,
            'recipients' => $recipients,
        ];
        $headers = [
            'x-access-token' => $clinic?->sms_key,
        ];

        try {
            $client = new Client([
                'timeout' => 10, // 10 second timeout
                'connect_timeout' => 5, // 5 second connection timeout
            ]);
            $params['headers'] = $headers;
            $params['json'] = $body;
            $response = $client->post($this->sendMessageUrl, $params)
                ->getBody()
                ->getContents();
            $response = json_decode($response);

            Message::create([
                'message' => $message,
                'phone' => $patient->phone,
                'api_response' => json_encode($response->data),
                'patient_id' => $patient_id,
            ]);

            $sms_client = $response->client;
            if ($sms_client && $clinic) {
                $clinic->sms_balance = $sms_client->balance;
                $clinic->save();
            }

            return $response;
        } catch (Exception $exception) {
            Log::debug($exception);
            return null;
        }
    }

    public function getMessageDeliveryReport($sms_key, $request_id, $recipient = null)
    {
        $headers = [
            'x-access-token' => $sms_key,
        ];

        try {
            $client = new Client([
                'timeout' => 10, // 10 second timeout
                'connect_timeout' => 5, // 5 second connection timeout
            ]);
            $params['headers'] = $headers;

            $url = sprintf('%s?requestId=%s', $this->deliveryReportUrl, $request_id);

            if ($recipient) {
                if (str_starts_with($recipient, '0')) {
                    $recipient = '255' . substr($recipient, 1);
                }

                $url = sprintf('%s?recipient=%s&requestId=%s', $this->deliveryReportUrl, $recipient, $request_id);
            }

            $response = $client->get($url, $params)
                ->getBody()
                ->getContents();
            $response = json_decode($response);
            return $response->data;
        } catch (Exception $exception) {
            Log::debug($exception);
            return null;
        }
    }

    public function getClient($sms_key)
    {
        $headers = [
            'x-access-token' => $sms_key,
        ];

        try {
            $client = new Client();
            $params['headers'] = $headers;

            $response = $client->get($this->clientUrl, $params)
                ->getBody()
                ->getContents();
            $response = json_decode($response);
            return $response->data;
        } catch (Exception $exception) {
            Log::debug($exception);
            return null;
        }
    }
}
