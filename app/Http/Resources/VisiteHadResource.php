<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisiteHadResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tournee_id' => $this->tournee_id,
            'patient_had_id' => $this->patient_had_id,
            'ordre' => $this->ordre,
            'heure_prevue' => $this->heure_prevue,
            'heure_arrivee' => $this->heure_arrivee,
            'heure_depart' => $this->heure_depart,
            'latitude_arrivee' => $this->latitude_arrivee,
            'longitude_arrivee' => $this->longitude_arrivee,
            'soins_realises' => $this->soins_realises,
            'observations' => $this->observations,
            'constantes' => $this->constantes,
            'alertes' => $this->alertes,
            'signature_patient' => $this->signature_patient,
            'photos' => $this->photos,
            'statut' => $this->statut,
            'patientHad' => PatientHadResource::make($this->whenLoaded('patientHad')),
        ];
    }
}
