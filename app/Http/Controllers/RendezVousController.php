<?php

namespace App\Http\Controllers;

use App\Http\Requests\RendezVouStoreRequest;
use App\Http\Requests\RendezVouUpdateRequest;
use App\Http\Resources\RendezVouResource;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RendezVousController extends Controller
{
    public function index(Request $request): Response
    {
        $rendezVous = RendezVou::all();
    }

    public function store(RendezVouStoreRequest $request)
    {
        $rendezVous = RendezVous::create($request->validated());

        return $rendez_vous;
    }

    public function show(Request $request, RendezVou $rendezVou): RendezVouResource
    {
        return new RendezVouResource($rendezVou);
    }

    public function update(RendezVouUpdateRequest $request, RendezVou $rendezVou): RendezVouResource
    {
        $rendezVou->update($request->validated());

        return new RendezVouResource($rendezVou);
    }

    public function destroy(Request $request, RendezVou $rendezVou): Response
    {
        $rendezVou->delete();

        return response()->noContent();
    }
}
