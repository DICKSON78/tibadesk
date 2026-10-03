<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalCharting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalChartingController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'consultation_id' => 'sometimes|exists:consultations,id',
        ]);

        $per_page = $request->per_page ?? 100;
        $data = DentalCharting::with(['consultation', 'creator']);

        if ($request->consultation_id) {
            $data->where('consultation_id', $request->consultation_id);
        }

        $data->orderBy('tooth_number');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function show($id)
    {
        $data = DentalCharting::with(['consultation', 'creator'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'tooth_number' => 'required|integer|between:11,48',
            'tooth_quadrant' => 'nullable|string',
            'status' => 'nullable|string',
            'caries_status' => 'nullable|string',
            'restoration_type' => 'nullable|string',
            'surface_involved' => 'nullable|string',
            'mobility' => 'nullable|string',
            'periodontal_pocket_depth' => 'nullable|string',
            'bleeding_on_probing' => 'nullable|boolean',
            'furcation_involvement' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = DentalCharting::create($input);

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'teeth' => 'required|array',
            'teeth.*.tooth_number' => 'required|integer|between:11,48',
            'teeth.*.status' => 'nullable|string',
            'teeth.*.caries_status' => 'nullable|string',
            'teeth.*.restoration_type' => 'nullable|string',
            'teeth.*.surface_involved' => 'nullable|string',
            'teeth.*.mobility' => 'nullable|string',
            'teeth.*.periodontal_pocket_depth' => 'nullable|string',
            'teeth.*.bleeding_on_probing' => 'nullable|boolean',
            'teeth.*.furcation_involvement' => 'nullable|string',
            'teeth.*.notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $consultationId = $request->consultation_id;

        DentalCharting::where('consultation_id', $consultationId)->delete();

        $records = [];
        foreach ($request->teeth as $tooth) {
            $records[] = DentalCharting::create([
                'consultation_id' => $consultationId,
                'tooth_number' => $tooth['tooth_number'],
                'tooth_quadrant' => $tooth['tooth_quadrant'] ?? null,
                'status' => $tooth['status'] ?? null,
                'caries_status' => $tooth['caries_status'] ?? null,
                'restoration_type' => $tooth['restoration_type'] ?? null,
                'surface_involved' => $tooth['surface_involved'] ?? null,
                'mobility' => $tooth['mobility'] ?? null,
                'periodontal_pocket_depth' => $tooth['periodontal_pocket_depth'] ?? null,
                'bleeding_on_probing' => $tooth['bleeding_on_probing'] ?? false,
                'furcation_involvement' => $tooth['furcation_involvement'] ?? null,
                'notes' => $tooth['notes'] ?? null,
                'created_by' => $user->id,
            ]);
        }

        return $this->sendResponse($records, Response::HTTP_OK, 'Charting saved successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = DentalCharting::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        DentalCharting::findOrFail($id)->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }

    public function getByConsultation($consultationId)
    {
        $data = DentalCharting::where('consultation_id', $consultationId)
            ->orderBy('tooth_number')
            ->get();
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
