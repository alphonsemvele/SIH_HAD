<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaiementStoreRequest;
use App\Http\Requests\PaiementUpdateRequest;
use App\Http\Resources\PaiementResource;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaiementController extends Controller
{
    public function index(Request $request): Response
    {
        $paiements = Paiement::all();
    }

    public function store(PaiementStoreRequest $request)
    {
        $paiement = Paiement::create($request->validated());

        return $paiement;
    }

    public function show(Request $request, Paiement $paiement): PaiementResource
    {
        return new PaiementResource($paiement);
    }

    public function update(PaiementUpdateRequest $request, Paiement $paiement): PaiementResource
    {
        $paiement->update($request->validated());

        return new PaiementResource($paiement);
    }

    public function destroy(Request $request, Paiement $paiement): Response
    {
        $paiement->delete();

        return response()->noContent();
    }
}
