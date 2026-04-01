<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdmissionStoreRequest;
use App\Http\Requests\AdmissionUpdateRequest;
use App\Http\Resources\AdmissionResource;
use App\Models\Admission;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $admissions = Admission::all();
    }

    public function store(AdmissionStoreRequest $request)
    {
        $admission = Admission::create($request->validated());

        return $admission;
    }

    public function show(Request $request, Admission $admission): AdmissionResource
    {
        return new AdmissionResource($admission);
    }

    public function update(AdmissionUpdateRequest $request, Admission $admission): AdmissionResource
    {
        $admission->update($request->validated());

        return new AdmissionResource($admission);
    }

    public function destroy(Request $request, Admission $admission): Response
    {
        $admission->delete();

        return response()->noContent();
    }
}
