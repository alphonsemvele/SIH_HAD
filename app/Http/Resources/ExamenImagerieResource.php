<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamenImagerieResource extends JsonResource
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
            'radiologue_id' => $this->radiologue_id,
            'manipulateur_id' => $this->manipulateur_id,
            'type_examen_id' => $this->type_examen_id,
            'date_prescription' => $this->date_prescription,
            'date_examen' => $this->date_examen,
            'date_resultat' => $this->date_resultat,
            'indication_clinique' => $this->indication_clinique,
            'technique' => $this->technique,
            'resultat' => $this->resultat,
            'conclusion' => $this->conclusion,
            'images_path' => $this->images_path,
            'urgent' => $this->urgent,
            'statut' => $this->statut,
            'type_examen_imagerie_id' => $this->type_examen_imagerie_id,
        ];
    }
}
