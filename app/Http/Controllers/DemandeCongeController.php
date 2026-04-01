<?php

namespace App\Http\Controllers;

use App\Http\Requests\DemandeCongeStoreRequest;
use App\Http\Requests\DemandeCongeUpdateRequest;
use App\Http\Resources\DemandeCongeResource;
use App\Models\DemandeConge;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DemandeCongeController extends Controller
{
    public function index(Request $request): Response
    {
        $demandeConges = DemandeConge::all();
    }

    public function store(DemandeCongeStoreRequest $request)
    {
        $demandeConge = DemandeConge::create($request->validated());

        return $demande_conge;
    }

    public function show(Request $request, DemandeConge $demandeConge): DemandeCongeResource
    {
        return new DemandeCongeResource($demandeConge);
    }

    public function update(DemandeCongeUpdateRequest $request, DemandeConge $demandeConge): DemandeCongeResource
    {
        $demandeConge->update($request->validated());

        return new DemandeCongeResource($demandeConge);
    }

    public function destroy(Request $request, DemandeConge $demandeConge): Response
    {
        $demandeConge->delete();

        return response()->noContent();
    }
}
