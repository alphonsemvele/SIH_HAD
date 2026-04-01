<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConstanteVitaleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'admission_id' => $this->admission_id,
            'user_id' => $this->user_id,
            'date_mesure' => $this->date_mesure,
            'poids' => $this->poids,
            'taille' => $this->taille,
            'temperature' => $this->temperature,
            'tension_systolique' => $this->tension_systolique,
            'tension_diastolique' => $this->tension_diastolique,
            'frequence_cardiaque' => $this->frequence_cardiaque,
            'frequence_respiratoire' => $this->frequence_respiratoire,
            'saturation_oxygene' => $this->saturation_oxygene,
            'glycemie' => $this->glycemie,
            'score_douleur' => $this->score_douleur,
            'notes' => $this->notes,
            'user' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}
