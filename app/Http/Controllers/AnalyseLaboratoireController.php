<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyseLaboratoireStoreRequest;
use App\Http\Requests\AnalyseLaboratoireUpdateRequest;
use App\Http\Resources\AnalyseLaboratoireResource;
use App\Models\AnalyseLaboratoire;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AnalyseLaboratoireController extends Controller
{
    public function index(Request $request)
    {
        $analyseLaboratoires = AnalyseLaboratoire::all();
    }

    public function store(AnalyseLaboratoireStoreRequest $request)
    {
        $analyseLaboratoire = AnalyseLaboratoire::create($request->validated());

        return $analyse_laboratoire;
    }

    public function show(Request $request, AnalyseLaboratoire $analyseLaboratoire): AnalyseLaboratoireResource
    {
        return new AnalyseLaboratoireResource($analyseLaboratoire);
    }

    public function update(AnalyseLaboratoireUpdateRequest $request, AnalyseLaboratoire $analyseLaboratoire): AnalyseLaboratoireResource
    {
        $analyseLaboratoire->update($request->validated());

        return new AnalyseLaboratoireResource($analyseLaboratoire);
    }

    public function destroy(Request $request, AnalyseLaboratoire $analyseLaboratoire): Response
    {
        $analyseLaboratoire->delete();

        return response()->noContent();
    }
}
