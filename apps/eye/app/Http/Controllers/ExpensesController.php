<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Expense;
use App\Models\ExpensePayment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExpensesController extends Controller
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
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $status = $request->status;
        $category_id = $request->category_id;
        $created_by = $request->created_by;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Expense::with(['category', 'creator']);

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

        if ($status == 'Pending') {
            $data->whereRaw('coalesce((select sum(amount) from expense_payments where expense_id = expenses.id), 0) < total_amount');
        }

        if ($status == 'Cleared') {
            $data->whereRaw('coalesce((select sum(amount) from expense_payments where expense_id = expenses.id), 0) >= total_amount');
        }

        if ($category_id) {
            $data->where('category_id', $category_id);
        }

        if ($created_by) {
            $data->where('created_by', $created_by);
        }

        if ($start_date) {
            $data->whereDate('expense_date', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('expense_date', '<=', $end_date);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);

        $data->each(function ($e) {
            $e->append('paid_amount');
        });
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
            'category_id' => 'required|exists:expense_categories,id',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date_format:Y-m-d',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = Expense::create($input);

        if ($data) {
            ExpensePayment::create([
                'expense_id' => $data->id,
                'amount' => $request->paid_amount,
                'created_by' => $input['created_by'],
            ]);
        }

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
        $data = Expense::with(['category', 'creator'])->findOrFail($id)->append('paid_amount');
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
            'category_id' => 'sometimes|required|exists:expense_categories,id',
            'total_amount' => 'sometimes|required|numeric|min:0',
            'expense_date' => 'sometimes|required|date_format:Y-m-d',
        ]);

        $data = Expense::findOrFail($id);
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
        $data = Expense::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
