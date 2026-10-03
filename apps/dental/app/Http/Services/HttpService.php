<?php

namespace App\Http\Services;

use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class HttpService
{
    public function get($url, $headers = null)
    {
        try {
            $client = new Client();
            $params = [];

            if ($headers) {
                $params['headers'] = $headers;
            }

            $response = $client->get($url, $params)->getBody()->getContents();
            return $response;
        } catch (Exception $exception) {
            Log::debug($exception->getMessage());
            return null;
        }
    }

    public function post($url, $body, $headers = null)
    {
        try {
            $client = new Client();

            if ($headers) {
                $params['headers'] = $headers;
            }
            $params['json'] = $body;
            $response = $client->post($url, $params)->getBody()->getContents();
            return $response;
        } catch (Exception $exception) {
            Log::debug($exception->getMessage());
            return null;
        }
    }
}
