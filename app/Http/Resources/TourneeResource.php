<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourneeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date,
            'soignant_id' => $this->soignant_id,
            'vehicule' => $this->vehicule,
            'heure_debut_prevue' => $this->heure_debut_prevue,
            'heure_fin_prevue' => $this->heure_fin_prevue,
            'heure_debut_effective' => $this->heure_debut_effective,
            'heure_fin_effective' => $this->heure_fin_effective,
            'kilometres' => $this->kilometres,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'visiteHads' => VisiteHadCollection::make($this->whenLoaded('visiteHads')),
        ];
    }
}
