<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\District;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DistrictsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $q = $request->q;
        $region_id = $request->region_id;
        $data = District::query();

        if ($status) {
            $data->where('status', $status);
        }

        if ($q) {
            $data->where('name', 'like', '%' . $q . '%');
        }

        if ($region_id) {
            $data->where('region_id', $region_id);
        }

        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:districts,name',
            'region_id' => 'required|exists:regions,id',
        ]);

        $data = District::create($request->only('name', 'region_id'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = District::with(['region'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|required|unique:districts,name,' . $id,
            'region_id' => 'sometimes|required|exists:regions,id',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $data = District::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $data = District::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
