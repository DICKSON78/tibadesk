<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\ExpensePayment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExpensePaymentsController extends Controller
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
            'sort_direction' => 'sometimes|in:asc,desc',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $with_expense = $request->with_expense;
        $expense_id = $request->expense_id;
        $category_id = $request->category_id;
        $created_by = $request->created_by;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $sort_direction = $request->sort_direction ?? 'asc';
        $data = ExpensePayment::with(['creator']);

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

        if ($with_expense == 'Yes') {
            $data->with(['expense.category']);
        }

        if ($expense_id) {
            $data->where('expense_id', $expense_id);
        }

        if ($category_id) {
            $data->whereHas('expense', function ($query) use ($category_id) {
                $query->where('category_id', $category_id);
            });
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

        $data->orderBy('created_at', $sort_direction);
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
            'expense_id' => 'required|exists:expenses,id',
            'amount' => 'required|numeric|min:0',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = ExpensePayment::create($input);
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
        $data = ExpensePayment::with(['expense.category', 'creator'])->findOrFail($id);
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
            'expense_id' => 'sometimes|required|exists:expenses,id',
            'amount' => 'sometimes|required|numeric|min:0',
        ]);

        $data = ExpensePayment::findOrFail($id);
        $data->update($request->all());
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
        $data = ExpensePayment::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
