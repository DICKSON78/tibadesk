<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/sms', function () {
//     $service = new \App\Http\Services\SmsService();
//     $service->sendMessage(1, 'Hello Jay, asante kwa kupata huduma kwetu. Karibu tena.');
//     return response()->json(['message' => 'OK']);
// });

// Serve JavaScript files with correct MIME type
Route::get('/build/{filename}', function ($filename) {
    $filePath = public_path("build/{$filename}");
    
    if (file_exists($filePath) && pathinfo($filePath, PATHINFO_EXTENSION) === 'js') {
        return response()->file($filePath, [
            'Content-Type' => 'application/javascript; charset=utf-8',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'public, max-age=31536000'
        ]);
    }
    
    // Also handle other asset types
    if (file_exists($filePath)) {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $mimeTypes = [
            'css' => 'text/css; charset=utf-8',
            'json' => 'application/json; charset=utf-8',
            'svg' => 'image/svg+xml; charset=utf-8',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            'ttf' => 'font/ttf',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
        ];
        
        if (isset($mimeTypes[$extension])) {
            return response()->file($filePath, [
                'Content-Type' => $mimeTypes[$extension],
                'Cache-Control' => 'public, max-age=31536000'
            ]);
        }
    }
    
    abort(404);
});

Route::get('/login', function () {
    return view('app');
})->name('login');

// Test route
Route::get('/test', function () {
    return 'Laravel is working!';
});

// Catch-all route for SPA - must be last
// Exclude build directory from SPA routes
Route::get('/{any?}', function () {
    // Don't serve SPA for build directory
    if (request()->is('build/*')) {
        abort(404);
    }
    return view('app');
})->where('any', '[\/\w\.-]*');
