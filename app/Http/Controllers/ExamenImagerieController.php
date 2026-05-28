<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExamenImagerieStoreRequest;
use App\Http\Requests\ExamenImagerieUpdateRequest;
use App\Http\Resources\ExamenImagerieResource;
use App\Models\ExamenImagerie;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExamenImagerieController extends Controller
{
    public function index(Request $request)
    {
        $examenImageries = ExamenImagerie::all();
    }

    public function store(ExamenImagerieStoreRequest $request)
    {
        $examenImagerie = ExamenImagerie::create($request->validated());

        return $examen_imagerie;
    }

    public function show(Request $request, ExamenImagerie $examenImagerie): ExamenImagerieResource
    {
        return new ExamenImagerieResource($examenImagerie);
    }

    public function update(ExamenImagerieUpdateRequest $request, ExamenImagerie $examenImagerie): ExamenImagerieResource
    {
        $examenImagerie->update($request->validated());

        return new ExamenImagerieResource($examenImagerie);
    }

    public function destroy(Request $request, ExamenImagerie $examenImagerie): Response
    {
        $examenImagerie->delete();

        return response()->noContent();
    }
}
