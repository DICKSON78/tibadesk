<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Collaborator;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CollaboratorsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $q = $request->q;
        $data = Collaborator::query();

        if ($status) {
            $data->where('status', $status);
        }

        if ($q) {
            $data->where('name', 'like', '%' . $q . '%');
        }

        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:collaborators,name',
            'phone' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $data = Collaborator::create($request->only('name', 'phone', 'description', 'status'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    public function show($id)
    {
        $data = Collaborator::findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|unique:collaborators,name,' . $id,
            'phone' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $data = Collaborator::findOrFail($id);
        $data->update($request->only('name', 'phone', 'description', 'status'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    public function destroy($id)
    {
        $data = Collaborator::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
