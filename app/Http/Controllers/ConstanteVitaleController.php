<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConstanteVitaleStoreRequest;
use App\Http\Requests\ConstanteVitaleUpdateRequest;
use App\Http\Resources\ConstanteVitaleResource;
use App\Models\ConstanteVitale;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ConstanteVitaleController extends Controller
{
    public function index(Request $request): Response
    {
        $constanteVitales = ConstanteVitale::all();
    }

    public function store(ConstanteVitaleStoreRequest $request)
    {
        $constanteVitale = ConstanteVitale::create($request->validated());

        return $constante_vitale;
    }

    public function show(Request $request, ConstanteVitale $constanteVitale): ConstanteVitaleResource
    {
        return new ConstanteVitaleResource($constanteVitale);
    }

    public function update(ConstanteVitaleUpdateRequest $request, ConstanteVitale $constanteVitale): ConstanteVitaleResource
    {
        $constanteVitale->update($request->validated());

        return new ConstanteVitaleResource($constanteVitale);
    }

    public function destroy(Request $request, ConstanteVitale $constanteVitale): Response
    {
        $constanteVitale->delete();

        return response()->noContent();
    }
}
