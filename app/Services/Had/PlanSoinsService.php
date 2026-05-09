<?php

namespace App\Services\Had;

use App\Models\ActeMedical;
use App\Models\PlanSoins;
use App\Models\PlanSoinsPrestation;
use App\Models\VisiteHad;
use App\Services\Audit\AuditTrailService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlanSoinsService
{
    private AuditTrailService $auditService;

    public function __construct(AuditTrailService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Créer un nouveau plan de soins
     */
    public function creer(int $patientHadId, array $data): PlanSoins
    {
        return DB::transaction(function () use ($patientHadId, $data) {
            $plan = PlanSoins::create([
                'patient_had_id' => $patientHadId,
                'cree_par_id' => auth()->id(),
                'date_debut' => $data['date_debut'],
                'date_fin_prevue' => $data['date_fin_prevue'],
                'reevaluation_prevue_le' => $data['reevaluation_prevue_le'] ?? null,
                'statut' => 'brouillon',
                'version' => 1,
                'plan_precedent_id' => null,
                'objectifs' => $data['objectifs'] ?? null,
            ]);

            // Créer les prestations si fournies
            if (isset($data['prestations']) && is_array($data['prestations'])) {
                foreach ($data['prestations'] as $prestationData) {
                    $this->ajouterPrestation($plan, $prestationData);
                }
            }

            $this->auditService->log('plan_soins_created', [
                'plan_soins_id' => $plan->id,
                'patient_had_id' => $patientHadId,
                'statut' => 'brouillon',
            ], 'had');

            Log::info('Plan de soins créé', [
                'plan_soins_id' => $plan->id,
                'patient_had_id' => $patientHadId,
                'cree_par' => auth()->id(),
            ]);

            return $plan->load(['prestations', 'patientHad', 'creePar']);
        });
    }

    /**
     * Activer un plan de soins et générer les visites
     */
    public function activer(PlanSoins $plan): PlanSoins
    {
        return DB::transaction(function () use ($plan) {
            if ($plan->statut !== 'brouillon') {
                throw new \Exception('Seul un plan en brouillon peut être activé');
            }

            // Archiver les plans actifs précédents du patient
            $plansActifs = PlanSoins::where('patient_had_id', $plan->patient_had_id)
                ->where('statut', 'actif')
                ->get();

            foreach ($plansActifs as $planActif) {
                $planActif->update(['statut' => 'archive']);
                $this->auditService->log('plan_soins_archived', [
                    'plan_soins_id' => $planActif->id,
                    'patient_had_id' => $planActif->patient_had_id,
                    'raison' => 'Nouveau plan activé',
                ], 'had');
            }

            // Activer le nouveau plan
            $plan->update(['statut' => 'actif']);

            // Générer les visites prévues
            $visitesGenerees = $this->genererVisitesPrevues($plan);

            $this->auditService->log('plan_soins_activated', [
                'plan_soins_id' => $plan->id,
                'patient_had_id' => $plan->patient_had_id,
                'visites_generees' => $visitesGenerees->count(),
            ], 'had');

            Log::info('Plan de soins activé', [
                'plan_soins_id' => $plan->id,
                'patient_had_id' => $plan->patient_had_id,
                'visites_generees' => $visitesGenerees->count(),
            ]);

            return $plan->load(['prestations', 'patientHad', 'creePar']);
        });
    }

    /**
     * Générer les visites prévues pour un plan de soins
     */
    public function genererVisitesPrevues(PlanSoins $plan, ?Carbon $jusquA = null): Collection
    {
        $jusquA = $jusquA ?? $plan->date_fin_prevue;
        $visitesGenerees = collect();

        foreach ($plan->prestations as $prestation) {
            $datesVisites = $this->calculerDatesVisites($prestation, $plan->date_debut, $jusquA);

            foreach ($datesVisites as $dateVisite) {
                // Vérifier si la visite existe déjà
                $visiteExistante = VisiteHad::where('patient_had_id', $plan->patient_had_id)
                    ->where('plan_soins_prestation_id', $prestation->id)
                    ->whereDate('date_visite', $dateVisite)
                    ->first();

                if (!$visiteExistante) {
                    $heurePrevue = $this->getHeurePrevue($prestation, $dateVisite);
                    
                    $visite = VisiteHad::create([
                        'patient_had_id' => $plan->patient_had_id,
                        'plan_soins_prestation_id' => $prestation->id,
                        'date_visite' => $dateVisite,
                        'heure_prevue' => $heurePrevue,
                        'duree_prevue_min' => $prestation->duree_min,
                        'statut' => 'planifiee',
                        'intervenant_id' => null,
                        'motif' => $prestation->libelle,
                        'observations' => 'Visite générée automatiquement par le plan de soins',
                    ]);

                    $visitesGenerees->push($visite);
                }
            }
        }

        return $visitesGenerees;
    }

    /**
     * Réévaluer un plan de soins (créer une nouvelle version)
     */
    public function reevaluer(PlanSoins $plan, array $modifications): PlanSoins
    {
        return DB::transaction(function () use ($plan, $modifications) {
            // Archiver le plan actuel
            $plan->update(['statut' => 'archive']);

            // Créer la nouvelle version
            $nouveauPlan = PlanSoins::create([
                'patient_had_id' => $plan->patient_had_id,
                'cree_par_id' => auth()->id(),
                'date_debut' => $modifications['date_debut'] ?? $plan->date_debut,
                'date_fin_prevue' => $modifications['date_fin_prevue'] ?? $plan->date_fin_prevue,
                'reevaluation_prevue_le' => $modifications['reevaluation_prevue_le'] ?? $plan->reevaluation_prevue_le,
                'statut' => 'brouillon',
                'version' => $plan->version + 1,
                'plan_precedent_id' => $plan->id,
                'objectifs' => $modifications['objectifs'] ?? $plan->objectifs,
            ]);

            // Copier les prestations existantes
            foreach ($plan->prestations as $prestation) {
                $nouvellePrestation = PlanSoinsPrestation::create([
                    'plan_soins_id' => $nouveauPlan->id,
                    'acte_medical_id' => $prestation->acte_medical_id,
                    'libelle' => $prestation->libelle,
                    'frequence_type' => $prestation->frequence_type,
                    'frequence_detail' => $prestation->frequence_detail,
                    'duree_min' => $prestation->duree_min,
                    'intervenants_profils' => $prestation->intervenants_profils,
                    'materiel_requis' => $prestation->materiel_requis,
                    'protocole' => $prestation->protocole,
                    'date_debut' => $prestation->date_debut,
                    'date_fin' => $prestation->date_fin,
                ]);
            }

            // Appliquer les modifications aux prestations si fournies
            if (isset($modifications['prestations']) && is_array($modifications['prestations'])) {
                foreach ($modifications['prestations'] as $modification) {
                    if (isset($modification['id'])) {
                        // Modifier une prestation existante
                        $prestation = $nouveauPlan->prestations()->find($modification['id']);
                        if ($prestation) {
                            $prestation->update($modification);
                        }
                    } else {
                        // Ajouter une nouvelle prestation
                        $this->ajouterPrestation($nouveauPlan, $modification);
                    }
                }
            }

            $this->auditService->log('plan_soins_reevaluated', [
                'ancien_plan_id' => $plan->id,
                'nouveau_plan_id' => $nouveauPlan->id,
                'patient_had_id' => $plan->patient_had_id,
                'version' => $nouveauPlan->version,
            ], 'had');

            Log::info('Plan de soins réévalué', [
                'ancien_plan_id' => $plan->id,
                'nouveau_plan_id' => $nouveauPlan->id,
                'patient_had_id' => $plan->patient_had_id,
                'version' => $nouveauPlan->version,
            ]);

            return $nouveauPlan->load(['prestations', 'patientHad', 'creePar']);
        });
    }

    /**
     * Ajouter une prestation à un plan de soins
     */
    private function ajouterPrestation(PlanSoins $plan, array $data): PlanSoinsPrestation
    {
        return PlanSoinsPrestation::create([
            'plan_soins_id' => $plan->id,
            'acte_medical_id' => $data['acte_medical_id'] ?? null,
            'libelle' => $data['libelle'],
            'frequence_type' => $data['frequence_type'],
            'frequence_detail' => $data['frequence_detail'] ?? null,
            'duree_min' => $data['duree_min'] ?? 30,
            'intervenants_profils' => $data['intervenants_profils'] ?? null,
            'materiel_requis' => $data['materiel_requis'] ?? null,
            'protocole' => $data['protocole'] ?? null,
            'date_debut' => $data['date_debut'] ?? $plan->date_debut,
            'date_fin' => $data['date_fin'] ?? $plan->date_fin_prevue,
        ]);
    }

    /**
     * Calculer les dates de visites selon la fréquence
     */
    private function calculerDatesVisites(PlanSoinsPrestation $prestation, Carbon $dateDebut, Carbon $dateFin): array
    {
        $dates = [];
        $current = $dateDebut->copy();

        switch ($prestation->frequence_type) {
            case 'ponctuelle':
                $dates[] = $current->copy();
                break;

            case 'quotidienne':
                while ($current->lte($dateFin)) {
                    $dates[] = $current->copy();
                    $current->addDay();
                }
                break;

            case 'hebdomadaire':
                $joursSemaine = $prestation->getJoursSemaine();
                if (empty($joursSemaine)) {
                    $joursSemaine = ['lundi']; // Par défaut
                }

                while ($current->lte($dateFin)) {
                    if (in_array(strtolower($current->format('l')), array_map('strtolower', $joursSemaine))) {
                        $dates[] = $current->copy();
                    }
                    $current->addDay();
                }
                break;

            case 'personnalisee':
                $joursSemaine = $prestation->getJoursSemaine();
                while ($current->lte($dateFin)) {
                    if (in_array(strtolower($current->format('l')), array_map('strtolower', $joursSemaine))) {
                        $dates[] = $current->copy();
                    }
                    $current->addDay();
                }
                break;
        }

        return $dates;
    }

    /**
     * Obtenir l'heure prévue pour une visite
     */
    private function getHeurePrevue(PlanSoinsPrestation $prestation, Carbon $date): Carbon
    {
        $heurePrevue = $prestation->getHeurePrevue();
        
        if ($heurePrevue) {
            return $date->copy()->setTimeFromTimeString($heurePrevue);
        }

        // Heure par défaut selon le type de prestation
        return $date->copy()->setTime(9, 0);
    }

    /**
     * Obtenir le plan actif d'un patient
     */
    public function getPlanActif(int $patientHadId): ?PlanSoins
    {
        return PlanSoins::where('patient_had_id', $patientHadId)
            ->where('statut', 'actif')
            ->with(['prestations', 'patientHad', 'creePar'])
            ->first();
    }

    /**
     * Obtenir tous les plans d'un patient
     */
    public function getPlansPatient(int $patientHadId): Collection
    {
        return PlanSoins::where('patient_had_id', $patientHadId)
            ->with(['prestations', 'patientHad', 'creePar'])
            ->orderBy('version', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
