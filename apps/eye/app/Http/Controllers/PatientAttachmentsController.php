<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientAttachment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class PatientAttachmentsController extends Controller
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
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $per_page = $request->per_page ?? 25;
        $q = $request->q;
        $patient_id = $request->patient_id;
        $created_by = $request->created_by;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = PatientAttachment::with(['creator']);

        if ($patient_id) {
            $data->where('patient_id', $patient_id);
        }

        if ($q) {
            $data->where('title', 'like', '%' . $q . '%');
        }

        if ($created_by) {
            $data->where('created_by', $created_by);
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'title' => 'required',
            'attachment' => 'nullable|file',
        ]);

        $input = $request->except('attachment');
        $input['created_by'] = $request->user()->id;

        if ($request->attachment) {
            $file = $request->attachment;
            $filename = sprintf('%d_%s.%s', Carbon::now()->getTimestamp(), Str::random(), $file->getClientOriginalExtension());
            $file->move('uploads', $filename);
            $input['path'] = sprintf('uploads/%s', $filename);
        }

        $data = PatientAttachment::create($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientAttachment::with(['creator'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'patient_id' => 'sometimes|required|exists:patients,id',
            'title' => 'sometimes|required',
        ]);

        $input = $request->only('patient_id', 'title', 'description');
        $data = PatientAttachment::findOrFail($id);
        $data->update($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $data = PatientAttachment::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
