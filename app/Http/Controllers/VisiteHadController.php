<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisiteHadStoreRequest;
use App\Http\Requests\VisiteHadUpdateRequest;
use App\Http\Resources\VisiteHadResource;
use App\Models\VisiteHad;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class VisiteHadController extends Controller
{
    public function index(Request $request): Response
    {
        $visiteHads = VisiteHad::all();
    }

    public function store(VisiteHadStoreRequest $request)
    {
        $visiteHad = VisiteHad::create($request->validated());

        return $visite_had;
    }

    public function show(Request $request, VisiteHad $visiteHad): VisiteHadResource
    {
        return new VisiteHadResource($visiteHad);
    }

    public function update(VisiteHadUpdateRequest $request, VisiteHad $visiteHad): VisiteHadResource
    {
        $visiteHad->update($request->validated());

        return new VisiteHadResource($visiteHad);
    }

    public function destroy(Request $request, VisiteHad $visiteHad): Response
    {
        $visiteHad->delete();

        return response()->noContent();
    }
}
