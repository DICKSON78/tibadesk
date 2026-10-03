<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalOralExamination;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalOralExaminationsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'consultation_id' => 'sometimes|exists:consultations,id',
        ]);

        $per_page = $request->per_page ?? 25;
        $data = DentalOralExamination::with(['consultation', 'creator']);

        if ($request->consultation_id) {
            $data->where('consultation_id', $request->consultation_id);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function show($id)
    {
        $data = DentalOralExamination::with(['consultation', 'creator'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'lips' => 'nullable|string',
            'buccal_mucosa' => 'nullable|string',
            'tongue' => 'nullable|string',
            'floor_of_mouth' => 'nullable|string',
            'hard_palate' => 'nullable|string',
            'soft_palate' => 'nullable|string',
            'oropharynx' => 'nullable|string',
            'gingiva' => 'nullable|string',
            'salivary_glands' => 'nullable|string',
            'occlusion' => 'nullable|string',
            'other_findings' => 'nullable|string',
        ]);

        $data = DentalOralExamination::where('consultation_id', $request->consultation_id)->first();
        if ($data) {
            $data->update($request->except('consultation_id'));
        } else {
            $input = $request->all();
            $input['created_by'] = $request->user()->id;
            $data = DentalOralExamination::create($input);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = DentalOralExamination::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        DentalOralExamination::findOrFail($id)->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
