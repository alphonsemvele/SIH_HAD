<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisiteHadResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Aligné sur le vrai schéma visite_hads.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                    => (int) $this->id,
            'tournee_id'            => (int) $this->tournee_id,
            'patient_id'            => (int) $this->patient_id,
            'ordre'                 => (int) ($this->ordre ?? 0),
            'priorite'              => $this->priorite,
            'chambre'               => $this->chambre,
            'lit'                   => $this->lit,
            'diagnostic'            => $this->diagnostic,
            'jours_hospitalisation' => (int) ($this->jours_hospitalisation ?? 0),
            'duree_prevue'          => (int) ($this->duree_prevue ?? 60),
            'heure_prevue'          => $this->heure_prevue?->toIso8601String(),
            'visite_at'             => $this->visite_at?->toIso8601String(),
            'observations'          => $this->observations,
            'notes_soignant'        => $this->notes_soignant,
            'temperature'           => $this->temperature,
            'tension'               => $this->tension,
            'pouls'                 => $this->pouls,
            'saturation'            => $this->saturation,
            'patient'               => $this->whenLoaded('patient', function () {
                return [
                    'id'              => (int) $this->patient->id,
                    'nom'             => $this->patient->nom,
                    'prenom'          => $this->patient->prenom,
                    'sexe'            => $this->patient->sexe,
                    'date_naissance'  => $this->patient->date_naissance?->toDateString(),
                    'telephone'       => $this->patient->telephone,
                    'adresse'         => $this->patient->adresse,
                    'ville'           => $this->patient->ville,
                ];
            }),
        ];
    }
}
