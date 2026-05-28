<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Http\Requests\ClotureHadRequest;
use App\Http\Resources\CrFinHadResource;
use App\Models\CrFinHad;
use App\Models\PatientHad;
use App\Services\Had\ClotureHadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClotureHadController extends Controller
{
    private ClotureHadService $clotureService;

    public function __construct(ClotureHadService $clotureService)
    {
        $this->clotureService = $clotureService;
    }

    /**
     * Clôturer un patient HAD
     */
    public function cloturer(ClotureHadRequest $request, PatientHad $patientHad): JsonResponse
    {
        try {
            // Vérifier que le patient peut être clôturé
            $verification = $this->clotureService->peutEtreCloture($patientHad);
            if (!$verification['possible']) {
                return response()->json([
                    'error' => 'Impossible de clôturer le patient',
                    'motifs' => $verification['motifs'],
                ], 422);
            }

            $cr = $this->clotureService->cloturer($patientHad, $request->validated());

            return response()->json([
                'message' => 'Patient HAD clôturé avec succès',
                'compte_rendu' => new CrFinHadResource($cr),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la clôture HAD',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Valider le compte-rendu
     */
    public function valider(CrFinHad $cr): JsonResponse
    {
        try {
            $cr = $this->clotureService->valider($cr);

            return response()->json([
                'message' => 'Compte-rendu validé avec succès',
                'compte_rendu' => new CrFinHadResource($cr),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la validation du CR',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Obtenir l'URL temporaire du PDF
     */
    public function pdf(CrFinHad $cr): JsonResponse
    {
        try {
            if (!$cr->hasDocumentPdf()) {
                return response()->json([
                    'error' => 'Aucun document PDF disponible',
                ], 404);
            }

            // Générer une URL temporaire signée (valide 5 minutes)
            $url = Storage::temporaryUrl($cr->document_pdf_path, now()->addMinutes(5));

            return response()->json([
                'pdf_url' => $url,
                'filename' => basename($cr->document_pdf_path),
                'expires_at' => now()->addMinutes(5)->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la génération de l\'URL',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Vérifier si un patient peut être clôturé
     */
    public function verifierCloture(PatientHad $patientHad): JsonResponse
    {
        $verification = $this->clotureService->peutEtreCloture($patientHad);

        return response()->json([
            'possible' => $verification['possible'],
            'motifs' => $verification['motifs'],
            'patient' => [
                'id' => $patientHad->id,
                'nom' => $patientHad->nom,
                'prenom' => $patientHad->prenom,
                'statut_had' => $patientHad->statut_had,
                'date_debut_had' => $patientHad->date_debut_had->format('d/m/Y'),
            ],
        ]);
    }
}
