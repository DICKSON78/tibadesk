<?php

namespace App\Http\Controllers;

use App\Constants\RolePrivileges;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\UserPrivilege;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    use ApiResponse;

    private $allowedPrivileges = [
        'dashboard', 'reception', 'payment_center', 'consultation_room',
        'dental_lab', 'medicine_center', 'procedure_room', 'dispensing',
        'other_dispensing', 'inventory_management', 'marketing',
        'financial_management', 'user_management', 'settings',
    ];

    public function roles()
    {
        return $this->sendResponse(RolePrivileges::ROLES, Response::HTTP_OK, 'Success.');
    }

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

        // Expose full staff records only to admins or those managing users/settings.
        // All other roles (clinical/dispensing/billing) get a sanitized list for
        // consultant/staff selection dropdowns, without PII (phone/email/national id/DOB).
        $isSensitiveReader = $user->is_admin
            || $user->hasPrivilege('user_management')
            || $user->hasPrivilege('settings');

        if (!$isSensitiveReader) {
            $data->select([
                'id', 'clinic_id', 'first_name', 'middle_name', 'last_name',
                'designation', 'role', 'status',
            ]);
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

        $roleKeys = implode(',', RolePrivileges::getRoleKeys());

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
            'role' => 'required|in:' . $roleKeys,
            'privileges' => 'sometimes|array',
        ]);

        if (!$user->is_admin && $request->role === 'Admin') {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Only admins can assign the Admin role.');
        }

        $input = $request->except('password', 'privileges');
        $input['clinic_id'] = $clinic_id;
        $input['password'] = Hash::make($request->password);
        $input['created_by'] = $request->user()->id;
        $data = User::create($input);

        if ($data) {
            $privilegesToAssign = $request->privileges;

            if (empty($privilegesToAssign)) {
                $privilegesToAssign = RolePrivileges::getPrivilegesForRole($request->role);
            }

            $validPrivileges = array_intersect($privilegesToAssign, $this->allowedPrivileges);
            if (!empty($validPrivileges)) {
                $privilegeRows = array_map(function ($e) use ($data) {
                    return ['user_id' => $data->id, 'privilege' => $e];
                }, $validPrivileges);

                UserPrivilege::insert($privilegeRows);
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $data = User::with(['job_title', 'privileges', 'creator'])->findOrFail($id);

        $isSensitiveReader = $user && ($user->is_admin
            || $user->hasPrivilege('user_management')
            || $user->hasPrivilege('settings'));

        if ($user && !$isSensitiveReader) {
            $data->setVisible([
                'id', 'clinic_id', 'first_name', 'middle_name', 'last_name',
                'designation', 'role', 'status', 'full_name', 'is_admin',
            ]);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function update(Request $request, $id)
    {
        $roleKeys = implode(',', RolePrivileges::getRoleKeys());

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
            'role' => 'required|in:' . $roleKeys,
            'privileges' => 'sometimes|array',
        ]);

        $currentUser = $request->user();
        $data = User::findOrFail($id);

        if (!$currentUser->is_admin && $request->role === 'Admin') {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Only admins can assign the Admin role.');
        }

        if (!$currentUser->is_admin && $data->is_admin && $request->role !== 'Admin') {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Only admins can demote an admin user.');
        }

        $input = $request->except('privileges');

        if ($request->password) {
            $input['password'] = Hash::make($request->password);
        }

        $data->update($input);

        if ($request->privileges !== null) {
            UserPrivilege::where('user_id', $data->id)->delete();

            $validPrivileges = array_intersect($request->privileges, $this->allowedPrivileges);
            if (!empty($validPrivileges)) {
                $privilegeRows = array_map(function ($e) use ($data) {
                    return ['user_id' => $data->id, 'privilege' => $e];
                }, $validPrivileges);

                UserPrivilege::insert($privilegeRows);
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()->is_admin) {
            return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_FORBIDDEN, 'Unauthorized. Admin only.');
        }

        User::findOrFail($id)->delete();
        return $this->sendResponse(null, \Illuminate\Http\Response::HTTP_OK, 'Deleted successfully.');
    }
}
