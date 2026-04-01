<?php

namespace App\Http\Controllers;

use App\Http\Requests\PointageStoreRequest;
use App\Http\Requests\PointageUpdateRequest;
use App\Http\Resources\PointageResource;
use App\Models\Pointage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PointageController extends Controller
{
    public function index(Request $request): Response
    {
        $pointages = Pointage::all();
    }

    public function store(PointageStoreRequest $request)
    {
        $pointage = Pointage::create($request->validated());

        return $pointage;
    }

    public function show(Request $request, Pointage $pointage): PointageResource
    {
        return new PointageResource($pointage);
    }

    public function update(PointageUpdateRequest $request, Pointage $pointage): PointageResource
    {
        $pointage->update($request->validated());

        return new PointageResource($pointage);
    }

    public function destroy(Request $request, Pointage $pointage): Response
    {
        $pointage->delete();

        return response()->noContent();
    }
}
