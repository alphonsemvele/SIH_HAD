<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssuranceStoreRequest;
use App\Http\Requests\AssuranceUpdateRequest;
use App\Http\Resources\AssuranceResource;
use App\Models\Assurance;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AssuranceController extends Controller
{
    public function index(Request $request)
    {
        $assurances = Assurance::all();

        return $assurances;
    }

    public function store(AssuranceStoreRequest $request)
    {
        $assurance = Assurance::create($request->validated());

        return $assurance;
    }

    public function show(Request $request, Assurance $assurance): AssuranceResource
    {
        return new AssuranceResource($assurance);
    }

    public function update(AssuranceUpdateRequest $request, Assurance $assurance): AssuranceResource
    {
        $assurance->update($request->validated());

        return new AssuranceResource($assurance);
    }

    public function destroy(Request $request, Assurance $assurance): Response
    {
        $assurance->delete();

        return response()->noContent();
    }
}
