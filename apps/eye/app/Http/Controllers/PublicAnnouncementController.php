<?php

namespace App\Http\Controllers;

use App\Models\Marketing\Announcement;
use Illuminate\Http\Request;

class PublicAnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $per_page = min((int)($request->per_page ?? 20), 50);
        $announcements = Announcement::published()
            ->orderBy('published_at', 'desc')
            ->paginate($per_page);

        return response()->json($announcements);
    }
}
