<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
@php
    // This document is the shell for the application's own panel, not for a
    // public website. There is nothing here for a visitor to read, so the title
    // names the facility whose data the user is about to see — which is the
    // facility on the session, resolved through the user, rather than whichever
    // clinic happens to have the lowest id in the table.
    //
    // Both halves are dropped when they agree, because a facility already
    // called "TibaDesk Eye Clinic" should not produce "TibaDesk Eye Clinic ·
    // TibaDesk Eye Clinic" on every tab.
    $clinicName = auth()->user()?->clinic?->name;
    $appName = config('app.name', 'TibaDesk');
    $title = $clinicName === null || $clinicName === '' || $clinicName === $appName
        ? $appName
        : $clinicName.' · '.$appName;
@endphp
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ $title }}</title>

    {{-- This module sits behind TibaDesk's sign-in. It must not be indexed: a
         search engine reaching it lands on a page it cannot read, and the only
         eye-care pages meant for the public live on TIBADesk-website. --}}
    <meta name="robots" content="noindex, nofollow">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="apple-touch-icon" href="{{ asset('images/logo.png') }}">

    <link href="{{ \Illuminate\Support\Facades\URL::to('/') . '/css/fonts.css' }}" rel="stylesheet">
    <link href="{{ asset('assets/css/styles.css') }}" rel="stylesheet">

    @env('local')
        @viteReactRefresh
    @endenv
    @vite(['resources/js/app.jsx'])

    <style>
               #root {
                   min-height: 100vh;
                   display: flex;
                   flex-direction: column;
                   background: transparent;
                   font-family: 'Roboto', 'Open Sans', sans-serif;
               }
    </style>
</head>
<body>
<noscript>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>JavaScript Required</h1>
        <p>You need to enable JavaScript to run this application.</p>
    </div>
</noscript>
<div id="root"></div>
</body>
</html>
