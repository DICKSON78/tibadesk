<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Clinic;
use App\Models\Preference;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClinicsController extends Controller
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

        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $q = $request->q;
        $data = Clinic::query();

        if ($status) {
            //$data->where('status', $status);
        }

        if ($q) {
            $data->where(function ($query) use ($q) {
                $query->where('name', 'like', '%' . $q . '%');
                $query->orWhere('phone', 'like', '%' . $q . '%');
                $query->orWhere('email', 'like', '%' . $q . '%');
            });
        }

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
            'name' => 'required',
        ]);

        $data = Clinic::create($request->except('logo'));
        if ($data) {
            Preference::insert([
                ['clinic_id' => $data->id, 'key' => 'CONSULTATION_MESSAGE', 'value' => 'Habari {name}, Hongera na asante kwa kupata huduma kwetu. Ni tumaini letu umepata huduma stahiki. Kwa maoni kuhusu huduma zetu tuma ujumbe au piga simu namba 0676 506 323. Karibu sana.'],
                ['clinic_id' => $data->id, 'key' => 'PATIENT_TO_RETURN_REMINDER_MESSAGE', 'value' => 'Habari {name}, Tunakukumbusha kurudi kumuona daktari kesho tarehe {date} kwa ajili ya vipimo ili kufuatilia maendeleo ya afya ya macho yako. Wasiliana nasi 0676 506 323.'],
                ['clinic_id' => $data->id, 'key' => 'SEND_MESSAGES', 'value' => 'No'],
                ['clinic_id' => $data->id, 'key' => 'SEND_REMINDER_MESSAGES_AT', 'value' => '11:00'],
                ['clinic_id' => $data->id, 'key' => 'SMS_SENDER_NAME', 'value' => 'INFO'],
                ['clinic_id' => $data->id, 'key' => 'MARKETING_MODULE', 'value' => 'No'],
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
        $data = Clinic::findOrFail($id);
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
            'name' => 'sometimes|required',
            //'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $data = Clinic::findOrFail($id);
        $data->update($request->except('logo'));
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
