<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $label }} is unavailable</title>
    <link rel="stylesheet" href="{{ asset('build/assets/app.css') }}">
</head>
<body class="min-h-screen bg-mist-50 text-slate-900">
    <div class="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
        <div class="flex size-12 items-center justify-center rounded-card bg-mist-100 text-mist-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="size-6" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
        </div>

        <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-mist-500">Error 502</p>
            <h1 class="mt-2 text-2xl font-bold text-slate-900">{{ $label }} is unavailable</h1>
            <p class="mt-3 text-sm text-slate-600">
                The {{ strtolower($label) }} application could not be reached. It is mounted from its
                own service, so this usually means that service is not running yet.
            </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3">
            <a href="{{ route('apps.index') }}"
               class="inline-flex items-center rounded-card border border-line bg-surface px-4 py-2 text-sm font-semibold text-slate-700 shadow-card hover:bg-mist-50">
                All applications
            </a>
            <a href="{{ url()->current() }}"
               class="inline-flex items-center rounded-card bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-700">
                Try again
            </a>
        </div>
    </div>
</body>
</html>
