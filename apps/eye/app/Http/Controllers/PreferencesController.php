<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Preference;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PreferencesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $data = Preference::where('clinic_id', $request->user()->clinic_id)->get();
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
            'preferences' => 'required|array',
            'preferences.*.key' => 'required',
            'preferences.*.value' => 'nullable',
        ]);

        $data = [];
        $preferences = $request->json('preferences');
        $clinic_id = $request->user()->clinic_id;

        foreach ($preferences as &$input) {
            $preference = Preference::where('clinic_id', $clinic_id)
                ->where('key', $input['key'])
                ->first();
            if ($preference) {
                $preference->update(['value' => $input['value']]);
            } else {
                $input['clinic_id'] = $clinic_id;
                $preference = Preference::create($input);
            }

            $data[] = $preference;
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return Response
     */
    public function show($id)
    {
        $data = Preference::findOrFail($id);
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
        $data = Preference::findOrFail($id);
        $data->update($request->only('value'));
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
