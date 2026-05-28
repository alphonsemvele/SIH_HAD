<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

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

    public function store(RealisationVisiteRequest $request, int $visite): JsonResponse
    {
        $visiteHad = VisiteHad::findOrFail($visite);
        $files = $request->allFiles();
        $data = $request->validated();

        $visiteHad = $this->realisationService->enregistrer($visiteHad, $data, $files);

        return response()->json([
            'visite' => new VisiteHadResource($visiteHad),
            'preuve_status' => 'en_cours_de_generation',
        ]);
    }
}
