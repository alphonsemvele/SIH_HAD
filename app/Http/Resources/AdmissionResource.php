<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmissionResource extends JsonResource
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
            'service_id' => $this->service_id,
            'lit_id' => $this->lit_id,
            'medecin_id' => $this->medecin_id,
            'type' => $this->type,
            'motif' => $this->motif,
            'diagnostic_entree' => $this->diagnostic_entree,
            'diagnostic_sortie' => $this->diagnostic_sortie,
            'date_admission' => $this->date_admission,
            'date_sortie' => $this->date_sortie,
            'mode_sortie' => $this->mode_sortie,
            'accompagnant_nom' => $this->accompagnant_nom,
            'accompagnant_telephone' => $this->accompagnant_telephone,
            'accompagnant_lien' => $this->accompagnant_lien,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'acteMedicals' => ActeMedicalCollection::make($this->whenLoaded('acteMedicals')),
        ];
    }
}
