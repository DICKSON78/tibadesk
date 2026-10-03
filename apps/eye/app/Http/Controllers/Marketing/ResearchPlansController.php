<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Marketing\ResearchPlan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ResearchPlansController extends Controller
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
        $status = $request->status;
        $q = $request->q;
        $created_by = $request->created_by;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = ResearchPlan::with(['creator']);

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

        if ($status) {
            $data->where('status', $status);
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
            'title' => 'required',
        ]);

        $input = $request->except('status');
        $input['created_by'] = $request->user()->id;
        $data = ResearchPlan::create($input);
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
        $data = ResearchPlan::with(['creator', 'canceller', 'completer'])->findOrFail($id);
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
            'title' => 'sometimes|required',
            'status' => 'sometimes|required|in:Pending,Cancelled,Completed',
        ]);

        $input = $request->except('cancelled_at', 'cancelled_by', 'completed_at', 'completed_by');
        $data = ResearchPlan::findOrFail($id);

        if ($data->status != 'Cancelled' && $request->status == 'Cancelled') {
            $input['cancelled_at'] = Carbon::now();
            $input['cancelled_by'] = $request->user()->id;
        }

        if ($data->status != 'Completed' && $request->status == 'Completed') {
            $input['completed_at'] = Carbon::now();
            $input['completed_by'] = $request->user()->id;
        }

        if ($request->status == 'Pending') {
            $input['cancelled_at'] = null;
            $input['cancelled_by'] = null;
            $input['completed_at'] = null;
            $input['completed_by'] = null;
            $input['remarks'] = null;
        }

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
        $data = ResearchPlan::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
