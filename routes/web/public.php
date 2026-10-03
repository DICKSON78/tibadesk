<?php

use Illuminate\Support\Facades\Route;

/*
|-------------------------------------------------------------------------------
| The public website
|-------------------------------------------------------------------------------
|
| This is the marketing site that used to be a separate application sitting in
| front of the console on another port. It is now part of this application: the
| pages are the same React single-page app, driven by routes/web/api.php's
| counterparts under /api, and the whole thing is served from this origin.
|
| What came across is only the two pages the app is made of. The routes that
| proxied the console and the packages across the old boundary are gone, because
| the console and the packages are no longer somewhere else: they are routes in
| this same application, registered above, under /tibadesk. That boundary was the
| reason for most of the code that has been deleted here.
|
| This file is loaded last in routes/web.php on purpose. The catch-all below
| matches any single segment, so it has to be registered after everything it
| could otherwise swallow: the console under /tibadesk, the packages under
| /tibadesk/apps, the API, the health check and the Vite assets.
|
*/

Route::view('/', 'site')->name('home');

// Everything else on the public site is a client-side route: /packages, /about,
// /modules, /compare, /faq, /contact, /register, /checkout and /login are all
// rendered by the same bundle from the same shell.
//
// The exclusion list is what keeps the other half of this origin reachable. It
// is deliberately written as a negative lookahead on the first path segment
// rather than as separate routes for each reserved prefix, so that adding a
// namespace later means adding it here and nowhere else.
Route::view('/{any}', 'site')
    ->where('any', '^(?!api|build|fonts|images|storage|up|tibadesk).*$')
    ->name('site');
