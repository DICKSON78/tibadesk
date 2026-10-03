<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\BlogPost;
use App\Services\SocialMediaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class BlogPostsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'category' => 'sometimes|string',
            'q' => 'sometimes|string',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $data = BlogPost::with(['creator']);

        if (!$user->is_admin) {
            $data->where('created_by', $user->id);
        }

        if ($request->status) {
            $data->where('status', $request->status);
        }

        if ($request->category) {
            $data->where('category', $request->category);
        }

        if ($request->q) {
            $data->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                  ->orWhere('excerpt', 'like', '%' . $request->q . '%');
            });
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'content' => 'required',
            'excerpt' => 'nullable',
            'featured_image' => 'nullable',
            'video_url' => 'nullable',
            'social_links' => 'nullable|array',
            'category' => 'nullable',
            'tags' => 'nullable',
            'status' => 'sometimes|in:draft,published',
            'share_to_facebook' => 'sometimes|boolean',
            'share_to_instagram' => 'sometimes|boolean',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;

        if ($request->status == 'published') {
            $input['published_at'] = Carbon::now();
        }

        $data = BlogPost::create($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    public function show($id)
    {
        $data = BlogPost::with(['creator'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required',
            'content' => 'sometimes|required',
            'excerpt' => 'nullable',
            'featured_image' => 'nullable',
            'video_url' => 'nullable',
            'social_links' => 'nullable|array',
            'category' => 'nullable',
            'tags' => 'nullable',
            'status' => 'sometimes|in:draft,published',
            'share_to_facebook' => 'sometimes|boolean',
            'share_to_instagram' => 'sometimes|boolean',
        ]);

        $data = BlogPost::findOrFail($id);
        $input = $request->all();

        if ($request->status == 'published' && $data->status != 'published') {
            $input['published_at'] = Carbon::now();
        }

        if ($request->status == 'draft' && $data->status == 'published') {
            $input['published_at'] = null;
        }

        $data->update($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function share(Request $request, $id)
    {
        $request->validate([
            'platforms' => 'required|array',
            'platforms.*' => 'in:facebook,instagram',
        ]);

        $data = BlogPost::findOrFail($id);
        $service = new SocialMediaService();

        $platforms = $request->platforms;
        $alreadyShared = [];

        foreach ($platforms as $i => $platform) {
            if ($data->{"shared_to_{$platform}"}) {
                $alreadyShared[] = $platform;
                unset($platforms[$i]);
            }
        }

        if (empty($platforms)) {
            return $this->sendResponse(
                ['results' => []],
                Response::HTTP_OK,
                $alreadyShared ? 'Already shared: ' . implode(', ', $alreadyShared) . '.' : 'No platforms selected.'
            );
        }

        $results = $service->sharePost($data, array_values($platforms));

        $updates = [];
        foreach ($results as $platform => $result) {
            if ($result['success']) {
                $updates["shared_to_{$platform}"] = $result['post_id'];
            }
        }
        if ($updates) {
            $updates['shared_at'] = Carbon::now();
            $data->update($updates);
        }

        $failed = collect($results)->filter(fn ($r) => !$r['success'])->map(fn ($r) => $r['error'] ?? '');
        $message = $failed->isEmpty() ? 'Shared successfully.' : 'Partial failure: ' . $failed->join('; ');
        $status = $failed->isEmpty() ? Response::HTTP_OK : Response::HTTP_UNPROCESSABLE_ENTITY;

        return $this->sendResponse(['results' => $results], $status, $message);
    }

    public function destroy($id)
    {
        $data = BlogPost::findOrFail($id);
        $service = new SocialMediaService();

        $results = $service->deletePost($data);
        $failed = collect($results)->filter(fn ($r) => !$r['success']);

        $data->delete();

        if ($failed->isNotEmpty()) {
            $errors = $failed->map(fn ($r) => $r['error'] ?? '')->join('; ');
            return $this->sendResponse(['social_errors' => $errors], Response::HTTP_OK, "Deleted locally. Social media cleanup: {$errors}");
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }

    public function unshare(Request $request, $id, $platform)
    {
        $request->validate([
            'platform' => 'required|in:facebook,instagram',
        ]);

        $data = BlogPost::findOrFail($id);
        $service = new SocialMediaService();

        $result = $service->deleteFromPlatform($data, $platform);

        if ($result['success']) {
            return $this->sendResponse($data->fresh(), Response::HTTP_OK, "Unshared from {$platform}.");
        }

        return $this->sendResponse(null, Response::HTTP_UNPROCESSABLE_ENTITY, $result['error'] ?? "Failed to unshare from {$platform}.");
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $file = $request->file('image');
        $filename = time() . '_' . uniqid() . '.' . $file->extension();
        $file->move(public_path('uploads/blog'), $filename);

        return $this->sendResponse([
            'url' => url('uploads/blog/' . $filename),
        ], Response::HTTP_OK, 'Uploaded successfully.');
    }

    public function uploadVideo(Request $request)
    {
        $request->validate([
            'video' => 'required|mimes:mp4,webm,ogg,mov,avi|max:204800',
        ]);

        $file = $request->file('video');
        $filename = time() . '_' . uniqid() . '.' . $file->extension();
        $file->move(public_path('uploads/blog'), $filename);

        return $this->sendResponse([
            'url' => url('uploads/blog/' . $filename),
        ], Response::HTTP_OK, 'Uploaded successfully.');
    }
}
