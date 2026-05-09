<?php

namespace App\Http\Controllers;

use App\Http\Requests\RealisationVisiteRequest;
use App\Http\Resources\VisiteHadResource;
use App\Models\VisiteHad;
use App\Services\Had\RealisationVisiteService;
use Illuminate\Http\JsonResponse;

class RealisationVisiteController extends Controller
{
    public function __construct(
        private RealisationVisiteService $realisationService
    ) {}

    public function store(RealisationVisiteRequest $request, VisiteHad $visite): JsonResponse
    {
        $files = $request->allFiles();
        $data = $request->validated();
        
        $visite = $this->realisationService->enregistrer($visite, $data, $files);
        
        return response()->json([
            'visite' => new VisiteHadResource($visite),
            'preuve_status' => 'en_cours_de_generation'
        ]);
    }
}
