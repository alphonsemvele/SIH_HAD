<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientHadStoreRequest;
use App\Http\Requests\PatientHadUpdateRequest;
use App\Http\Resources\PatientHadResource;
use App\Models\PatientHad;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientHadController extends Controller
{
    public function index(Request $request): Response
    {
        $patientHads = PatientHad::all();
    }

    public function store(PatientHadStoreRequest $request)
    {
        $patientHad = PatientHad::create($request->validated());

        return $patient_had;
    }

    public function show(Request $request, PatientHad $patientHad): PatientHadResource
    {
        return new PatientHadResource($patientHad);
    }

    public function update(PatientHadUpdateRequest $request, PatientHad $patientHad): PatientHadResource
    {
        $patientHad->update($request->validated());

        return new PatientHadResource($patientHad);
    }

    public function destroy(Request $request, PatientHad $patientHad): Response
    {
        $patientHad->delete();

        return response()->noContent();
    }
}
