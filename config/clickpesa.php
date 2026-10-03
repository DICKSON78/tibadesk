<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Payment Driver
    |--------------------------------------------------------------------------
    |
    | "clickpesa" talks to the live ClickPesa API. "fake" keeps everything local
    | and lets the whole subscribe, pay, download flow be exercised without
    | merchant credentials. It refuses to run in production.
    |
    */

    'driver' => env('CLICKPESA_DRIVER', 'fake'),

    'base_url' => env('CLICKPESA_BASE_URL', 'https://api.clickpesa.com'),

    'api_key' => env('CLICKPESA_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Callbacks
    |--------------------------------------------------------------------------
    |
    | Where ClickPesa sends the customer back to, and where it posts the
    | server-to-server payment notification. Both default to this application.
    |
    */

    'return_url' => env('CLICKPESA_RETURN_URL', env('APP_URL').'/checkout/complete'),

    'callback_url' => env('CLICKPESA_CALLBACK_URL', env('APP_URL').'/api/clickpesa/callback'),

];
