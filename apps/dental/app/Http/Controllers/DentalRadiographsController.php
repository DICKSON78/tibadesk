<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalRadiograph;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class DentalRadiographsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'patient_id' => 'sometimes|integer|exists:patients,id',
            'consultation_id' => 'sometimes|exists:consultations,id',
        ]);

        $per_page = $request->per_page ?? 25;
        $data = DentalRadiograph::with(['consultation', 'patient', 'takenBy', 'creator']);

        if ($request->patient_id) {
            $data->where('patient_id', $request->patient_id);
        }

        if ($request->consultation_id) {
            $data->where('consultation_id', $request->consultation_id);
        }

        $data->orderBy('taken_date', 'desc');
        $data = $data->paginate($per_page);

        $data->getCollection()->transform(function ($item) {
            $item->image_url = $item->image_path ? url('storage/' . $item->image_path) : null;
            return $item;
        });

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function show($id)
    {
        $data = DentalRadiograph::with(['consultation', 'patient', 'takenBy', 'creator'])->findOrFail($id);
        $data->image_url = $data->image_path ? url('storage/' . $data->image_path) : null;
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'patient_id' => 'required|exists:patients,id',
            'radiograph_type' => 'required|string',
            'tooth_number' => 'nullable|string',
            'findings' => 'nullable|string',
            'impression' => 'nullable|string',
            'image' => 'nullable|image|max:10240',
            'taken_date' => 'required|date_format:Y-m-d',
            'taken_by' => 'nullable|exists:users,id',
        ]);

        $input = $request->except('image');
        $input['created_by'] = $request->user()->id;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('dental-radiographs', 'public');
            $input['image_path'] = $path;
        }

        $data = DentalRadiograph::create($input);
        $data->image_url = $data->image_path ? url('storage/' . $data->image_path) : null;

        return $this->sendResponse($data, Response::HTTP_OK, 'Radiograph saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = DentalRadiograph::findOrFail($id);

        $input = $request->except('image');

        if ($request->hasFile('image')) {
            if ($data->image_path) {
                Storage::disk('public')->delete($data->image_path);
            }
            $path = $request->file('image')->store('dental-radiographs', 'public');
            $input['image_path'] = $path;
        }

        $data->update($input);
        $data->image_url = $data->image_path ? url('storage/' . $data->image_path) : null;

        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        $data = DentalRadiograph::findOrFail($id);
        if ($data->image_path) {
            Storage::disk('public')->delete($data->image_path);
        }
        $data->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
