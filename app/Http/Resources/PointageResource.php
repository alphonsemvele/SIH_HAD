<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PointageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'date' => $this->date,
            'heure_arrivee' => $this->heure_arrivee,
            'heure_depart' => $this->heure_depart,
            'type' => $this->type,
            'equipe' => $this->equipe,
            'source' => $this->source,
            'localisation' => $this->localisation,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'user' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}
