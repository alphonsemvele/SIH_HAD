<?php

namespace App\Http\Controllers;

use App\Http\Requests\FactureStoreRequest;
use App\Http\Requests\FactureUpdateRequest;
use App\Http\Resources\FactureResource;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FactureController extends Controller
{
    public function index(Request $request): Response
    {
        $factures = Facture::all();
    }

    public function store(FactureStoreRequest $request)
    {
        $facture = Facture::create($request->validated());

        return $facture;
    }

    public function show(Request $request, Facture $facture): FactureResource
    {
        return new FactureResource($facture);
    }

    public function update(FactureUpdateRequest $request, Facture $facture): FactureResource
    {
        $facture->update($request->validated());

        return new FactureResource($facture);
    }

    public function destroy(Request $request, Facture $facture): Response
    {
        $facture->delete();

        return response()->noContent();
    }
}
