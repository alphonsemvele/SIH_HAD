<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyseLaboratoireResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'patient_id' => $this->patient_id,
            'consultation_id' => $this->consultation_id,
            'medecin_prescripteur_id' => $this->medecin_prescripteur_id,
            'technicien_id' => $this->technicien_id,
            'biologiste_id' => $this->biologiste_id,
            'type_analyse_id' => $this->type_analyse_id,
            'date_prescription' => $this->date_prescription,
            'date_prelevement' => $this->date_prelevement,
            'date_resultat' => $this->date_resultat,
            'resultat' => $this->resultat,
            'interpretation' => $this->interpretation,
            'conclusion' => $this->conclusion,
            'commentaire_medecin' => $this->commentaire_medecin,
            'urgent' => $this->urgent,
            'statut' => $this->statut,
            'typeAnalyse' => TypeAnalyseResource::make($this->whenLoaded('typeAnalyse')),
        ];
    }
}
