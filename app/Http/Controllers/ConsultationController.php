<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConsultationStoreRequest;
use App\Http\Requests\ConsultationUpdateRequest;
use App\Http\Resources\ConsultationResource;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ConsultationController extends Controller
{
    public function index(Request $request): Response
    {
        $consultations = Consultation::all();
    }

    public function store(ConsultationStoreRequest $request)
    {
        $consultation = Consultation::create($request->validated());

        return $consultation;
    }

    public function show(Request $request, Consultation $consultation): ConsultationResource
    {
        return new ConsultationResource($consultation);
    }

    public function update(ConsultationUpdateRequest $request, Consultation $consultation): ConsultationResource
    {
        $consultation->update($request->validated());

        return new ConsultationResource($consultation);
    }

    public function destroy(Request $request, Consultation $consultation): Response
    {
        $consultation->delete();

        return response()->noContent();
    }
}
