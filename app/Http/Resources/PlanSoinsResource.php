<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanSoinsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_had_id' => $this->patient_had_id,
            'patient_had' => $this->whenLoaded('patientHad', function () {
                return [
                    'id' => $this->patientHad->id,
                    'nom' => $this->patientHad->nom,
                    'prenom' => $this->patientHad->prenom,
                    'date_naissance' => $this->patientHad->date_naissance,
                    'numero_ipp' => $this->patientHad->numero_ipp,
                ];
            }),
            'cree_par' => $this->whenLoaded('creePar', function () {
                return [
                    'id' => $this->creePar->id,
                    'nom' => $this->creePar->nom,
                    'prenom' => $this->creePar->prenom,
                    'fonction' => $this->creePar->fonction,
                ];
            }),
            'date_debut' => $this->date_debut,
            'date_fin_prevue' => $this->date_fin_prevue,
            'reevaluation_prevue_le' => $this->reevaluation_prevue_le,
            'statut' => $this->statut,
            'version' => $this->version,
            'plan_precedent_id' => $this->plan_precedent_id,
            'plan_precedent' => $this->whenLoaded('planPrecedent', function () {
                return [
                    'id' => $this->planPrecedent->id,
                    'version' => $this->planPrecedent->version,
                    'statut' => $this->planPrecedent->statut,
                ];
            }),
            'objectifs' => $this->objectifs,
            'prestations' => $this->whenLoaded('prestations', function () {
                return $this->prestations->map(function ($prestation) {
                    return [
                        'id' => $prestation->id,
                        'libelle' => $prestation->libelle,
                        'frequence_type' => $prestation->frequence_type,
                        'frequence_detail' => $prestation->frequence_detail,
                        'duree_min' => $prestation->duree_min,
                        'acte_medical' => $prestation->whenLoaded('acteMedical', function () use ($prestation) {
                            return $prestation->acteMedical ? [
                                'id' => $prestation->acteMedical->id,
                                'code' => $prestation->acteMedical->code,
                                'libelle' => $prestation->acteMedical->libelle,
                            ] : null;
                        }),
                        'intervenants_profils' => $prestation->intervenants_profils,
                        'materiel_requis' => $prestation->materiel_requis,
                        'protocole' => $prestation->protocole,
                        'date_debut' => $prestation->date_debut,
                        'date_fin' => $prestation->date_fin,
                        'created_at' => $prestation->created_at,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
