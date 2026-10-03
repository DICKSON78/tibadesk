<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\UserPrivilege;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
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

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $status = $request->status;
        $name = $request->name;
        $gender = $request->gender;
        $phone = $request->phone;
        $designation = $request->designation;
        $department_id = $request->department_id;
        $job_title_id = $request->job_title_id;
        $employee_number = $request->employee_number;
        $data = User::with(['department', 'job_title', 'privileges', 'creator']);

        if ($user->is_admin) {
            $data->with(['clinic']);

            if ($clinic_id) {
                $data->where('clinic_id', $clinic_id);
            }
        } else {
            $data->where('clinic_id', $user->clinic_id);
            $data->where('role', '!=', 'Admin');
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($name) {
            $data->fullName('%' . $name . '%');
        }

        if ($gender) {
            $data->where('gender', $gender);
        }

        if ($phone) {
            $data->where('phone', 'like', '%' . $phone . '%');
        }

        if ($designation) {
            $data->where('designation', $designation);
        }

        if ($department_id) {
            $data->where('department_id', $department_id);
        }

        if ($job_title_id) {
            $data->where('job_title_id', $job_title_id);
        }

        if ($employee_number) {
            $data->where('employee_number', $employee_number);
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
        $user = $request->user();
        if ($user->is_admin) {
            $request->validate([
                'clinic_id' => 'required|exists:clinics,id',
            ]);

            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'username' => 'required|unique:users,username',
            'gender' => 'required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'designation' => 'nullable|in:Doctor,Other',
            'department_id' => 'nullable|exists:departments,id',
            'job_title_id' => 'nullable|exists:job_titles,id',
            'employee_number' => 'nullable|unique:users,employee_number',
            'password' => 'required',
            'privileges' => 'sometimes|array',
        ]);

        $input = $request->except('password', 'privileges');
        $input['clinic_id'] = $clinic_id;
        $input['password'] = Hash::make($request->password);
        $input['created_by'] = $request->user()->id;
        $data = User::create($input);

        if ($data && $request->privileges) {
            $privileges = array_map(function ($e) use ($data) {
                return ['user_id' => $data->id, 'privilege' => $e];
            }, $request->json('privileges'));

            UserPrivilege::insert($privileges);
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
        $data = User::with(['job_title', 'privileges', 'creator'])->findOrFail($id);
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
            'first_name' => 'sometimes|required',
            'last_name' => 'sometimes|required',
            'username' => 'sometimes|required|unique:users,username,' . $id,
            'gender' => 'sometimes|required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'designation' => 'nullable|in:Doctor,Other',
            'department_id' => 'nullable|exists:departments,id',
            'job_title_id' => 'nullable|exists:job_titles,id',
            'employee_number' => 'nullable|unique:users,employee_number,' . $id,
            'status' => 'sometimes|required|in:Active,Inactive',
            'privileges' => 'sometimes|array',
        ]);

        $data = User::findOrFail($id);
        $input = $request->except('privileges');

        if ($request->password) {
            $input['password'] = Hash::make($request->password);
        }

        $data->update($input);

        if ($request->privileges !== null) {
            // delete and reinsert privileges
            UserPrivilege::where('user_id', $data->id)->delete();
            $privileges = array_map(function ($e) use ($data) {
                return ['user_id' => $data->id, 'privilege' => $e];
            }, $request->json('privileges'));

            UserPrivilege::insert($privileges);
        }

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
        //
    }
}
