<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientHadResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'medecin_referent_id' => $this->medecin_referent_id,
            'date_inclusion' => $this->date_inclusion,
            'date_sortie' => $this->date_sortie,
            'motif_inclusion' => $this->motif_inclusion,
            'motif_sortie' => $this->motif_sortie,
            'adresse_domicile' => $this->adresse_domicile,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'personne_reference_nom' => $this->personne_reference_nom,
            'personne_reference_telephone' => $this->personne_reference_telephone,
            'personne_reference_lien' => $this->personne_reference_lien,
            'protocole_soins' => $this->protocole_soins,
            'frequence_visites' => $this->frequence_visites,
            'equipements_domicile' => $this->equipements_domicile,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'visiteHads' => VisiteHadCollection::make($this->whenLoaded('visiteHads')),
        ];
    }
}
