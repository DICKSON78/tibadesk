<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\CommunicationLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class CommunicationLogsController extends Controller
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

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $communication_type = $request->communication_type;
        $communication_direction = $request->communication_direction;
        $q = $request->q;
        $created_by = $request->created_by;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = CommunicationLog::with(['creator']);

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($communication_type) {
            $data->where('communication_type', $communication_type);
        }

        if ($communication_direction) {
            $data->where('communication_direction', $communication_direction);
        }

        if ($q) {
            $data->where('description', 'like', '%' . $q . '%');
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
            'communication_type' => 'required|in:Phone,Chat,Email',
            'communication_direction' => 'required|in:Incoming,Outgoing',
            'description' => 'required',
            'attachment' => 'nullable|file',
        ]);

        $input = $request->except('attachment');
        $input['created_by'] = $request->user()->id;

        if ($request->attachment) {
            $file = $request->attachment;
            $filename = sprintf('%d_%s.%s', Carbon::now()->getTimestamp(), Str::random(), $file->getClientOriginalExtension());
            $file->move('uploads', $filename);
            $input['attachment'] = sprintf('uploads/%s', $filename);
        }

        $data = CommunicationLog::create($input);
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
        $data = CommunicationLog::with(['creator'])->findOrFail($id);
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
            'communication_type' => 'sometimes|required|in:Phone,Chat,Email',
            'communication_direction' => 'sometimes|required|in:Incoming,Outgoing',
            'description' => 'sometimes|required',
        ]);

        $input = $request->except('attachment');
        $data = CommunicationLog::findOrFail($id);
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
        $data = CommunicationLog::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
