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
    // called "TibaDesk Dental" should not produce "TibaDesk Dental · TibaDesk
    // Dental" on every tab.
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

    {{-- This module sits behind TibaDesk's sign-in. It must not be indexed, and
         it must not describe one facility on behalf of another: the tags this
         shell used to carry named a specific clinic, its telephone number and
         its street coordinates, which is one facility's business to publish and
         not something this application should assert for whichever facility is
         signed in. The public-facing pages live on TIBADesk-website. --}}
    <meta name="robots" content="noindex, nofollow">

    <link href="{{ \Illuminate\Support\Facades\URL::to('/') . '/css/fonts.css' }}" rel="stylesheet">

    @env('local')
        @viteReactRefresh
    @endenv
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    <style>
               #root {
                   min-height: 100vh;
                   display: flex;
                   flex-direction: column;
                   align-items: center;
                   justify-content: center;
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
