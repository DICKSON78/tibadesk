<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name') }} | Hospital Management System</title>
    <meta name="description" content="TibaDesk is a hospital management system for Tanzanian clinics and hospitals. Choose an edition, subscribe monthly, and manage patients, billing, pharmacy and reports from one dashboard.">
    <meta name="keywords" content="hospital management system, clinic software, dental clinic software, polyclinic software, eye clinic software, Tanzania, TibaDesk">
    <meta name="author" content="TibaDesk">
    <meta name="robots" content="index, follow">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="TibaDesk">
    <meta property="og:title" content="TibaDesk | Hospital Management System">
    <meta property="og:description" content="Subscribe to TibaDesk and run your clinic or hospital from one dashboard. Editions for dental clinics, eye clinics, polyclinics and hospitals.">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="TibaDesk | Hospital Management System">
    <meta name="twitter:description" content="Subscribe to TibaDesk and run your clinic or hospital from one dashboard.">

    @vite(['resources/css/site.css', 'resources/js/site/main.jsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
