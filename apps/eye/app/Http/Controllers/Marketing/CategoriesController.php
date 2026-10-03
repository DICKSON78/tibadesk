<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CategoriesController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $data = Category::orderBy('name')->get();
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:500',
        ]);

        $data = Category::create($request->only(['name', 'description']));
        return $this->sendResponse($data, Response::HTTP_OK, 'Category created successfully.');
    }

    public function destroy($id)
    {
        $data = Category::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Category deleted successfully.');
    }
}
