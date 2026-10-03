<?php

namespace App\Http\Controllers;

use App\Models\Marketing\BlogPost;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    public function index(Request $request)
    {
        $per_page = min((int)($request->per_page ?? 12), 50);
        $posts = BlogPost::published()
            ->where('published_at', '>=', now()->subMonth())
            ->with('creator:id,first_name,last_name')
            ->orderBy('published_at', 'desc')
            ->paginate($per_page);

        return response()->json($posts);
    }

    public function topStories(Request $request)
    {
        $limit = min((int)($request->limit ?? 5), 10);
        $posts = BlogPost::published()
            ->with('creator:id,first_name,last_name')
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json(['data' => $posts]);
    }

    public function show($slug)
    {
        $post = BlogPost::published()
            ->where('published_at', '>=', now()->subMonth())
            ->with('creator:id,first_name,last_name')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($post);
    }
}
