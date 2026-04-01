<?php

namespace App\Http\Controllers;

use App\Http\Requests\DelivranceStoreRequest;
use App\Http\Requests\DelivranceUpdateRequest;
use App\Http\Resources\DelivranceResource;
use App\Models\Delivrance;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DelivranceController extends Controller
{
    public function index(Request $request): Response
    {
        $delivrances = Delivrance::all();
    }

    public function store(DelivranceStoreRequest $request)
    {
        $delivrance = Delivrance::create($request->validated());

        return $delivrance;
    }

    public function show(Request $request, Delivrance $delivrance): DelivranceResource
    {
        return new DelivranceResource($delivrance);
    }

    public function update(DelivranceUpdateRequest $request, Delivrance $delivrance): DelivranceResource
    {
        $delivrance->update($request->validated());

        return new DelivranceResource($delivrance);
    }

    public function destroy(Request $request, Delivrance $delivrance): Response
    {
        $delivrance->delete();

        return response()->noContent();
    }
}
