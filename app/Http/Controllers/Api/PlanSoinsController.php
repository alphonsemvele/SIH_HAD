<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Http\Requests\PlanSoinsCreateRequest;
use App\Http\Requests\PlanSoinsReevaluerRequest;
use App\Http\Resources\PlanSoinsResource;
use App\Models\PatientHad;
use App\Models\PlanSoins;
use App\Services\Had\PlanSoinsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanSoinsController extends Controller
{
    private PlanSoinsService $planSoinsService;

    public function __construct(PlanSoinsService $planSoinsService)
    {
        $this->planSoinsService = $planSoinsService;
    }

    /**
     * Créer un nouveau plan de soins pour un patient HAD
     */
    public function creer(PlanSoinsCreateRequest $request, PatientHad $patientHad): JsonResponse
    {
        try {
            $plan = $this->planSoinsService->creer($patientHad->id, $request->validated());
            
            return response()->json([
                'message' => 'Plan de soins créé avec succès',
                'plan' => new PlanSoinsResource($plan),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la création du plan de soins',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Afficher un plan de soins avec ses prestations
     */
    public function afficher(PlanSoins $plan): JsonResponse
    {
        $plan->load(['prestations', 'patientHad', 'creePar', 'prestations.acteMedical']);
        
        return response()->json([
            'plan' => new PlanSoinsResource($plan),
        ]);
    }

    /**
     * Activer un plan de soins et générer les visites
     */
    public function activer(PlanSoins $plan): JsonResponse
    {
        try {
            $plan = $this->planSoinsService->activer($plan);
            
            return response()->json([
                'message' => 'Plan de soins activé avec succès',
                'plan' => new PlanSoinsResource($plan),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'activation du plan de soins',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Réévaluer un plan de soins (créer une nouvelle version)
     */
    public function reevaluer(PlanSoinsReevaluerRequest $request, PlanSoins $plan): JsonResponse
    {
        try {
            $nouveauPlan = $this->planSoinsService->reevaluer($plan, $request->validated());
            
            return response()->json([
                'message' => 'Plan de soins réévalué avec succès',
                'ancien_plan' => new PlanSoinsResource($plan),
                'nouveau_plan' => new PlanSoinsResource($nouveauPlan),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la réévaluation du plan de soins',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Obtenir le plan actif d'un patient
     */
    public function planActuel(PatientHad $patientHad): JsonResponse
    {
        $plan = $this->planSoinsService->getPlanActif($patientHad->id);
        
        if (!$plan) {
            return response()->json([
                'message' => 'Aucun plan de soins actif pour ce patient',
                'plan' => null,
            ]);
        }
        
        $plan->load(['prestations', 'patientHad', 'creePar', 'prestations.acteMedical']);
        
        return response()->json([
            'plan' => new PlanSoinsResource($plan),
        ]);
    }
}
