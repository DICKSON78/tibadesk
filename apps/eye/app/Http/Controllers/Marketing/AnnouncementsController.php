<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\Announcement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class AnnouncementsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'category' => 'sometimes|string',
        ]);

        $per_page = $request->per_page ?? 25;
        $data = Announcement::query();

        if ($request->status) {
            $data->where('status', $request->status);
        }

        if ($request->category) {
            $data->where('category', $request->category);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'status' => 'sometimes|in:draft,published',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $input = $request->only(['title', 'description', 'category', 'status']);
        $input['status'] = $input['status'] ?? 'published';

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('public/downloads');
            $input['file_path'] = str_replace('public/', '', $filePath);
            $input['file_name'] = $fileName;
        }

        if ($input['status'] === 'published') {
            $input['published_at'] = Carbon::now();
        }

        $data = Announcement::create($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Announcement created successfully.');
    }

    public function show($id)
    {
        $data = Announcement::findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'status' => 'sometimes|in:draft,published',
            'file' => 'nullable|file|max:10240',
        ]);

        $data = Announcement::findOrFail($id);
        $input = $request->only(['title', 'description', 'category', 'status']);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('public/downloads');
            $input['file_path'] = str_replace('public/', '', $filePath);
            $input['file_name'] = $fileName;
        }

        if ($request->status === 'published' && $data->status !== 'published') {
            $input['published_at'] = Carbon::now();
        }

        if ($request->status === 'draft' && $data->status === 'published') {
            $input['published_at'] = null;
        }

        $data->update($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Announcement updated successfully.');
    }

    public function destroy($id)
    {
        $data = Announcement::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Announcement deleted successfully.');
    }
}
