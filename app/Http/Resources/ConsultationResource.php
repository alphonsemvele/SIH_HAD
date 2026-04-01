<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationResource extends JsonResource
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
            'medecin_id' => $this->medecin_id,
            'admission_id' => $this->admission_id,
            'rendez_vous_id' => $this->rendez_vous_id,
            'service_id' => $this->service_id,
            'date_consultation' => $this->date_consultation,
            'motif' => $this->motif,
            'histoire_maladie' => $this->histoire_maladie,
            'examen_clinique' => $this->examen_clinique,
            'hypotheses_diagnostiques' => $this->hypotheses_diagnostiques,
            'diagnostic_principal' => $this->diagnostic_principal,
            'diagnostics_secondaires' => $this->diagnostics_secondaires,
            'conduite_a_tenir' => $this->conduite_a_tenir,
            'recommandations' => $this->recommandations,
            'prochain_rdv' => $this->prochain_rdv,
            'duree_minutes' => $this->duree_minutes,
            'statut' => $this->statut,
            'service' => ServiceResource::make($this->whenLoaded('service')),
            'acteMedicals' => ActeMedicalCollection::make($this->whenLoaded('acteMedicals')),
        ];
    }
}
