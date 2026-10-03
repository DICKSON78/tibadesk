<?php

use App\Http\Controllers\Api\DemoRequestController;
use App\Models\DemoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ======================================================================
// Dashboard SPA
// ======================================================================

// Redirect legacy role-prefixed dashboard URLs to the unified /dashboard
Route::get('/dashboard/{role}/{subpath?}', function ($role, $subpath = '') {
    return redirect('/dashboard'.($subpath ? '/'.$subpath : ''), 301);
})->where('role', 'owner|admin|seller')->where('subpath', '.*');

// Redirect legacy dashboard auth URLs to clean root URLs
Route::redirect('/dashboard/login', '/login', 301);
Route::redirect('/dashboard/register', '/register', 301);
Route::redirect('/dashboard/register/owner', '/register/owner', 301);
Route::redirect('/dashboard/forgot-password', '/forgot-password', 301);
Route::redirect('/dashboard/pending-approval', '/pending-approval', 301);
Route::redirect('/dashboard/subscribe', '/subscribe', 301);
Route::redirect('/dashboard/app', '/app', 301);
Route::redirect('/dashboard/home', '/home', 301);

// Root-level dashboard auth pages (served by the dashboard SPA)
$dashboardIndex = function () {
    return response()->file(public_path('dashboard/index.html'), [
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
    ]);
};
Route::get('/login', $dashboardIndex);
Route::get('/register', $dashboardIndex);
Route::get('/register/owner', $dashboardIndex);
Route::get('/forgot-password', $dashboardIndex);
Route::get('/pending-approval', $dashboardIndex);
Route::get('/subscribe', $dashboardIndex);
Route::get('/app', $dashboardIndex);
Route::get('/home', $dashboardIndex);

// Dashboard SPA (assets + history fallback)
Route::get('/dashboard/{any?}', function ($any = null) use ($dashboardIndex) {
    $path = trim($any ?: '/', '/');

    if ($path && file_exists(public_path('dashboard/'.$path))) {
        $file = public_path('dashboard/'.$path);
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $mimeMap = [
            'js' => 'application/javascript',
            'mjs' => 'application/javascript',
            'css' => 'text/css',
            'html' => 'text/html',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'webp' => 'image/webp',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'map' => 'application/json',
            'mp4' => 'video/mp4',
        ];
        $mime = $mimeMap[$ext] ?? 'application/octet-stream';

        return response()->file($file, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    return $dashboardIndex();
})->where('any', '.*');

// ======================================================================
// API routes
// ======================================================================

Route::post('/demo-requests', [DemoRequestController::class, 'store']);

Route::post('/contact', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255',
        'phone' => 'sometimes|nullable|string|max:20',
        'subject' => 'sometimes|nullable|string|max:255',
        'message' => 'sometimes|nullable|string|max:2000',
    ]);
    DemoRequest::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'phone' => $validated['phone'] ?? '',
        'service' => $validated['subject'],
        'message' => $validated['message'] ?? '',
    ]);

    return response()->json(['message' => 'Message sent successfully!'], 201);
});

// ======================================================================
// Everything else
// ======================================================================
//
// This application is a module inside TibaDesk, not a product with a website of
// its own. It used to carry a standalone marketing site here — one advertising
// itself as a pharmacy management platform, with its own team page and product
// video — and this route served it, so the application answered / with a second
// website rather than with its panel. That site is gone; see
// packages/tibadesk-overlay/pharmacy.removals.
//
// The panel's SPA is built for the /dashboard path and hard-codes it, so an
// unmatched path is sent there instead of being answered with a copy of the
// shell that would render against the wrong base.
Route::get('/{any?}', function ($any = null) {
    // An unmatched path under /api is a missing or mistyped endpoint, not a
    // page. Answering it with HTML and a 200 would leave a caller parsing JSON
    // with an opaque parse error instead of the reason it failed — and, worse,
    // a request whose real failure was an expired token would look like a
    // success.
    if (str_starts_with(trim($any ?: '', '/'), 'api/') || request()->expectsJson()) {
        return response()->json(['message' => 'Not found.'], 404);
    }

    return redirect('/dashboard');
})->where('any', '.*');
