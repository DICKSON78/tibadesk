<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:subscribers,email',
        ]);

        $data = Subscriber::create(['email' => $request->email]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully subscribed to newsletter.',
            'data' => $data,
        ], Response::HTTP_CREATED);
    }
}
